'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useSettings } from '@/hooks/use-settings'
import { apiGet } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, MapPin, Users, Building2, Newspaper, FileText, Image as ImageIcon, ArrowRight, Quote, Activity, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import type { Berita, Artikel, Kegiatan, Agenda, Galeri } from '@/lib/types'

export function Beranda() {
  const { settings } = useSettings()
  const { goToPublic } = useAppStore()
  const [stats, setStats] = useState({ totalPengurus: 0, totalDesa: 0, totalKegiatan: 0, totalBerita: 0 })
  const [berita, setBerita] = useState<Berita[]>([])
  const [artikel, setArtikel] = useState<Artikel[]>([])
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>([])
  const [agenda, setAgenda] = useState<Agenda[]>([])
  const [galeri, setGaleri] = useState<Galeri[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    Promise.all([
      apiGet<{ totalPengurus: number; totalDesa: number; totalKegiatan: number; totalBerita: number }>('/api/stats'),
      apiGet<{ berita: Berita[] }>('/api/berita?limit=6'),
      apiGet<{ artikel: Artikel[] }>('/api/artikel?limit=6'),
      apiGet<{ kegiatan: Kegiatan[] }>('/api/kegiatan?limit=6'),
      apiGet<{ agenda: Agenda[] }>('/api/agenda?limit=5'),
      apiGet<{ galeri: Galeri[] }>('/api/galeri?limit=8'),
    ]).then(([s, b, a, k, ag, g]) => {
      setStats(s)
      setBerita(b.berita)
      setArtikel(a.artikel)
      setKegiatan(k.kegiatan)
      setAgenda(ag.agenda)
      setGaleri(g.galeri)
    })
  }, [])

  // Hero slider
  const slides = [
    { image: settings.hero_image || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&q=80', title: settings.hero_title || 'Persatuan Perangkat Desa Indonesia', subtitle: settings.hero_subtitle || 'Kecamatan Cikampek' },
    { image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80', title: 'Pelayanan Publik Profesional', subtitle: 'Berintegritas & Berkualitas' },
    { image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1920&q=80', title: 'Penguatan Kapasitas', subtitle: 'Perangkat Desa Cikampek' },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const statsCards = [
    { label: 'Pengurus', value: stats.totalPengurus, icon: Users, color: 'text-primary' },
    { label: 'Desa', value: stats.totalDesa, icon: Building2, color: 'text-gold' },
    { label: 'Kegiatan', value: stats.totalKegiatan, icon: Activity, color: 'text-primary' },
    { label: 'Berita', value: stats.totalBerita, icon: Newspaper, color: 'text-gold' },
  ]

  return (
    <div>
      {/* Hero Slider */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-navy/90 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
              <div className="text-center text-primary-foreground max-w-4xl">
                <Badge className="mb-4 bg-gold text-gold-foreground hover:bg-gold">{slide.subtitle}</Badge>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-balance">
                  {slide.title}
                </h1>
                <p className="text-base md:text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-8 text-pretty">
                  {settings.hero_description || settings.org_tagline}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => goToPublic('profil')}
                    size="lg"
                    className="bg-gold text-gold-foreground hover:bg-gold/90"
                  >
                    Lihat Profil
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => goToPublic('berita')}
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground/30 text-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    Berita Terbaru
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 flex items-center justify-center text-primary-foreground"
          aria-label="Sebelumnya"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 flex items-center justify-center text-primary-foreground"
          aria-label="Berikutnya"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-gold' : 'w-2 bg-primary-foreground/50'
                }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Statistics */}
      <section className="py-12 bg-background -mt-16 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} className="text-center p-6 shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-primary">
                  <CardContent className="p-0">
                    <div className={`w-12 h-12 mx-auto rounded-full bg-accent flex items-center justify-center mb-3 ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sambutan Ketua */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
            <div className="md:col-span-1">
              <div className="relative">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={settings.ketua_foto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80'}
                    alt={settings.ketua_nama || 'Ketua PPDI'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 gradient-gold rounded-2xl flex items-center justify-center shadow-gold">
                  <Quote className="h-10 w-10 text-gold-foreground" />
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <Badge className="mb-3 bg-gold text-gold-foreground hover:bg-gold">Sambutan Ketua</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {settings.ketua_nama || 'Ahmad Fauzi, S.IP'}
              </h2>
              <p className="text-sm text-primary font-medium mb-4">Ketua PPDI Kecamatan Cikampek</p>
              <div className="prose-content text-muted-foreground text-sm md:text-base leading-relaxed">
                <p>{settings.ketua_sambutan}</p>
              </div>
              <Button
                onClick={() => goToPublic('profil')}
                variant="outline"
                className="mt-6"
              >
                Profil Lengkap
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Agenda Terdekat + Berita Terbaru */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Agenda */}
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gold" />
                  Agenda Terdekat
                </h2>
                <Button variant="ghost" size="sm" onClick={() => goToPublic('agenda')}>
                  Lihat semua <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-3">
                {agenda.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">Belum ada agenda mendatang</p>
                )}
                {agenda.map((a) => (
                  <Card key={a.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => goToPublic('agenda')}>
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg gradient-navy flex flex-col items-center justify-center text-primary-foreground shrink-0">
                        <span className="text-xs font-medium opacity-80">{format(new Date(a.tanggalMulai), 'MMM', { locale: localeId })}</span>
                        <span className="text-lg font-bold leading-none">{format(new Date(a.tanggalMulai), 'd')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-foreground line-clamp-2">{a.namaAgenda}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{a.lokasi || 'Lokasi TBD'}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Berita */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-primary" />
                  Berita Terbaru
                </h2>
                <Button variant="ghost" size="sm" onClick={() => goToPublic('berita')}>
                  Lihat semua <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {berita.slice(0, 4).map((b) => (
                  <Card
                    key={b.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => goToPublic('berita-detail', { slug: b.slug })}
                  >
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={b.thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80'}
                        alt={b.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2 text-xs">{b.kategori}</Badge>
                      <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {b.judul}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(b.publishedAt || b.createdAt), 'd MMM yyyy', { locale: localeId })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artikel Terbaru */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Badge className="mb-2 bg-gold text-gold-foreground hover:bg-gold">Artikel</Badge>
              <h2 className="text-2xl font-bold text-foreground">Artikel Terbaru</h2>
            </div>
            <Button variant="outline" onClick={() => goToPublic('artikel')}>
              Lihat semua <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artikel.map((a) => (
              <Card
                key={a.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => goToPublic('artikel-detail', { slug: a.slug })}
              >
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={a.thumbnail || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80'}
                    alt={a.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-5">
                  <Badge variant="outline" className="mb-2 text-xs">{a.kategori}</Badge>
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                    {a.judul}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {a.ringkasan}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span>{a.penulis}</span>
                    <span>•</span>
                    <span>{format(new Date(a.publishedAt || a.createdAt), 'd MMM yyyy', { locale: localeId })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Kegiatan Terbaru */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Badge className="mb-2 bg-primary text-primary-foreground hover:bg-primary">Kegiatan</Badge>
              <h2 className="text-2xl font-bold text-foreground">Kegiatan Terbaru</h2>
            </div>
            <Button variant="outline" onClick={() => goToPublic('kegiatan')}>
              Lihat semua <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kegiatan.slice(0, 3).map((k) => {
              const fotos = k.fotos ? JSON.parse(k.fotos) as string[] : []
              return (
                <Card
                  key={k.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => goToPublic('kegiatan-detail', { slug: k.slug })}
                >
                  <div className="aspect-video overflow-hidden bg-muted relative">
                    <img
                      src={fotos[0] || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&q=80'}
                      alt={k.namaKegiatan}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <div className="bg-card/90 backdrop-blur rounded-lg px-3 py-1.5 text-center">
                        <div className="text-xs text-muted-foreground">{format(new Date(k.tanggal), 'MMM', { locale: localeId })}</div>
                        <div className="text-lg font-bold text-primary leading-none">{format(new Date(k.tanggal), 'd')}</div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                      {k.namaKegiatan}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{k.lokasi}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Galeri Foto */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Badge className="mb-2 bg-gold text-gold-foreground hover:bg-gold">Galeri</Badge>
              <h2 className="text-2xl font-bold text-foreground">Galeri Foto</h2>
            </div>
            <Button variant="outline" onClick={() => goToPublic('galeri')}>
              Lihat semua <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galeri.filter(g => g.kategori === 'FOTO').slice(0, 8).map((g) => (
              <div
                key={g.id}
                className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer group relative"
                onClick={() => goToPublic('galeri')}
              >
                <img
                  src={g.url}
                  alt={g.judul}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-white text-xs font-medium line-clamp-2">{g.judul}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-navy">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Bergabung Bersama Kami Membangun Desa
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Mari berkolaborasi untuk mewujudkan pelayanan publik yang profesional dan berintegritas di Kecamatan Cikampek
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => goToPublic('kontak')} size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
              Hubungi Kami
            </Button>
            <Button onClick={() => goToPublic('download')} size="lg" variant="outline" className="border-primary-foreground/30 text-foreground hover:bg-primary-foreground/10">
              Dokumen
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
