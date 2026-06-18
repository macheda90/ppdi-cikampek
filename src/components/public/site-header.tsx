'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAppStore, type PublicView } from '@/lib/store'
import { useSettings } from '@/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogInput } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Menu, Search, LogIn, ChevronDown, X } from 'lucide-react'
import { apiGet } from '@/lib/api-client'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface MenuItem {
  label: string
  view: PublicView
}

interface SearchResult {
  type: string
  id: string
  title: string
  slug?: string
  category?: string
  date?: string | null
  location?: string | null
  foto?: string | null
  jabatan?: string | null
  desa?: string | null
}

export function SiteHeader({
  menuItems,
  onNavigate,
}: {
  menuItems: MenuItem[]
  onNavigate: (view: PublicView, params?: Record<string, string>) => void
}) {
  const { settings } = useSettings()
  const { currentView, goAdmin, mobileMenuOpen, setMobileMenu } = useAppStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{
    berita: SearchResult[]
    artikel: SearchResult[]
    kegiatan: SearchResult[]
    agenda: SearchResult[]
    pengurus: SearchResult[]
  } | null>(null)
  const [searching, setSearching] = useState(false)

  const orgName = settings.org_short_name || 'PPDI Cikampek'

  const handleSearch = async (q: string) => {
    setSearchQuery(q)
    if (q.length < 2) {
      setSearchResults(null)
      return
    }
    setSearching(true)
    try {
      const data = await apiGet<{
        results: {
          berita: SearchResult[]
          artikel: SearchResult[]
          kegiatan: SearchResult[]
          agenda: SearchResult[]
          pengurus: SearchResult[]
        }
      }>(`/api/search?q=${encodeURIComponent(q)}`)
      setSearchResults(data.results)
    } catch {
      setSearchResults(null)
    } finally {
      setSearching(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults(null)
    if (result.type === 'berita') onNavigate('berita-detail', { slug: result.slug! })
    else if (result.type === 'artikel') onNavigate('artikel-detail', { slug: result.slug! })
    else if (result.type === 'kegiatan') onNavigate('kegiatan-detail', { slug: result.slug! })
    else if (result.type === 'pengurus') onNavigate('pengurus', {})
    else if (result.type === 'agenda') onNavigate('agenda', {})
  }

  const totalResults = searchResults
    ? Object.values(searchResults).reduce((acc, arr) => acc + arr.length, 0)
    : 0

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-xs hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between h-9">
          <div className="flex items-center gap-4">
            <span>{settings.org_email || 'ppdi.cikampek@gmail.com'}</span>
            <span className="opacity-50">|</span>
            <span>{settings.org_phone || '+62 267 862134'}</span>
          </div>
          <div className="flex items-center gap-3">
            {settings.social_facebook && <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">Facebook</a>}
            {settings.social_instagram && <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">Instagram</a>}
            {settings.social_youtube && <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">YouTube</a>}
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-40 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 lg:h-20 items-center justify-between gap-4">
            {/* Logo */}
            <button
              onClick={() => onNavigate('beranda')}
              className="flex items-center gap-3 shrink-0"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full gradient-navy flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0 shadow-navy">
                {orgName.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold text-sm lg:text-base text-primary leading-tight">{orgName}</div>
                <div className="text-[10px] lg:text-xs text-muted-foreground leading-tight">Kecamatan Cikampek</div>
              </div>
            </button>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground ${
                    currentView === item.view || currentView === `${item.view}-detail`
                      ? 'text-primary bg-accent'
                      : 'text-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="shrink-0"
                aria-label="Cari"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => goAdmin('admin-login')}
                size="sm"
                className="hidden sm:flex gap-2"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>

              {/* Mobile menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenu}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                  <div className="flex flex-col gap-1 mt-6">
                    {menuItems.map((item) => (
                      <button
                        key={item.view}
                        onClick={() => onNavigate(item.view)}
                        className={`px-4 py-3 text-left text-sm font-medium rounded-md transition-colors hover:bg-accent ${
                          currentView === item.view ? 'bg-accent text-primary' : ''
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                    <Button
                      onClick={() => goAdmin('admin-login')}
                      className="mt-4 gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      Login Admin
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Pencarian Global
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Cari berita, artikel, kegiatan, agenda, pengurus..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {searchResults && totalResults === 0 && !searching && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Tidak ada hasil untuk &quot;{searchQuery}&quot;</p>
              </div>
            )}

            {searchResults && totalResults > 0 && (
              <div className="max-h-[400px] overflow-y-auto space-y-4">
                {searchResults.berita.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Berita</h3>
                    {searchResults.berita.map((r) => (
                      <button key={r.id} onClick={() => handleResultClick(r)} className="w-full text-left p-2 rounded hover:bg-accent transition-colors">
                        <div className="font-medium text-sm">{r.title}</div>
                        <div className="text-xs text-muted-foreground">{r.category}</div>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.artikel.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Artikel</h3>
                    {searchResults.artikel.map((r) => (
                      <button key={r.id} onClick={() => handleResultClick(r)} className="w-full text-left p-2 rounded hover:bg-accent transition-colors">
                        <div className="font-medium text-sm">{r.title}</div>
                        <div className="text-xs text-muted-foreground">{r.category}</div>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.kegiatan.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Kegiatan</h3>
                    {searchResults.kegiatan.map((r) => (
                      <button key={r.id} onClick={() => handleResultClick(r)} className="w-full text-left p-2 rounded hover:bg-accent transition-colors">
                        <div className="font-medium text-sm">{r.title}</div>
                        <div className="text-xs text-muted-foreground">{r.location}</div>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.agenda.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Agenda</h3>
                    {searchResults.agenda.map((r) => (
                      <button key={r.id} onClick={() => handleResultClick(r)} className="w-full text-left p-2 rounded hover:bg-accent transition-colors">
                        <div className="font-medium text-sm">{r.title}</div>
                        <div className="text-xs text-muted-foreground">{r.location}</div>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.pengurus.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pengurus</h3>
                    {searchResults.pengurus.map((r) => (
                      <button key={r.id} onClick={() => handleResultClick(r)} className="w-full text-left p-2 rounded hover:bg-accent transition-colors flex items-center gap-3">
                        {r.foto ? (
                          <img src={r.foto} alt={r.title} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{r.title.charAt(0)}</div>
                        )}
                        <div className="text-left">
                          <div className="font-medium text-sm">{r.title}</div>
                          <div className="text-xs text-muted-foreground">{r.jabatan} - {r.desa}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
