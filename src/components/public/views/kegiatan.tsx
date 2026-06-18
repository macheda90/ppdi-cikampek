'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api-client'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Activity, Calendar, MapPin, ArrowLeft, ArrowRight, User, Image as ImageIcon, PlayCircle,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import type { Kegiatan } from '@/lib/types'
import { truncate, stripHtml } from '@/lib/types'

const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&q=80'

export function KegiatanList() {
  const { goToPublic } = useAppStore()
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<{ kegiatan: Kegiatan[] }>('/api/kegiatan')
      .then((data) => setKegiatan(data.kegiatan))
      .catch(() => setKegiatan([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Header */}
      <section className="gradient-navy py-16 md:py-20">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <Badge className="mb-3 bg-gold text-gold-foreground hover:bg-gold">Kegiatan</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Kegiatan & Dokumentasi</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-sm md:text-base">
            Dokumentasi berbagai kegiatan PPDI Kecamatan Cikampek dalam memperkuat kapasitas dan sinergi perangkat desa.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : kegiatan.length === 0 ? (
            <Card className="p-12 text-center">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Belum ada kegiatan</h3>
              <p className="text-sm text-muted-foreground">Dokumentasi kegiatan akan ditampilkan di sini.</p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {kegiatan.map((k) => {
                const fotos = safeParseFotos(k.fotos)
                return (
                  <Card
                    key={k.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
                    onClick={() => goToPublic('kegiatan-detail', { slug: k.slug })}
                  >
                    <div className="aspect-video overflow-hidden bg-muted relative">
                      <img
                        src={fotos[0] || FALLBACK_PHOTO}
                        alt={k.namaKegiatan}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <div className="bg-card/95 backdrop-blur rounded-lg px-3 py-1.5 text-center shadow-md">
                          <div className="text-[10px] uppercase text-muted-foreground font-medium">
                            {format(new Date(k.tanggal), 'MMM', { locale: localeId })}
                          </div>
                          <div className="text-lg font-bold text-primary leading-none">
                            {format(new Date(k.tanggal), 'd')}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {format(new Date(k.tanggal), 'yyyy')}
                          </div>
                        </div>
                      </div>
                      {fotos.length > 1 && (
                        <Badge className="absolute top-3 right-3 bg-card/95 text-foreground hover:bg-card">
                          <ImageIcon className="h-3 w-3 mr-1" /> {fotos.length}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                        {k.namaKegiatan}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                        {k.deskripsi ? truncate(stripHtml(k.deskripsi), 100) : 'Kegiatan PPDI Kecamatan Cikampek.'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                        <MapPin className="h-3 w-3 text-gold" />
                        <span className="truncate">{k.lokasi || 'Lokasi TBD'}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export function KegiatanDetail() {
  const { currentParams, goToPublic } = useAppStore()
  const slug = currentParams.slug || ''
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    Promise.resolve().then(() => {
      if (cancelled) return
      setLoading(true)
      setNotFound(false)
      apiGet<{ kegiatan: Kegiatan }>(`/api/kegiatan/by-slug/${slug}`)
        .then((data) => { if (!cancelled) setKegiatan(data.kegiatan) })
        .catch(() => { if (!cancelled) setNotFound(true) })
        .finally(() => { if (!cancelled) setLoading(false) })
    })
    return () => { cancelled = true }
  }, [slug])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxIndex])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-5 w-64 mb-8" />
        <Skeleton className="aspect-video w-full mb-8 rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (notFound || !kegiatan) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Kegiatan tidak ditemukan</h1>
        <p className="text-muted-foreground mb-6">Kegiatan yang Anda cari tidak tersedia.</p>
        <Button onClick={() => goToPublic('kegiatan')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Kegiatan
        </Button>
      </div>
    )
  }

  const fotos = safeParseFotos(kegiatan.fotos)
  const videoId = getYouTubeId(kegiatan.videoUrl)

  return (
    <div>
      {/* Header */}
      <section className="gradient-navy py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl text-primary-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToPublic('kegiatan')}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
          <Badge className="mb-3 bg-gold text-gold-foreground hover:bg-gold">Kegiatan</Badge>
          <h1 className="text-2xl md:text-4xl font-bold mb-4 text-balance">{kegiatan.namaKegiatan}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/80">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {format(new Date(kegiatan.tanggal), 'EEEE, d MMMM yyyy', { locale: localeId })}
            </span>
            {kegiatan.lokasi && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {kegiatan.lokasi}
              </span>
            )}
            {kegiatan.penanggungJawab && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" /> {kegiatan.penanggungJawab}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main photo */}
      {fotos[0] && (
        <div className="container mx-auto px-4 -mt-6 relative z-10 max-w-4xl">
          <div className="rounded-xl overflow-hidden shadow-lg aspect-video cursor-pointer" onClick={() => setLightboxIndex(0)}>
            <img src={fotos[0]} alt={kegiatan.namaKegiatan} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Content */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            <InfoCard icon={Calendar} label="Tanggal" value={format(new Date(kegiatan.tanggal), 'd MMM yyyy', { locale: localeId })} />
            <InfoCard icon={MapPin} label="Lokasi" value={kegiatan.lokasi || '-'} />
            <InfoCard icon={User} label="Penanggung Jawab" value={kegiatan.penanggungJawab || '-'} />
          </div>

          {kegiatan.deskripsi ? (
            <div className="prose-content max-w-none" dangerouslySetInnerHTML={{ __html: kegiatan.deskripsi }} />
          ) : (
            <p className="text-muted-foreground">Tidak ada deskripsi kegiatan.</p>
          )}

          {/* Video */}
          {videoId && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" /> Dokumentasi Video
              </h2>
              <div className="aspect-video rounded-xl overflow-hidden shadow-md">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={kegiatan.namaKegiatan}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Gallery */}
          {fotos.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" /> Galeri Foto ({fotos.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fotos.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className="aspect-square rounded-lg overflow-hidden bg-muted group relative"
                  >
                    <img
                      src={url}
                      alt={`${kegiatan.namaKegiatan} - Foto ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && fotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            onClick={() => setLightboxIndex(null)}
            aria-label="Tutup"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 disabled:opacity-30"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex((i) => (i! - 1 + fotos.length) % fotos.length)
            }}
            disabled={fotos.length <= 1}
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <img
            src={fotos[lightboxIndex]}
            alt={`${kegiatan.namaKegiatan} - Foto ${lightboxIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 disabled:opacity-30"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex((i) => (i! + 1) % fotos.length)
            }}
            disabled={fotos.length <= 1}
            aria-label="Berikutnya"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {lightboxIndex + 1} / {fotos.length}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <div className="text-sm font-semibold text-foreground line-clamp-1">{value}</div>
    </Card>
  )
}

function safeParseFotos(s: string | null): string[] {
  if (!s) return []
  try {
    const arr = JSON.parse(s)
    if (Array.isArray(arr)) return arr.filter((x) => typeof x === 'string')
    return []
  } catch {
    return []
  }
}

function getYouTubeId(url: string | null): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([A-Za-z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}
