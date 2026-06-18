'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { apiGet } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Users,
  Newspaper,
  FileText,
  Activity,
  Calendar,
  UserCog,
  TrendingUp,
  Eye,
  Mail,
  Building2,
  Image as ImageIcon,
  Download,
  ArrowRight,
  Clock,
  PlusCircle,
  History,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { formatDateTime, formatDate } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DashboardData {
  stats: {
    totalPengurus: number
    totalBerita: number
    totalArtikel: number
    totalKegiatan: number
    totalAgenda: number
    totalUsers: number
    totalDesa: number
    totalGaleri: number
    totalDownloads: number
    unreadPesan: number
    beritaPublished: number
    beritaDraft: number
  }
  chartData: { month: string; berita: number; artikel: number; kegiatan: number }[]
  beritaByKategori: { kategori: string; _count: number }[]
  recentActivity: Array<{
    id: string
    action: string
    module: string
    detail: string | null
    createdAt: string
    user: { name: string } | null
  }>
  upcomingAgenda: Array<{
    id: string
    namaAgenda: string
    tanggalMulai: string
    lokasi: string | null
    status: string
  }>
}

const PIE_COLORS = ['#0F4C81', '#D4AF37', '#10b981', '#f97316', '#8b5cf6', '#ec4899']

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  LOGOUT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  CREATE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  UPDATE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export function AdminDashboard() {
  const { goAdmin } = useAppStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const fetchDashboard = async () => {
      try {
        const result = await apiGet<DashboardData>('/api/dashboard')
        if (active) setData(result)
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Gagal memuat data')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchDashboard()
    return () => {
      active = false
    }
  }, [])

  const stats = data?.stats

  const statCards = [
    {
      label: 'Total Pengurus',
      value: stats?.totalPengurus ?? 0,
      icon: Users,
      color: 'from-[#0F4C81] to-[#0a3a64]',
      onClick: () => goAdmin('admin-pengurus'),
    },
    {
      label: 'Total Berita',
      value: stats?.totalBerita ?? 0,
      icon: Newspaper,
      color: 'from-[#D4AF37] to-[#b8941f]',
      onClick: () => goAdmin('admin-berita'),
    },
    {
      label: 'Total Artikel',
      value: stats?.totalArtikel ?? 0,
      icon: FileText,
      color: 'from-emerald-600 to-emerald-800',
      onClick: () => goAdmin('admin-artikel'),
    },
    {
      label: 'Total Kegiatan',
      value: stats?.totalKegiatan ?? 0,
      icon: Activity,
      color: 'from-orange-500 to-orange-700',
      onClick: () => goAdmin('admin-kegiatan'),
    },
    {
      label: 'Total Agenda',
      value: stats?.totalAgenda ?? 0,
      icon: Calendar,
      color: 'from-purple-600 to-purple-800',
      onClick: () => goAdmin('admin-agenda'),
    },
    {
      label: 'Total Pengguna',
      value: stats?.totalUsers ?? 0,
      icon: UserCog,
      color: 'from-pink-600 to-pink-800',
      onClick: () => goAdmin('admin-user'),
    },
  ]

  const quickActions = [
    { label: 'Tambah Berita', view: 'admin-berita', icon: Newspaper },
    { label: 'Tambah Artikel', view: 'admin-artikel', icon: FileText },
    { label: 'Tambah Kegiatan', view: 'admin-kegiatan', icon: Activity },
    { label: 'Tambah Agenda', view: 'admin-agenda', icon: Calendar },
    { label: 'Tambah Pengurus', view: 'admin-pengurus', icon: Users },
    { label: 'Lihat Pesan', view: 'admin-pesan', icon: Mail },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-destructive">{error || 'Gagal memuat data dashboard'}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Coba lagi
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl gradient-navy p-6 text-white shadow-md">
        <h2 className="text-2xl font-bold">Dashboard PPDI Cikampek</h2>
        <p className="text-white/80 text-sm mt-1">
          Ringkasan aktivitas dan statistik platform. Data diperbarui secara real-time.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge className="bg-white/20 text-white border-0">
            <Building2 className="w-3 h-3 mr-1" /> {stats.totalDesa} Desa
          </Badge>
          <Badge className="bg-white/20 text-white border-0">
            <ImageIcon className="w-3 h-3 mr-1" /> {stats.totalGaleri} Galeri
          </Badge>
          <Badge className="bg-white/20 text-white border-0">
            <Download className="w-3 h-3 mr-1" /> {stats.totalDownloads} File
          </Badge>
          <Badge className="bg-gold text-gold-foreground border-0">
            <Mail className="w-3 h-3 mr-1" /> {stats.unreadPesan} Pesan Belum Dibaca
          </Badge>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card
              key={card.label}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={card.onClick}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                    <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  </div>
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm',
                      card.color
                    )}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2 group-hover:text-primary transition-colors">
                  <ArrowRight className="w-3 h-3" />
                  Kelola
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Aktivitas Bulanan
            </CardTitle>
            <CardDescription>6 bulan terakhir (Berita, Artikel, Kegiatan)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="berita" fill="#0F4C81" radius={[4, 4, 0, 0]} />
                <Bar dataKey="artikel" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="kegiatan" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-gold" />
              Berita per Kategori
            </CardTitle>
            <CardDescription>Distribusi konten berita</CardDescription>
          </CardHeader>
          <CardContent>
            {data.beritaByKategori.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                Belum ada data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.beritaByKategori.map((b) => ({
                      name: b.kategori,
                      value: b._count,
                    }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => `${entry.name} (${entry.value})`}
                    labelLine={false}
                  >
                    {data.beritaByKategori.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity & upcoming agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Aktivitas Terbaru
              </CardTitle>
              <CardDescription>8 aktivitas terakhir</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => goAdmin('admin-audit')}>
              Lihat semua <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Belum ada aktivitas
                </p>
              ) : (
                data.recentActivity.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {log.user?.name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium truncate">
                          {log.user?.name || 'System'}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded font-medium',
                            ACTION_COLORS[log.action] || 'bg-muted text-muted-foreground'
                          )}
                        >
                          {log.action}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {log.module}
                        {log.detail ? ` • ${log.detail}` : ''}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                        {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold" />
                Agenda Mendatang
              </CardTitle>
              <CardDescription>5 agenda terdekat</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => goAdmin('admin-agenda')}>
              Kelola <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
              {data.upcomingAgenda.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Tidak ada agenda mendatang
                </p>
              ) : (
                data.upcomingAgenda.map((ag) => (
                  <div
                    key={ag.id}
                    className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-[#0a3a64] flex flex-col items-center justify-center text-white flex-shrink-0">
                      <span className="text-[10px] uppercase">
                        {new Date(ag.tanggalMulai).toLocaleDateString('id-ID', { month: 'short' })}
                      </span>
                      <span className="text-base font-bold leading-none">
                        {new Date(ag.tanggalMulai).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ag.namaAgenda}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(ag.tanggalMulai)}
                      </div>
                      {ag.lokasi && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                          📍 {ag.lokasi}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            Aksi Cepat
          </CardTitle>
          <CardDescription>Akses cepat ke operasi umum</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((qa) => {
              const Icon = qa.icon
              return (
                <Button
                  key={qa.label}
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1.5 hover:bg-primary hover:text-primary-foreground"
                  onClick={() => goAdmin(qa.view)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{qa.label}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
