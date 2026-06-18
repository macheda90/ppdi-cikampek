'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api-client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogTitle,
} from '@/components/ui/dialog'
import {
  Image as ImageIcon, Video as VideoIcon, Play, ChevronLeft, ChevronRight, X, Calendar,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import type { Galeri } from '@/lib/types'

export function GaleriPage() {
  const [tab, setTab] = useState<'FOTO' | 'VIDEO'>('FOTO')
  const [foto, setFoto] = useState<Galeri[]>([])
  const [video, setVideo] = useState<Galeri[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiGet<{ galeri: Galeri[] }>('/api/galeri?kategori=FOTO'),
      apiGet<{ galeri: Galeri[] }>('/api/galeri?kategori=VIDEO'),
    ])
      .then(([f, v]) => {
        setFoto(f.galeri)
        setVideo(v.galeri)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Header */}
      <section className="gradient-navy py-16 md:py-20">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <Badge className="mb-3 bg-gold text-gold-foreground hover:bg-gold">Galeri</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Galeri Foto & Video</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-sm md:text-base">
            Dokumentasi visual berbagai kegiatan dan momen penting PPDI Kecamatan Cikampek.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'FOTO' | 'VIDEO')}>
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="FOTO" className="gap-1.5">
                  <ImageIcon className="h-4 w-4" /> Foto
                  {!loading && foto.length > 0 && (
                    <span className="ml-1 text-xs bg-accent text-accent-foreground rounded-full px-1.5">
                      {foto.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="VIDEO" className="gap-1.5">
                  <VideoIcon className="h-4 w-4" /> Video
                  {!loading && video.length > 0 && (
                    <span className="ml-1 text-xs bg-accent text-accent-foreground rounded-full px-1.5">
                      {video.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="FOTO">
              <FotoGallery items={foto} loading={loading} />
            </TabsContent>

            <TabsContent value="VIDEO">
              <VideoGallery items={video} loading={loading} />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}

function FotoGallery({ items, loading }: { items: Galeri[]; loading: boolean }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

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

  // Reset lightbox when items change
  useEffect(() => {
    // defer to avoid synchronous setState in effect
    const t = setTimeout(() => setLightboxIndex(null), 0)
    return () => clearTimeout(t)
  }, [items])

  if (loading) {
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={`rounded-lg ${i % 3 === 0 ? 'h-72' : i % 3 === 1 ? 'h-52' : 'h-64'} w-full`} />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Belum ada foto</h3>
        <p className="text-sm text-muted-foreground">Dokumentasi foto akan ditampilkan di sini.</p>
      </Card>
    )
  }

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {items.map((g, i) => (
          <button
            key={g.id}
            onClick={() => setLightboxIndex(i)}
            className="block w-full mb-4 break-inside-avoid rounded-lg overflow-hidden bg-muted group relative"
          >
            <img
              src={g.url}
              alt={g.judul}
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-left">
              <p className="text-white text-sm font-medium line-clamp-2">{g.judul}</p>
              <p className="text-white/70 text-xs mt-0.5">
                {format(new Date(g.createdAt), 'd MMM yyyy', { locale: localeId })}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && items[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
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
              setLightboxIndex((i) => (i! - 1 + items.length) % items.length)
            }}
            disabled={items.length <= 1}
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={items[lightboxIndex].url}
              alt={items[lightboxIndex].judul}
              className="max-w-full max-h-[75vh] object-contain"
            />
            <div className="text-center mt-4 text-white">
              <p className="font-medium">{items[lightboxIndex].judul}</p>
              {items[lightboxIndex].deskripsi && (
                <p className="text-sm text-white/70 mt-1">{items[lightboxIndex].deskripsi}</p>
              )}
              <p className="text-xs text-white/50 mt-1">
                {lightboxIndex + 1} / {items.length} · {format(new Date(items[lightboxIndex].createdAt), 'd MMMM yyyy', { locale: localeId })}
              </p>
            </div>
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 disabled:opacity-30"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex((i) => (i! + 1) % items.length)
            }}
            disabled={items.length <= 1}
            aria-label="Berikutnya"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      )}
    </>
  )
}

function VideoGallery({ items, loading }: { items: Galeri[]; loading: boolean }) {
  const [openVideo, setOpenVideo] = useState<Galeri | null>(null)

  useEffect(() => {
    if (openVideo) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [openVideo])

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card className="p-12 text-center">
        <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Belum ada video</h3>
        <p className="text-sm text-muted-foreground">Dokumentasi video akan ditampilkan di sini.</p>
      </Card>
    )
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((g) => {
          const videoId = getYouTubeId(g.url)
          return (
            <Card
              key={g.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setOpenVideo(g)}
            >
              <div className="aspect-video overflow-hidden bg-muted relative">
                {videoId ? (
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt={g.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <img
                    src={g.thumbnail || g.url}
                    alt={g.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center text-gold-foreground group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {g.judul}
                </h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(g.createdAt), 'd MMM yyyy', { locale: localeId })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Video Modal */}
      <Dialog open={!!openVideo} onOpenChange={(o) => !o && setOpenVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
          <DialogTitle className="sr-only">{openVideo?.judul}</DialogTitle>
          {openVideo && (
            <div className="flex flex-col">
              <div className="aspect-video">
                {getYouTubeId(openVideo.url) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(openVideo.url)}?autoplay=1`}
                    title={openVideo.judul}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={openVideo.url} controls autoPlay className="w-full h-full" />
                )}
              </div>
              <div className="p-4 bg-card">
                <h3 className="font-semibold text-foreground">{openVideo.judul}</h3>
                {openVideo.deskripsi && (
                  <p className="text-sm text-muted-foreground mt-1">{openVideo.deskripsi}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(openVideo.createdAt), 'd MMMM yyyy', { locale: localeId })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([A-Za-z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}
