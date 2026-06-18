'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'
import type { Galeri } from '@/lib/types'
import { AdminPageHeader, SearchInput, AdminLoading, AdminEmpty } from './_shared'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Pencil, Trash2, Loader2, Image as ImageIcon, Video, Plus, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const emptyForm = {
  judul: '',
  kategori: 'FOTO',
  url: '',
  thumbnail: '',
  deskripsi: '',
}

export function AdminGaleri() {
  const [items, setItems] = useState<Galeri[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'FOTO' | 'VIDEO'>('all')
  const [search, setSearch] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [editing, setEditing] = useState<Galeri | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [bulkUrls, setBulkUrls] = useState('')
  const [bulkKategori, setBulkKategori] = useState('FOTO')
  const [saving, setSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ galeri: Galeri[] }>('/api/galeri')
      setItems(data.galeri)
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
    return items.filter((g) => {
      const matchSearch = !s || g.judul.toLowerCase().includes(s)
      const matchTab = activeTab === 'all' || g.kategori === activeTab
      return matchSearch && matchTab
    })
  }, [items, search, activeTab])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (item: Galeri) => {
    setEditing(item)
    setForm({
      judul: item.judul,
      kategori: item.kategori,
      url: item.url,
      thumbnail: item.thumbnail || '',
      deskripsi: item.deskripsi || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.judul.trim() || !form.url.trim()) {
      toast.error('Judul dan URL wajib diisi')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form }
      if (editing) {
        await apiPut(`/api/galeri/${editing.id}`, payload)
        toast.success('Galeri berhasil diperbarui')
      } else {
        await apiPost('/api/galeri', payload)
        toast.success('Galeri berhasil ditambahkan')
      }
      setDialogOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkAdd = async () => {
    const urls = bulkUrls
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    if (urls.length === 0) {
      toast.error('Masukkan minimal satu URL')
      return
    }
    setSaving(true)
    try {
      const items = urls.map((url, i) => ({
        judul: `${bulkKategori === 'FOTO' ? 'Foto' : 'Video'} ${Date.now()}-${i + 1}`,
        kategori: bulkKategori,
        url,
        thumbnail: url,
      }))
      await apiPost('/api/galeri', { items })
      toast.success(`${items.length} item berhasil ditambahkan`)
      setBulkOpen(false)
      setBulkUrls('')
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambahkan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await apiDelete(`/api/galeri/${deleteId}`)
      toast.success('Galeri berhasil dihapus')
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
        title="Galeri"
        description="Kelola galeri foto dan video PPDI Cikampek"
        onAdd={openAdd}
        addLabel="Tambah Item"
      >
        <Button variant="outline" onClick={() => setBulkOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Tambah Massal
        </Button>
        <SearchInput value={search} onChange={setSearch} placeholder="Cari galeri..." />
      </AdminPageHeader>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="FOTO">Foto</TabsTrigger>
          <TabsTrigger value="VIDEO">Video</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <AdminLoading rows={4} />
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <AdminEmpty message="Belum ada item galeri" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((g) => (
            <Card key={g.id} className="overflow-hidden group">
              <div className="aspect-square bg-muted relative">
                {g.kategori === 'FOTO' ? (
                  <img
                    src={g.thumbnail || g.url}
                    alt={g.judul}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <Video className="w-10 h-10 text-primary" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-black/60 text-white border-0">
                    {g.kategori === 'FOTO' ? (
                      <ImageIcon className="w-3 h-3 mr-1" />
                    ) : (
                      <Video className="w-3 h-3 mr-1" />
                    )}
                    {g.kategori}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9"
                    onClick={() => openEdit(g)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-9 w-9"
                    onClick={() => setDeleteId(g.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium line-clamp-1">{g.judul}</p>
                {g.deskripsi && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {g.deskripsi}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Single Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Galeri' : 'Tambah Galeri'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Perbarui item galeri' : 'Tambah item galeri baru'}
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
                  <SelectItem value="FOTO">Foto</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URL {form.kategori === 'FOTO' ? 'Foto' : 'Video'} *</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>URL Thumbnail (opsional)</Label>
              <Input
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                placeholder="Kosongkan untuk menggunakan URL utama"
              />
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
              ) : editing ? 'Simpan Perubahan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Massal Galeri</DialogTitle>
            <DialogDescription>
              Tempel beberapa URL (satu per baris) untuk menambah banyak item sekaligus.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Kategori</Label>
              <Select
                value={bulkKategori}
                onValueChange={setBulkKategori}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOTO">Foto</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URL (satu per baris)</Label>
              <Textarea
                value={bulkUrls}
                onChange={(e) => setBulkUrls(e.target.value)}
                rows={8}
                placeholder={'https://example.com/foto1.jpg\nhttps://example.com/foto2.jpg\nhttps://example.com/foto3.jpg'}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>Batal</Button>
            <Button onClick={handleBulkAdd} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menambahkan...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Massal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus item ini?
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
