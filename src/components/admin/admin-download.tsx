'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'
import type { DownloadItem } from '@/lib/types'
import { formatDate } from '@/lib/types'
import { AdminPageHeader, SearchInput, AdminLoading, AdminEmpty } from './_shared'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Trash2, Loader2, Download, FileText, FileImage, FileArchive, File } from 'lucide-react'
import { toast } from 'sonner'

const KATEGORI_OPTIONS = ['DOKUMEN', 'FORMULIR', 'REGULASI', 'LAINNYA']

const KATEGORI_LABEL: Record<string, string> = {
  DOKUMEN: 'Dokumen',
  FORMULIR: 'Formulir',
  REGULASI: 'Regulasi',
  LAINNYA: 'Lainnya',
}

const FILE_TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  jpg: FileImage,
  jpeg: FileImage,
  png: FileImage,
  zip: FileArchive,
  rar: FileArchive,
  doc: FileText,
  docx: FileText,
  xls: FileText,
  xlsx: FileText,
}

const emptyForm = {
  judul: '',
  kategori: 'DOKUMEN',
  fileUrl: '',
  fileSize: '',
  fileType: '',
  deskripsi: '',
}

function getFileType(url: string, explicit?: string): string {
  if (explicit) return explicit.toUpperCase()
  const ext = url.split('.').pop()?.split('?')[0]?.toLowerCase()
  return ext || 'FILE'
}

export function AdminDownload() {
  const [items, setItems] = useState<DownloadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterKategori, setFilterKategori] = useState('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DownloadItem | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ download: DownloadItem[] }>('/api/download')
      setItems(data.download)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return items.filter((d) => {
      const matchSearch = !s || d.judul.toLowerCase().includes(s)
      const matchKat = filterKategori === 'all' || d.kategori === filterKategori
      return matchSearch && matchKat
    })
  }, [items, search, filterKategori])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (item: DownloadItem) => {
    setEditing(item)
    setForm({
      judul: item.judul,
      kategori: item.kategori,
      fileUrl: item.fileUrl,
      fileSize: item.fileSize || '',
      fileType: item.fileType || '',
      deskripsi: item.deskripsi || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.judul.trim() || !form.fileUrl.trim()) {
      toast.error('Judul dan URL file wajib diisi')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        fileType: form.fileType || getFileType(form.fileUrl),
      }
      if (editing) {
        await apiPut(`/api/download/${editing.id}`, payload)
        toast.success('Dokumen berhasil diperbarui')
      } else {
        await apiPost('/api/download', payload)
        toast.success('Dokumen berhasil ditambahkan')
      }
      setDialogOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await apiDelete(`/api/download/${deleteId}`)
      toast.success('Dokumen berhasil dihapus')
      setDeleteId(null)
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Download"
        description="Kelola dokumen dan file untuk diunduh publik"
        onAdd={openAdd}
        addLabel="Tambah File"
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Cari dokumen..." />
        <Select value={filterKategori} onValueChange={setFilterKategori}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {KATEGORI_OPTIONS.map((k) => (
              <SelectItem key={k} value={k}>{KATEGORI_LABEL[k]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminPageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <AdminLoading rows={5} />
          ) : filtered.length === 0 ? (
            <AdminEmpty message="Belum ada file download" />
          ) : (
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead className="hidden md:table-cell">Kategori</TableHead>
                    <TableHead className="hidden lg:table-cell">Tipe</TableHead>
                    <TableHead className="hidden lg:table-cell">Ukuran</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => {
                    const ftype = (d.fileType || getFileType(d.fileUrl)).toLowerCase()
                    const Icon = FILE_TYPE_ICON[ftype] || File
                    return (
                      <TableRow key={d.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium line-clamp-1">{d.judul}</div>
                              {d.deskripsi && (
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                  {d.deskripsi}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline">{KATEGORI_LABEL[d.kategori] || d.kategori}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {d.fileType || getFileType(d.fileUrl)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {d.fileSize || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            <Download className="w-3 h-3 mr-1" />
                            {d.downloadCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(d)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(d.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit File' : 'Tambah File'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Perbarui data file' : 'Tambah file untuk diunduh'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Judul *</Label>
              <Input
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
              />
            </div>
            <div>
              <Label>Kategori</Label>
              <Select
                value={form.kategori}
                onValueChange={(v) => setForm({ ...form, kategori: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORI_OPTIONS.map((k) => (
                    <SelectItem key={k} value={k}>{KATEGORI_LABEL[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URL File *</Label>
              <Input
                value={form.fileUrl}
                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipe File</Label>
                <Input
                  value={form.fileType}
                  onChange={(e) => setForm({ ...form, fileType: e.target.value })}
                  placeholder="Otomatis dari URL"
                />
              </div>
              <div>
                <Label>Ukuran File</Label>
                <Input
                  value={form.fileSize}
                  onChange={(e) => setForm({ ...form, fileSize: e.target.value })}
                  placeholder="2.5 MB"
                />
              </div>
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : editing ? 'Simpan Perubahan' : 'Tambah File'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus file ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
