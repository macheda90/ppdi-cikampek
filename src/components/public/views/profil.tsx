'use client'

import { useEffect, useState } from 'react'
import { useSettings } from '@/hooks/use-settings'
import { apiGet } from '@/lib/api-client'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollText, Eye, Target, ListChecks, FileText, Network, ArrowRight, Building2 } from 'lucide-react'
import type { Pengurus } from '@/lib/types'

export function Profil() {
  const { settings, loading: settingsLoading } = useSettings()
  const { goToPublic } = useAppStore()
  const [tab, setTab] = useState('sejarah')
  const [pengurus, setPengurus] = useState<Pengurus[]>([])
  const [loadingPengurus, setLoadingPengurus] = useState(false)

  // Fetch pengurus only when struktur tab is opened
  useEffect(() => {
    if (tab !== 'struktur') return
    if (pengurus.length > 0) return
    let cancelled = false
    Promise.resolve().then(() => {
      if (cancelled) return
      setLoadingPengurus(true)
      apiGet<{ pengurus: Pengurus[] }>('/api/pengurus')
        .then((data) => { if (!cancelled) setPengurus(data.pengurus) })
        .catch(() => {})
        .finally(() => { if (!cancelled) setLoadingPengurus(false) })
    })
    return () => { cancelled = true }
  }, [tab, pengurus.length])

  const tabs = [
    { value: 'sejarah', label: 'Sejarah', icon: ScrollText },
    { value: 'visi', label: 'Visi', icon: Eye },
    { value: 'misi', label: 'Misi', icon: ListChecks },
    { value: 'tujuan', label: 'Tujuan', icon: Target },
    { value: 'adart', label: 'AD/ART', icon: FileText },
    { value: 'struktur', label: 'Struktur Organisasi', icon: Network },
  ]

  // Group pengurus by kategori jabatan for org chart layout
  // Note: API returns kategori but Pengurus type doesn't include it; cast for safety.
  const getKategori = (p: Pengurus): string =>
    (p.jabatan as { kategori?: string } | null | undefined)?.kategori || 'ANGGOTA'
  const pimpinan = pengurus.filter((p) => getKategori(p) === 'PIMPINAN')
  const bidang = pengurus.filter((p) => getKategori(p) === 'BIDANG')
  const anggota = pengurus.filter((p) => getKategori(p) === 'ANGGOTA')

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div>
      {/* Page Header */}
      <section className="gradient-navy py-16 md:py-20">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <Badge className="mb-3 bg-gold text-gold-foreground hover:bg-gold">Tentang Kami</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Profil Organisasi</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-sm md:text-base">
            Mengenal lebih dekat sejarah, visi, misi, tujuan, dan struktur organisasi PPDI Kecamatan Cikampek.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <div className="flex justify-center mb-8 overflow-x-auto">
              <TabsList className="flex-wrap h-auto">
                {tabs.map((t) => {
                  const Icon = t.icon
                  return (
                    <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{t.label}</span>
                      <span className="sm:hidden">{t.label.split(' ')[0]}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>

            {/* Sejarah */}
            <TabsContent value="sejarah">
              <ProfilContent
                title="Sejarah PPDI Kecamatan Cikampek"
                icon={ScrollText}
                loading={settingsLoading}
                content={settings.profil_sejarah}
              />
            </TabsContent>

            {/* Visi */}
            <TabsContent value="visi">
              <ProfilContent
                title="Visi"
                icon={Eye}
                loading={settingsLoading}
                content={settings.profil_visi}
                highlight
              />
            </TabsContent>

            {/* Misi */}
            <TabsContent value="misi">
              <ProfilContent
                title="Misi"
                icon={ListChecks}
                loading={settingsLoading}
                content={settings.profil_misi}
              />
            </TabsContent>

            {/* Tujuan */}
            <TabsContent value="tujuan">
              <ProfilContent
                title="Tujuan"
                icon={Target}
                loading={settingsLoading}
                content={settings.profil_tujuan}
              />
            </TabsContent>

            {/* AD/ART */}
            <TabsContent value="adart">
              <ProfilContent
                title="AD/ART"
                icon={FileText}
                loading={settingsLoading}
                content={settings.profil_adart}
              >
                <div className="mt-6 text-center">
                  <Button onClick={() => goToPublic('download')} className="bg-gold text-gold-foreground hover:bg-gold/90">
                    <FileText className="mr-2 h-4 w-4" />
                    Unduh Dokumen AD/ART
                  </Button>
                </div>
              </ProfilContent>
            </TabsContent>

            {/* Struktur Organisasi */}
            <TabsContent value="struktur">
              <Card className="border-t-4 border-t-primary">
                <CardContent className="p-6 md:p-10">
                  <div className="text-center mb-10">
                    <Badge className="mb-3 bg-primary text-primary-foreground hover:bg-primary">Struktur Organisasi</Badge>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Susunan Pengurus PPDI</h2>
                    <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
                      Struktur kepengurusan PPDI Kecamatan Cikampek periode {settings.org_tagline ? '' : ''}saat ini.
                    </p>
                  </div>

                  {loadingPengurus ? (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-xl" />
                      ))}
                    </div>
                  ) : pengurus.length === 0 ? (
                    <div className="text-center py-16">
                      <Network className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">Belum ada data pengurus.</p>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {/* Pimpinan */}
                      {pimpinan.length > 0 && (
                        <OrgSection title="Pimpinan" items={pimpinan} getInitials={getInitials} highlight />
                      )}
                      {bidang.length > 0 && (
                        <OrgSection title="Kepala Bidang" items={bidang} getInitials={getInitials} />
                      )}
                      {anggota.length > 0 && (
                        <OrgSection title="Anggota" items={anggota} getInitials={getInitials} />
                      )}

                      <div className="text-center pt-6 border-t border-border">
                        <Button variant="outline" onClick={() => goToPublic('pengurus')}>
                          Lihat Daftar Pengurus Lengkap
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}

function ProfilContent({
  title,
  icon: Icon,
  loading,
  content,
  highlight = false,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  loading: boolean
  content?: string
  highlight?: boolean
  children?: React.ReactNode
}) {
  return (
    <Card className="border-t-4 border-t-primary">
      <CardContent className="p-6 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : content ? (
          <div className={highlight ? 'bg-accent/40 border-l-4 border-gold p-6 rounded-r-lg' : ''}>
            <div className="prose-content max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        ) : (
          <p className="text-muted-foreground">Konten belum tersedia.</p>
        )}
        {children}
      </CardContent>
    </Card>
  )
}

function OrgSection({
  title,
  items,
  getInitials,
  highlight = false,
}: {
  title: string
  items: Pengurus[]
  getInitials: (name: string) => string
  highlight?: boolean
}) {
  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-5">
        <div className={`h-px flex-1 max-w-[60px] ${highlight ? 'bg-gold' : 'bg-border'}`} />
        <h3 className={`text-sm font-semibold uppercase tracking-wider ${highlight ? 'text-gold' : 'text-muted-foreground'}`}>
          {title}
        </h3>
        <div className={`h-px flex-1 max-w-[60px] ${highlight ? 'bg-gold' : 'bg-border'}`} />
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p) => (
          <Card
            key={p.id}
            className={`text-center p-5 hover:shadow-md transition-shadow ${
              highlight ? 'border-gold/40 shadow-sm' : ''
            }`}
          >
            <div className="flex flex-col items-center">
              <Avatar className={`w-20 h-20 mb-3 border-2 ${highlight ? 'border-gold' : 'border-border'}`}>
                <AvatarImage src={p.foto || undefined} alt={p.namaLengkap} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {getInitials(p.namaLengkap)}
                </AvatarFallback>
              </Avatar>
              <h4 className="font-semibold text-sm text-foreground text-center line-clamp-2">{p.namaLengkap}</h4>
              <Badge
                variant="secondary"
                className={`mt-1.5 text-xs ${highlight ? 'bg-gold/15 text-gold border-gold/30' : ''}`}
              >
                {p.jabatan?.namaJabatan || 'Pengurus'}
              </Badge>
              {p.desa && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate max-w-[140px]">{p.desa.namaDesa}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
