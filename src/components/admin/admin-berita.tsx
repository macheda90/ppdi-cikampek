'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'
import type { Berita } from '@/lib/types'
import { formatDateTime, truncate } from '@/lib/types'
import { AdminPageHeader, SearchInput, AdminLoading, AdminEmpty } from './_shared'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
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
import { Pencil, Trash2, Loader2, Eye, Image as ImageIcon, Star } from 'lucide-react'
import { toast } from 'sonner'

const KATEGORI_OPTIONS = [
  'Umum', 'Pengumuman', 'Kegiatan', 'Politik', 'Sosial', 'Ekonomi', 'Pemerintahan',
]

const emptyForm = {
  judul: '',
  kategori: 'Umum',
  thumbnail: '',
  ringkasan: '',
  isi: '',
  penulis: '',
  status: 'DRAFT',
  tags: '',
  featured: false,
  seoTitle: '',
  metaDescription: '',
  metaKeywords: '',
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PUBLISH: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
}

export function AdminBerita() {
  const [items, setItems] = useState<Berita[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Berita | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ berita: Berita[] }>('/api/berita?admin=true')
      setItems(data.berita)
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
    return items.filter((b) => {
      const matchSearch = !s || b.judul.toLowerCase().includes(s) || (b.ringkasan || '').toLowerCase().includes(s)
      const matchStatus = filterStatus === 'all' || b.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [items, search, filterStatus])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (item: Berita) => {
    setEditing(item)
    setForm({
      judul: item.judul,
      kategori: item.kategori,
      thumbnail: item.thumbnail || '',
      ringkasan: item.ringkasan || '',
      isi: item.isi,
      penulis: item.penulis || '',
      status: item.status,
      tags: item.tags || '',
      featured: item.featured,
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
      toast.error('Isi berita wajib diisi')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form }
      if (editing) {
        await apiPut(`/api/berita/${editing.id}`, payload)
        toast.success('Berita berhasil diperbarui')
      } else {
        await apiPost('/api/berita', payload)
        toast.success('Berita berhasil ditambahkan')
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
      await apiDelete(`/api/berita/${deleteId}`)
      toast.success('Berita berhasil dihapus')
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
        title="Berita"
        description="Kelola berita dan pengumuman PPDI Cikampek"
        onAdd={openAdd}
        addLabel="Tambah Berita"
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Cari berita..." />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISH">Publish</SelectItem>
          </SelectContent>
        </Select>
      </AdminPageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <AdminLoading rows={6} />
          ) : filtered.length === 0 ? (
            <AdminEmpty message="Belum ada berita" />
          ) : (
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-20">Thumbnail</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead className="hidden md:table-cell">Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Views</TableHead>
                    <TableHead className="hidden lg:table-cell">Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div className="w-16 h-12 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                          {b.thumbnail ? (
                            <img
                              src={b.thumbnail}
                              alt={b.judul}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <div className="min-w-0">
                            <div className="font-medium line-clamp-2">{b.judul}</div>
                            {b.featured && (
                              <Star className="w-3 h-3 text-gold fill-gold inline mt-1" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{b.kategori}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLOR[b.status] || ''}>{b.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {b.viewCount}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {b.publishedAt ? formatDateTime(b.publishedAt) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(b)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(b.id)}
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
          Menampilkan {filtered.length} dari {items.length} berita
        </p>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Berita' : 'Tambah Berita'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Perbarui berita' : 'Tambah berita baru'}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="konten" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="konten">Konten</TabsTrigger>
              <TabsTrigger value="seo">SEO &amp; Lainnya</TabsTrigger>
            </TabsList>
            <TabsContent value="konten" className="space-y-4 mt-2">
              <div>
                <Label>Judul *</Label>
                <Input
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISH">Publish</SelectItem>
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
                  placeholder="https://..."
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
                <Label>Isi Berita *</Label>
                <Textarea
                  value={form.isi}
                  onChange={(e) => setForm({ ...form, isi: e.target.value })}
                  rows={10}
                  className="font-mono text-sm"
                  placeholder="Tulis isi berita (HTML diperbolehkan)"
                />
              </div>
              <div>
                <Label>Tags (pisahkan dengan koma)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="featured"
                  checked={form.featured}
                  onCheckedChange={(c) => setForm({ ...form, featured: c })}
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Tandai sebagai berita pilihan (featured)
                </Label>
              </div>
            </TabsContent>
            <TabsContent value="seo" className="space-y-4 mt-2">
              <div>
                <Label>SEO Title</Label>
                <Input
                  value={form.seoTitle}
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                  placeholder="Judul untuk SEO (kosongkan = judul utama)"
                />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={form.metaDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  rows={3}
                  placeholder="Deskripsi singkat untuk mesin pencari (max 160 karakter)"
                />
              </div>
              <div>
                <Label>Meta Keywords</Label>
                <Input
                  value={form.metaKeywords}
                  onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })}
                  placeholder="kata kunci 1, kata kunci 2"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Field SEO yang dikosongkan akan otomatis diisi dengan judul dan ringkasan utama.
              </p>
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
              ) : editing ? 'Simpan Perubahan' : 'Tambah Berita'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus berita ini? Aksi ini tidak dapat dibatalkan.
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
