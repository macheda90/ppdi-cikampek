'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROLE_LABELS } from '@/lib/auth-shared'
import { apiGet } from '@/lib/api-client'
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Newspaper,
  FileText,
  Activity,
  Calendar,
  Image as ImageIcon,
  Download,
  Mail,
  Settings,
  UserCog,
  History,
  LogOut,
  Menu,
  Search,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCircle,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  view: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

interface NavSection {
  title: string
  items: NavItem[]
}

interface AdminLayoutProps {
  children: React.ReactNode
  onLogout: () => void
  currentView: string
  onNavigate: (view: string) => void
}

const ALL_NAV_SECTIONS: NavSection[] = [
  {
    title: 'Utama',
    items: [
      { label: 'Dashboard', view: 'admin-dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Master Data',
    items: [
      { label: 'Pengurus', view: 'admin-pengurus', icon: Users },
      { label: 'Desa', view: 'admin-desa', icon: Building2 },
      { label: 'Jabatan', view: 'admin-jabatan', icon: Briefcase },
    ],
  },
  {
    title: 'Publikasi',
    items: [
      { label: 'Berita', view: 'admin-berita', icon: Newspaper },
      { label: 'Artikel', view: 'admin-artikel', icon: FileText },
      { label: 'Kegiatan', view: 'admin-kegiatan', icon: Activity },
      { label: 'Agenda', view: 'admin-agenda', icon: Calendar },
    ],
  },
  {
    title: 'Media',
    items: [
      { label: 'Galeri', view: 'admin-galeri', icon: ImageIcon },
      { label: 'Download', view: 'admin-download', icon: Download },
      { label: 'Pesan Masuk', view: 'admin-pesan', icon: Mail },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { label: 'Pengaturan', view: 'admin-setting', icon: Settings },
      { label: 'Pengguna', view: 'admin-user', icon: UserCog },
      { label: 'Log Aktivitas', view: 'admin-audit', icon: History },
    ],
  },
]

const VIEW_LABELS: Record<string, string> = Object.fromEntries(
  ALL_NAV_SECTIONS.flatMap((s) => s.items.map((i) => [i.view, i.label]))
)

interface SidebarContentProps {
  collapsed: boolean
  currentView: string
  navSections: NavSection[]
  onNavigate: (view: string) => void
  onGoPublic: () => void
}

function SidebarContent({
  collapsed,
  currentView,
  navSections,
  onNavigate,
  onGoPublic,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-3 h-16 border-b border-sidebar-border px-4',
          collapsed && 'justify-center px-2'
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-[#0a3a64] flex items-center justify-center flex-shrink-0 shadow-md">
          <ShieldCheck className="w-6 h-6 text-gold" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm leading-tight text-sidebar-foreground">Back Office</p>
            <p className="text-xs text-muted-foreground leading-tight">PPDI Cikampek</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4 custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon
              const active = currentView === item.view
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group',
                    collapsed && 'justify-center px-2',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                  {!collapsed && item.badge ? (
                    <Badge className="bg-gold text-gold-foreground text-[10px] h-5 min-w-5 px-1.5 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  ) : null}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onGoPublic}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Lihat Situs Publik
          </Button>
        </div>
      )}
    </div>
  )
}

export function AdminLayout({ children, onLogout, currentView, onNavigate }: AdminLayoutProps) {
  const { authUser, goToPublic } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch unread messages count (only when user is likely authenticated)
  useEffect(() => {
    // Prevent noisy 401 logs while auth state is not ready.
    if (!authUser) return

    let active = true
    const fetchUnread = async () => {
      try {
        const data = await apiGet<{ pesan: Array<{ isRead: boolean }> }>('/api/kontak')
        if (active && Array.isArray(data.pesan)) {
          setUnreadCount(data.pesan.filter((p) => !p.isRead).length)
        }
      } catch {
        /* ignore */
      }
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [currentView, authUser])

  const navSections = useMemo(
    () =>
      ALL_NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items.map((item) =>
          item.view === 'admin-pesan' && unreadCount > 0 ? { ...item, badge: unreadCount } : item
        ),
      })),
    [unreadCount]
  )

  const pageTitle = VIEW_LABELS[currentView] || 'Dashboard'

  const initials = (authUser?.name || 'A')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  // Use theme resolved on client. The "useTheme" hook returns undefined theme on SSR.
  // We rely on next-themes' state. When undefined, we show Moon icon by default (light theme on first render).
  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200 sticky top-0 h-screen z-30 relative',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          currentView={currentView}
          navSections={navSections}
          onNavigate={onNavigate}
          onGoPublic={() => goToPublic('beranda')}
        />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-background border border-border shadow-sm flex items-center justify-center hover:bg-accent transition-colors z-40"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 border-r-0">
          <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
          <SidebarContent
            collapsed={false}
            currentView={currentView}
            navSections={navSections}
            onNavigate={(view) => {
              setMobileOpen(false)
              onNavigate(view)
            }}
            onGoPublic={() => goToPublic('beranda')}
          />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex items-center px-4 gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">{pageTitle}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Selamat datang kembali, {authUser?.name || 'Admin'}
            </p>
          </div>

          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Cari..."
              className="pl-9 pr-3 py-1.5 h-9 w-48 lg:w-64 rounded-md bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 px-2 sm:px-3 gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={authUser?.avatar || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-sm font-medium">{authUser?.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {ROLE_LABELS[authUser?.role || ''] || authUser?.role}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{authUser?.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    @{authUser?.username}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate('admin-user')}>
                <UserCircle className="w-4 h-4 mr-2" />
                Profil Pengguna
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate('admin-setting')}>
                <Settings className="w-4 h-4 mr-2" />
                Pengaturan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => goToPublic('beranda')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Lihat Situs
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
