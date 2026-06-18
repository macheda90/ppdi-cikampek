'use client'

import { useEffect, useState, useMemo } from 'react'
import { apiGet } from '@/lib/api-client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Download as DownloadIcon, FileText, FileSpreadsheet, FileArchive, FileType2,
  Search, Calendar, HardDrive, Eye,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import type { DownloadItem } from '@/lib/types'

const CATEGORIES = [
  { value: 'all', label: 'Semua Kategori' },
  { value: 'SURAT_EDARAN', label: 'Surat Edaran' },
  { value: 'AD_ART', label: 'AD/ART' },
  { value: 'FORMULIR', label: 'Formulir' },
  { value: 'DOKUMEN', label: 'Dokumen Organisasi' },
]

const CATEGORY_LABELS: Record<string, string> = {
  SURAT_EDARAN: 'Surat Edaran',
  AD_ART: 'AD/ART',
  FORMULIR: 'Formulir',
  DOKUMEN: 'Dokumen Organisasi',
}

export function DownloadPage() {
  const [items, setItems] = useState<DownloadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('all')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (kategori !== 'all') params.set('kategori', kategori)
    if (search.trim()) params.set('search', search.trim())

    const t = setTimeout(() => {
      setLoading(true)
      apiGet<{ download: DownloadItem[] }>(`/api/download?${params.toString()}`)
        .then((data) => setItems(data.download))
        .catch(() => setItems([]))
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(t)
  }, [search, kategori])

  const totalDownloads = useMemo(
    () => items.reduce((acc, it) => acc + it.downloadCount, 0),
    [items]
  )

  const handleDownload = async (item: DownloadItem) => {
    setDownloadingId(item.id)
    try {
      // Increment count via PATCH
      await fetch(`/api/download/${item.id}`, { method: 'PATCH' })
      // Optimistically update local count
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, downloadCount: it.downloadCount + 1 } : it
        )
      )
      // Open file
      if (typeof window !== 'undefined') {
        window.open(item.fileUrl, '_blank', 'noopener,noreferrer')
      }
    } catch {
      // Still try to open file even if count fails
      if (typeof window !== 'undefined') {
        window.open(item.fileUrl, '_blank', 'noopener,noreferrer')
      }
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <section className="gradient-navy py-16 md:py-20">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <Badge className="mb-3 bg-gold text-gold-foreground hover:bg-gold">Download</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Pusat Dokumen</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-sm md:text-base">
            Unduh berbagai dokumen organisasi: surat edaran, AD/ART, formulir, dan dokumen kepengurusan PPDI Kecamatan Cikampek.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-background -mt-8 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
            <Card className="text-center p-4 md:p-5 shadow-md border-t-4 border-t-primary">
              <CardContent className="p-0">
                <div className="w-10 h-10 mx-auto rounded-full bg-accent flex items-center justify-center mb-2 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-foreground">{items.length}</div>
                <div className="text-xs text-muted-foreground">Total Dokumen</div>
              </CardContent>
            </Card>
            <Card className="text-center p-4 md:p-5 shadow-md border-t-4 border-t-gold">
              <CardContent className="p-0">
                <div className="w-10 h-10 mx-auto rounded-full bg-accent flex items-center justify-center mb-2 text-gold">
                  <DownloadIcon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-foreground">{totalDownloads}</div>
                <div className="text-xs text-muted-foreground">Total Unduhan</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari dokumen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Button
                  key={c.value}
                  size="sm"
                  variant={kategori === c.value ? 'default' : 'outline'}
                  onClick={() => setKategori(c.value)}
                  className={kategori === c.value ? 'bg-primary text-primary-foreground' : ''}
                >
                  {c.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <Card className="p-12 text-center">
              <DownloadIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Tidak ada dokumen</h3>
              <p className="text-sm text-muted-foreground">Belum ada dokumen untuk kategori ini.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <DownloadRow
                  key={item.id}
                  item={item}
                  onDownload={handleDownload}
                  downloading={downloadingId === item.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function DownloadRow({
  item,
  onDownload,
  downloading,
}: {
  item: DownloadItem
  onDownload: (item: DownloadItem) => void
  downloading: boolean
}) {
  const colorClass = getFileColor(item.fileType)

  return (
    <Card className="p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-4">
        <div className={`shrink-0 w-14 h-14 rounded-lg flex items-center justify-center ${colorClass}`}>
          <FileIcon fileType={item.fileType} className="h-7 w-7" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              {CATEGORY_LABELS[item.kategori] || item.kategori}
            </Badge>
            {item.fileType && (
              <Badge variant="outline" className="text-xs uppercase">
                {item.fileType}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {item.judul}
          </h3>
          {item.deskripsi && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{item.deskripsi}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(item.createdAt), 'd MMM yyyy', { locale: localeId })}
            </span>
            {item.fileSize && (
              <span className="flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                {item.fileSize}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {item.downloadCount}x diunduh
            </span>
          </div>
        </div>

        <Button
          onClick={() => onDownload(item)}
          disabled={downloading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          {downloading ? (
            <>
              <div className="h-4 w-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Memproses
            </>
          ) : (
            <>
              <DownloadIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Unduh</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

function FileIcon({ fileType, className }: { fileType: string | null; className?: string }) {
  const ft = (fileType || '').toLowerCase()
  if (ft.includes('xls') || ft.includes('sheet')) return <FileSpreadsheet className={className} />
  if (ft.includes('zip') || ft.includes('rar') || ft.includes('arc')) return <FileArchive className={className} />
  if (ft.includes('pdf') || ft.includes('doc') || ft.includes('text')) return <FileText className={className} />
  return <FileType2 className={className} />
}

function getFileColor(fileType: string | null): string {
  if (!fileType) return 'bg-muted text-muted-foreground'
  const ft = fileType.toLowerCase()
  if (ft.includes('pdf')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  if (ft.includes('doc')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  if (ft.includes('xls') || ft.includes('sheet')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  if (ft.includes('zip') || ft.includes('rar')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  return 'bg-muted text-muted-foreground'
}
