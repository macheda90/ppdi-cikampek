'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { apiGet } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Calendar, FileText, Newspaper, Activity, ArrowRight, Plus } from 'lucide-react'

interface UserDashboardData {
    stats: {
        totalBerita: number
        totalArtikel: number
        totalKegiatan: number
        totalAgenda: number
    }
}

export function AdminDashboardUser() {
    const { goAdmin } = useAppStore()
    const [data, setData] = useState<UserDashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true
        const fetchDashboard = async () => {
            try {
                const result = await apiGet<UserDashboardData>('/api/dashboard')
                if (!active) return
                setData(result)
            } catch (err) {
                if (!active) return
                setError(err instanceof Error ? err.message : 'Gagal memuat data')
            } finally {
                if (!active) return
                setLoading(false)
            }
        }

        fetchDashboard()
        return () => {
            active = false
        }
    }, [])

    const stats = useMemo(() => data?.stats, [data])

    const cards = useMemo(
        () => [
            {
                label: 'Berita',
                value: stats?.totalBerita ?? 0,
                icon: Newspaper,
                view: 'admin-berita',
            },
            {
                label: 'Artikel',
                value: stats?.totalArtikel ?? 0,
                icon: FileText,
                view: 'admin-artikel',
            },
            {
                label: 'Kegiatan',
                value: stats?.totalKegiatan ?? 0,
                icon: Activity,
                view: 'admin-kegiatan',
            },
            {
                label: 'Agenda',
                value: stats?.totalAgenda ?? 0,
                icon: Calendar,
                view: 'admin-agenda',
            },
        ],
        [stats]
    )

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <Card>
                <CardContent className="py-10 text-center">
                    <p className="text-destructive">{error || 'Gagal memuat data'}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="rounded-xl gradient-navy p-6 text-white shadow-md">
                <h2 className="text-2xl font-bold">Dashboard User</h2>
                <p className="text-white/80 text-sm mt-1">Menu dibatasi: Berita, Artikel, Kegiatan, Agenda.</p>
                <div className="flex flex-wrap gap-2 mt-4">
                    <Badge className="bg-white/20 text-white border-0">
                        <Newspaper className="w-3 h-3 mr-1" /> {stats?.totalBerita ?? 0} Berita
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0">
                        <FileText className="w-3 h-3 mr-1" /> {stats?.totalArtikel ?? 0} Artikel
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0">
                        <Activity className="w-3 h-3 mr-1" /> {stats?.totalKegiatan ?? 0} Kegiatan
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0">
                        <Calendar className="w-3 h-3 mr-1" /> {stats?.totalAgenda ?? 0} Agenda
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((c) => {
                    const Icon = c.icon
                    return (
                        <Card key={c.view} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => goAdmin(c.view)}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
                                        <p className="text-2xl font-bold text-foreground">{c.value}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm from-primary to-primary/40">
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                                    <ArrowRight className="w-3 h-3" /> Buka menu
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" /> Tambah
                    </CardTitle>
                    <CardDescription>Aksi cepat dibatasi: Berita, Artikel, Kegiatan, Agenda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" onClick={() => goAdmin('admin-berita')}>
                            <Newspaper className="w-5 h-5" />
                            <span className="text-xs">Berita</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" onClick={() => goAdmin('admin-artikel')}>
                            <FileText className="w-5 h-5" />
                            <span className="text-xs">Artikel</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" onClick={() => goAdmin('admin-kegiatan')}>
                            <Activity className="w-5 h-5" />
                            <span className="text-xs">Kegiatan</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" onClick={() => goAdmin('admin-agenda')}>
                            <Calendar className="w-5 h-5" />
                            <span className="text-xs">Agenda</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

