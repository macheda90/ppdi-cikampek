'use client'

import { useAppStore, type PublicView } from '@/lib/store'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'
import { Beranda } from './views/beranda'
import { Profil } from './views/profil'
import { PengurusPage } from './views/pengurus'
import { BeritaList, BeritaDetail } from './views/berita'
import { ArtikelList, ArtikelDetail } from './views/artikel'
import { KegiatanList, KegiatanDetail } from './views/kegiatan'
import { AgendaPage } from './views/agenda'
import { GaleriPage } from './views/galeri'
import { DownloadPage } from './views/download'
import { KontakPage } from './views/kontak'

const menuItems: { label: string; view: PublicView }[] = [
  { label: 'Beranda', view: 'beranda' },
  { label: 'Profil', view: 'profil' },
  { label: 'Pengurus', view: 'pengurus' },
  { label: 'Berita', view: 'berita' },
  { label: 'Artikel', view: 'artikel' },
  { label: 'Kegiatan', view: 'kegiatan' },
  { label: 'Agenda', view: 'agenda' },
  { label: 'Galeri', view: 'galeri' },
  { label: 'Download', view: 'download' },
  { label: 'Kontak', view: 'kontak' },
]

export function PublicSite() {
  const { currentView, goToPublic } = useAppStore()

  const renderView = () => {
    switch (currentView) {
      case 'beranda': return <Beranda />
      case 'profil': return <Profil />
      case 'pengurus': return <PengurusPage />
      case 'berita': return <BeritaList />
      case 'berita-detail': return <BeritaDetail />
      case 'artikel': return <ArtikelList />
      case 'artikel-detail': return <ArtikelDetail />
      case 'kegiatan': return <KegiatanList />
      case 'kegiatan-detail': return <KegiatanDetail />
      case 'agenda': return <AgendaPage />
      case 'galeri': return <GaleriPage />
      case 'download': return <DownloadPage />
      case 'kontak': return <KontakPage />
      default: return <Beranda />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader menuItems={menuItems} onNavigate={goToPublic} />
      <main className="flex-1">
        {renderView()}
      </main>
      <SiteFooter menuItems={menuItems} onNavigate={goToPublic} />
    </div>
  )
}
