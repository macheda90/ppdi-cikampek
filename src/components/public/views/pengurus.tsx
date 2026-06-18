'use client'

import { useEffect, useState, useMemo } from 'react'
import { apiGet } from '@/lib/api-client'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, Search, Building2, Phone, Mail, MapPin, UserCheck, Filter, X } from 'lucide-react'
import type { Pengurus, Desa, Jabatan } from '@/lib/types'

export function PengurusPage() {
  const { goToPublic } = useAppStore()
  const [pengurus, setPengurus] = useState<Pengurus[]>([])
  const [desaList, setDesaList] = useState<Desa[]>([])
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [desaId, setDesaId] = useState('all')
  const [jabatanId, setJabatanId] = useState('all')

  // Master data
  useEffect(() => {
    Promise.all([
      apiGet<{ desa: Desa[] }>('/api/desa'),
      apiGet<{ jabatan: Jabatan[] }>('/api/jabatan'),
    ])
      .then(([d, j]) => {
        setDesaList(d.desa)
        setJabatanList(j.jabatan)
      })
      .catch(() => {})
  }, [])

  // Debounced search
  useEffect(() => {
    const params = new URLSearchParams()
    if (desaId !== 'all') params.set('desaId', desaId)
    if (jabatanId !== 'all') params.set('jabatanId', jabatanId)
    if (search.trim()) params.set('search', search.trim())

    const t = setTimeout(() => {
      setLoading(true)
      apiGet<{ pengurus: Pengurus[] }>(`/api/pengurus?${params.toString()}`)
        .then((data) => setPengurus(data.pengurus))
        .catch(() => setPengurus([]))
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(t)
  }, [search, desaId, jabatanId])

  const stats = useMemo(() => {
    const active = pengurus.filter((p) => p.statusAktif).length
    const desaCount = new Set(pengurus.map((p) => p.desaId).filter(Boolean)).size
    const jabatanCount = new Set(pengurus.map((p) => p.jabatanId).filter(Boolean)).size
    return { active, desaCount, jabatanCount }
  }, [pengurus])

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  const hasFilters = search.trim() !== '' || desaId !== 'all' || jabatanId !== 'all'

  const clearFilters = () => {
    setSearch('')
    setDesaId('all')
    setJabatanId('all')
  }

  return (
    <div>
      {/* Header */}
      <section className="gradient-navy py-16 md:py-20">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <Badge className="mb-3 bg-gold text-gold-foreground hover:bg-gold">Kepengurusan</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Daftar Pengurus</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-sm md:text-base">
            Para perangkat desa yang menggerakkan organisasi PPDI Kecamatan Cikampek.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-background -mt-8 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            <StatCard label="Pengurus Aktif" value={stats.active} icon={UserCheck} />
            <StatCard label="Jabatan" value={stats.jabatanCount} icon={Users} />
            <StatCard label="Desa" value={stats.desaCount} icon={Building2} />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <Card className="p-4 md:p-5">
            <div className="grid md:grid-cols-4 gap-3">
              <div className="md:col-span-1">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Search className="h-3 w-3" /> Cari Nama
                </label>
                <Input
                  placeholder="Nama pengurus..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Building2 className="h-3 w-3" /> Desa
                </label>
                <Select value={desaId} onValueChange={setDesaId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Semua Desa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Desa</SelectItem>
                    {desaList.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.namaDesa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Filter className="h-3 w-3" /> Jabatan
                </label>
                <Select value={jabatanId} onValueChange={setJabatanId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Semua Jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jabatan</SelectItem>
                    {jabatanList.map((j) => (
                      <SelectItem key={j.id} value={j.id}>
                        {j.namaJabatan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                {hasFilters ? (
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    <X className="mr-2 h-4 w-4" /> Reset Filter
                  </Button>
                ) : (
                  <div className="text-xs text-muted-foreground py-2.5">
                    Menampilkan {pengurus.length} pengurus
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* List */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : pengurus.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Tidak ada pengurus ditemukan</h3>
              <p className="text-sm text-muted-foreground">
                Coba ubah filter pencarian Anda.
              </p>
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Reset Filter
                </Button>
              )}
            </Card>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {pengurus.map((p) => (
                  <Card
                    key={p.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="relative gradient-navy h-20">
                      <div className="absolute -bottom-10 left-5">
                        <Avatar className="w-20 h-20 border-4 border-card shadow-md">
                          <AvatarImage src={p.foto || undefined} alt={p.namaLengkap} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                            {getInitials(p.namaLengkap)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      {(p.jabatan as { kategori?: string } | null)?.kategori === 'PIMPINAN' && (
                        <Badge className="absolute top-3 right-3 bg-gold text-gold-foreground hover:bg-gold text-xs">
                          Pimpinan
                        </Badge>
                      )}
                    </div>
                    <CardContent className="pt-12 pb-5 px-5">
                      <h3 className="font-semibold text-base text-foreground line-clamp-1">
                        {p.namaLengkap}
                      </h3>
                      <Badge variant="secondary" className="mt-1.5 mb-3 bg-primary/10 text-primary border-primary/20">
                        {p.jabatan?.namaJabatan || 'Pengurus'}
                      </Badge>

                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        {p.desa && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-gold shrink-0" />
                            <span className="truncate">{p.desa.namaDesa}</span>
                          </div>
                        )}
                        {p.noHp && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-gold shrink-0" />
                            <span className="truncate">{p.noHp}</span>
                          </div>
                        )}
                        {p.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-gold shrink-0" />
                            <span className="truncate">{p.email}</span>
                          </div>
                        )}
                      </div>

                      {p.masaJabatan && (
                        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                          Masa Jabatan: <span className="font-medium text-foreground">{p.masaJabatan}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="text-center p-4 md:p-6 shadow-md border-t-4 border-t-primary">
      <CardContent className="p-0">
        <div className="w-10 h-10 mx-auto rounded-full bg-accent flex items-center justify-center mb-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-2xl md:text-3xl font-bold text-foreground">{value}</div>
        <div className="text-xs md:text-sm text-muted-foreground mt-0.5">{label}</div>
      </CardContent>
    </Card>
  )
}
