'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'
import type { Artikel } from '@/lib/types'
import { formatDateTime } from '@/lib/types'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Trash2, Loader2, Eye, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

const KATEGORI_OPTIONS = ['Umum', 'Edukasi', 'Opini', 'Tips', 'Panduan', 'Pengetahuan']

const emptyForm = {
  judul: '',
  kategori: 'Umum',
  thumbnail: '',
  ringkasan: '',
  isi: '',
  penulis: '',
  tags: '',
  seoTitle: '',
  metaDescription: '',
  metaKeywords: '',
}

export function AdminArtikel() {
  const [items, setItems] = useState<Artikel[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterKategori, setFilterKategori] = useState('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Artikel | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ artikel: Artikel[] }>('/api/artikel?admin=true')
      setItems(data.artikel)
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
    return items.filter((a) => {
      const matchSearch = !s || a.judul.toLowerCase().includes(s) || (a.ringkasan || '').toLowerCase().includes(s)
      const matchKat = filterKategori === 'all' || a.kategori === filterKategori
      return matchSearch && matchKat
    })
  }, [items, search, filterKategori])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (item: Artikel) => {
    setEditing(item)
    setForm({
      judul: item.judul,
      kategori: item.kategori,
      thumbnail: item.thumbnail || '',
      ringkasan: item.ringkasan || '',
      isi: item.isi,
      penulis: item.penulis || '',
      tags: item.tags || '',
      seoTitle: item.seoTitle || '',
      metaDescription: item.metaDescription || '',
      metaKeywords: item.metaKeywords || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.judul.trim()) {
      toast.error('Judul wajib diisi')
      return
    }
    if (!form.isi.trim()) {
      toast.error('Isi artikel wajib diisi')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form }
      if (editing) {
        await apiPut(`/api/artikel/${editing.id}`, payload)
        toast.success('Artikel berhasil diperbarui')
      } else {
        await apiPost('/api/artikel', payload)
        toast.success('Artikel berhasil ditambahkan')
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
      await apiDelete(`/api/artikel/${deleteId}`)
      toast.success('Artikel berhasil dihapus')
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
        title="Artikel"
        description="Kelola artikel edukasi dan pengetahuan PPDI Cikampek"
        onAdd={openAdd}
        addLabel="Tambah Artikel"
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Cari artikel..." />
        <Select value={filterKategori} onValueChange={setFilterKategori}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {KATEGORI_OPTIONS.map((k) => (
              <SelectItem key={k} value={k}>{k}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminPageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <AdminLoading rows={6} />
          ) : filtered.length === 0 ? (
            <AdminEmpty message="Belum ada artikel" />
          ) : (
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-20">Thumbnail</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead className="hidden md:table-cell">Kategori</TableHead>
                    <TableHead className="hidden lg:table-cell">Views</TableHead>
                    <TableHead className="hidden lg:table-cell">Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="w-16 h-12 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                          {a.thumbnail ? (
                            <img src={a.thumbnail} alt={a.judul} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium line-clamp-2">{a.judul}</div>
                        {a.penulis && (
                          <div className="text-xs text-muted-foreground">oleh {a.penulis}</div>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{a.kategori}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {a.viewCount}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {a.publishedAt ? formatDateTime(a.publishedAt) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(a)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(a.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground mt-3">
          Menampilkan {filtered.length} dari {items.length} artikel
        </p>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Artikel' : 'Tambah Artikel'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Perbarui artikel' : 'Tambah artikel baru'}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="konten" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="konten">Konten</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>
            <TabsContent value="konten" className="space-y-4 mt-2">
              <div>
                <Label>Judul *</Label>
                <Input
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Penulis</Label>
                  <Input
                    value={form.penulis}
                    onChange={(e) => setForm({ ...form, penulis: e.target.value })}
                    placeholder="Otomatis dari user login"
                  />
                </div>
              </div>
              <div>
                <Label>URL Thumbnail</Label>
                <Input
                  value={form.thumbnail}
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                />
              </div>
              <div>
                <Label>Ringkasan</Label>
                <Textarea
                  value={form.ringkasan}
                  onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Isi Artikel *</Label>
                <Textarea
                  value={form.isi}
                  onChange={(e) => setForm({ ...form, isi: e.target.value })}
                  rows={10}
                  className="font-mono text-sm"
                  placeholder="Tulis isi artikel (HTML diperbolehkan)"
                />
              </div>
              <div>
                <Label>Tags (pisahkan dengan koma)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>
            </TabsContent>
            <TabsContent value="seo" className="space-y-4 mt-2">
              <div>
                <Label>SEO Title</Label>
                <Input
                  value={form.seoTitle}
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={form.metaDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Meta Keywords</Label>
                <Input
                  value={form.metaKeywords}
                  onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })}
                />
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : editing ? 'Simpan Perubahan' : 'Tambah Artikel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus artikel ini?
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
