'use client'

import { useEffect, useState, useMemo } from 'react'
import { apiGet } from '@/lib/api-client'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  FileText, Search, Calendar, Eye, ArrowLeft, ArrowRight,
  ChevronLeft, ChevronRight, Share2, Facebook, Twitter, Link2, Tag, User,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import type { Artikel } from '@/lib/types'
import { truncate, stripHtml } from '@/lib/types'

const PER_PAGE = 6
const FALLBACK_THUMB = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80'

export function ArtikelList() {
  const { goToPublic } = useAppStore()
  const [artikel, setArtikel] = useState<Artikel[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const params = new URLSearchParams()
    if (kategori !== 'all') params.set('kategori', kategori)
    if (search.trim()) params.set('search', search.trim())

    const t = setTimeout(() => {
      setLoading(true)
      apiGet<{ artikel: Artikel[] }>(`/api/artikel?${params.toString()}`)
        .then((data) => {
          setArtikel(data.artikel)
          setPage(1)
        })
        .catch(() => setArtikel([]))
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(t)
  }, [search, kategori])

  const kategoriOptions = useMemo(() => {
    const set = new Set(artikel.map((a) => a.kategori))
    return ['all', ...Array.from(set)]
  }, [artikel])

  const totalPages = Math.max(1, Math.ceil(artikel.length / PER_PAGE))
  const current = artikel.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      {/* Header */}
      <section className="gradient-navy py-16 md:py-20">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <Badge className="mb-3 bg-gold text-gold-foreground hover:bg-gold">Artikel</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Artikel & Wawasan</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-sm md:text-base">
            Kumpulan tulisan, pandangan, dan pengetahuan seputar pemerintahan desa dan pelayanan publik.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari artikel..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {kategoriOptions.map((k) => (
                <Button
                  key={k}
                  size="sm"
                  variant={kategori === k ? 'default' : 'outline'}
                  onClick={() => setKategori(k)}
                  className={kategori === k ? 'bg-primary text-primary-foreground' : ''}
                >
                  {k === 'all' ? 'Semua' : k}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : current.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Tidak ada artikel ditemukan</h3>
              <p className="text-sm text-muted-foreground">Coba ubah filter pencarian Anda.</p>
            </Card>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {current.map((a) => (
                  <Card
                    key={a.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
                    onClick={() => goToPublic('artikel-detail', { slug: a.slug })}
                  >
                    <div className="aspect-video overflow-hidden bg-muted relative">
                      <img
                        src={a.thumbnail || FALLBACK_THUMB}
                        alt={a.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground hover:bg-primary">
                        {a.kategori}
                      </Badge>
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                        {a.judul}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                        {a.ringkasan || truncate(stripHtml(a.isi), 120)}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {a.penulis || 'Anonim'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(a.publishedAt || a.createdAt), 'd MMM yyyy', { locale: localeId })}
                        </span>
                        <span className="flex items-center gap-1 ml-auto">
                          <Eye className="h-3 w-3" />
                          {a.viewCount}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setPage(i + 1)}
                      className={page === i + 1 ? 'bg-primary text-primary-foreground' : ''}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export function ArtikelDetail() {
  const { currentParams, goToPublic } = useAppStore()
  const slug = currentParams.slug || ''
  const [artikel, setArtikel] = useState<Artikel | null>(null)
  const [related, setRelated] = useState<Artikel[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    Promise.resolve().then(() => {
      if (cancelled) return
      setLoading(true)
      setNotFound(false)
      apiGet<{ artikel: Artikel; related: Artikel[] }>(`/api/artikel/by-slug/${slug}`)
        .then((data) => {
          if (cancelled) return
          setArtikel(data.artikel)
          setRelated(data.related || [])
        })
        .catch(() => { if (!cancelled) setNotFound(true) })
        .finally(() => { if (!cancelled) setLoading(false) })
    })
    return () => { cancelled = true }
  }, [slug])

  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    // Deployment tidak menyediakan route /artikel/[slug] (yang ada adalah / dengan Zustand view).
    // Buat link publik yang bisa diakses langsung.
    const searchParams = new URLSearchParams({
      view: 'artikel-detail',
      slug: artikel?.slug || slug,
    })
    return `${window.location.origin}/?${searchParams.toString()}`

  }

  const handleShare = async (platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy') => {
    const url = getShareUrl()
    const text = artikel?.judul || ''

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch { }
      return
    }

    if (platform === 'whatsapp') {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`.trim())}`
      window.open(waUrl, '_blank', 'noopener,noreferrer')
      return
    }

    const shareUrl =
      platform === 'facebook'
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        : `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`

    window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-5 w-48 mb-8" />
        <Skeleton className="aspect-video w-full mb-8 rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (notFound || !artikel) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Artikel tidak ditemukan</h1>
        <p className="text-muted-foreground mb-6">Artikel yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Button onClick={() => goToPublic('artikel')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Artikel
        </Button>
      </div>
    )
  }

  const tags = artikel.tags ? artikel.tags.split(',').map((t) => t.trim()).filter(Boolean) : []

  return (
    <div>
      {/* Header */}
      <section className="gradient-navy py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl text-primary-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToPublic('artikel')}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
          <Badge className="mb-3 bg-gold text-gold-foreground hover:bg-gold">{artikel.kategori}</Badge>
          <h1 className="text-2xl md:text-4xl font-bold mb-4 text-balance">{artikel.judul}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/80">
            <span className="flex items-center gap-1.5">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-gold text-gold-foreground text-xs">
                  {(artikel.penulis || 'A').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {artikel.penulis || 'Anonim'}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {format(new Date(artikel.publishedAt || artikel.createdAt), 'd MMMM yyyy', { locale: localeId })}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" /> {artikel.viewCount}x dilihat
            </span>
          </div>
        </div>
      </section>

      {/* Thumbnail */}
      {artikel.thumbnail && (
        <div className="container mx-auto px-4 -mt-6 relative z-10 max-w-4xl">
          <div className="rounded-xl overflow-hidden shadow-lg aspect-video">
            <img src={artikel.thumbnail} alt={artikel.judul} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Content */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-3xl">
          {artikel.ringkasan && (
            <div className="bg-accent/40 border-l-4 border-gold p-4 rounded-r-lg mb-6 text-foreground italic">
              {artikel.ringkasan}
            </div>
          )}
          <div className="prose-content max-w-none" dangerouslySetInnerHTML={{ __html: artikel.isi }} />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="mt-6 pt-6 border-t border-border flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Share2 className="h-4 w-4 text-primary" /> Bagikan:
            </span>
            <Button size="sm" variant="outline" onClick={() => handleShare('facebook')}>
              <Facebook className="h-4 w-4 mr-1.5" /> Facebook
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleShare('twitter')}>
              <Twitter className="h-4 w-4 mr-1.5" /> Twitter
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleShare('whatsapp')}>
              <span className="text-lg leading-none">🟢</span> Whatsapp
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleShare('copy')}>
              <Link2 className="h-4 w-4 mr-1.5" /> {copied ? 'Tersalin!' : 'Salin Tautan'}
            </Button>

          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Artikel Terkait
              </h2>
              <Button variant="ghost" size="sm" onClick={() => goToPublic('artikel')}>
                Lihat semua <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((a) => (
                <Card
                  key={a.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => goToPublic('artikel-detail', { slug: a.slug })}
                >
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={a.thumbnail || FALLBACK_THUMB}
                      alt={a.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2 text-xs">{a.kategori}</Badge>
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {a.judul}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(a.publishedAt || a.createdAt), 'd MMM yyyy', { locale: localeId })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
