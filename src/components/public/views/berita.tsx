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
  Newspaper, Search, Calendar, Eye, User, ArrowLeft, ArrowRight,
  ChevronLeft, ChevronRight, Share2, Facebook, Twitter, Link2, Tag,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import type { Berita } from '@/lib/types'
import { truncate, stripHtml } from '@/lib/types'

const PER_PAGE = 6

const FALLBACK_THUMB = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80'

export function BeritaList() {
  const { goToPublic } = useAppStore()
  const [berita, setBerita] = useState<Berita[]>([])
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
      apiGet<{ berita: Berita[] }>(`/api/berita?${params.toString()}`)
        .then((data) => {
          setBerita(data.berita)
          setPage(1)
        })
        .catch(() => setBerita([]))
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(t)
  }, [search, kategori])

  const kategoriOptions = useMemo(() => {
    const set = new Set(berita.map((b) => b.kategori))
    return ['all', ...Array.from(set)]
  }, [berita])

  const filtered = berita
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      {/* Header */}
      <section className="gradient-navy py-16 md:py-20">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <Badge className="mb-3 bg-gold text-gold-foreground hover:bg-gold">Berita</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Berita & Informasi</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-sm md:text-base">
            Kabar terbaru seputar kegiatan organisasi dan pemerintahan desa di Kecamatan Cikampek.
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
                  placeholder="Cari berita..."
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
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Tidak ada berita ditemukan</h3>
              <p className="text-sm text-muted-foreground">Coba ubah filter pencarian Anda.</p>
            </Card>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {current.map((b) => (
                  <Card
                    key={b.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
                    onClick={() => goToPublic('berita-detail', { slug: b.slug })}
                  >
                    <div className="aspect-video overflow-hidden bg-muted relative">
                      <img
                        src={b.thumbnail || FALLBACK_THUMB}
                        alt={b.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-3 left-3 bg-gold text-gold-foreground hover:bg-gold">
                        {b.kategori}
                      </Badge>
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                        {b.judul}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                        {b.ringkasan || truncate(stripHtml(b.isi), 120)}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(b.publishedAt || b.createdAt), 'd MMM yyyy', { locale: localeId })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {b.viewCount}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
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

export function BeritaDetail() {
  const { currentParams, goToPublic } = useAppStore()
  const slug = currentParams.slug || ''
  const [berita, setBerita] = useState<Berita | null>(null)
  const [related, setRelated] = useState<Berita[]>([])
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
      apiGet<{ berita: Berita; related: Berita[] }>(`/api/berita/by-slug/${slug}`)
        .then((data) => {
          if (cancelled) return
          setBerita(data.berita)
          setRelated(data.related || [])
        })
        .catch(() => { if (!cancelled) setNotFound(true) })
        .finally(() => { if (!cancelled) setLoading(false) })
    })
    return () => { cancelled = true }
  }, [slug])

  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    // App menggunakan routing internal (Zustand). Pastikan URL yang dibagikan selalu mengarah ke detail berita.
    // Path detail di UI adalah: /berita-detail
    return `${window.location.origin}/${berita?.slug ? `berita/${berita.slug}` : `berita/${slug}`}`
  }

  const handleShare = async (platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy') => {
    const url = getShareUrl()
    const text = berita?.judul || ''

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

  if (notFound || !berita) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <Newspaper className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Berita tidak ditemukan</h1>
        <p className="text-muted-foreground mb-6">Berita yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Button onClick={() => goToPublic('berita')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Berita
        </Button>
      </div>
    )
  }

  const tags = berita.tags ? berita.tags.split(',').map((t) => t.trim()).filter(Boolean) : []

  return (
    <div>
      {/* Header */}
      <section className="gradient-navy py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl text-primary-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToPublic('berita')}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
          <Badge className="mb-3 bg-gold text-gold-foreground hover:bg-gold">{berita.kategori}</Badge>
          <h1 className="text-2xl md:text-4xl font-bold mb-4 text-balance">{berita.judul}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/80">
            <span className="flex items-center gap-1.5">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-gold text-gold-foreground text-xs">
                  {(berita.penulis || 'A').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {berita.penulis || 'Admin PPDI'}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {format(new Date(berita.publishedAt || berita.createdAt), 'd MMMM yyyy', { locale: localeId })}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" /> {berita.viewCount}x dilihat
            </span>
          </div>
        </div>
      </section>

      {/* Thumbnail */}
      {berita.thumbnail && (
        <div className="container mx-auto px-4 -mt-6 relative z-10 max-w-4xl">
          <div className="rounded-xl overflow-hidden shadow-lg aspect-video">
            <img src={berita.thumbnail} alt={berita.judul} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Content */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-3xl">
          {berita.ringkasan && (
            <div className="bg-accent/40 border-l-4 border-gold p-4 rounded-r-lg mb-6 text-foreground italic">
              {berita.ringkasan}
            </div>
          )}
          <div className="prose-content max-w-none" dangerouslySetInnerHTML={{ __html: berita.isi }} />

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
                <Newspaper className="h-5 w-5 text-primary" /> Berita Terkait
              </h2>
              <Button variant="ghost" size="sm" onClick={() => goToPublic('berita')}>
                Lihat semua <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((b) => (
                <Card
                  key={b.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => goToPublic('berita-detail', { slug: b.slug })}
                >
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={b.thumbnail || FALLBACK_THUMB}
                      alt={b.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2 text-xs">{b.kategori}</Badge>
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {b.judul}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(b.publishedAt || b.createdAt), 'd MMM yyyy', { locale: localeId })}
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
