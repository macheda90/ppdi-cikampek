'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api-client'
import type { Galeri } from '@/lib/types'
import { AdminEmpty, AdminLoading, AdminPageHeader, SearchInput } from './_shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
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
import { Image as ImageIcon, Loader2, Pencil, Plus, Trash2, Upload, Video } from 'lucide-react'
import { toast } from 'sonner'

type AddMode = 'FOTO' | 'VIDEO'

const emptyForm = {
  judul: '',
  url: '', // for VIDEO
  thumbnail: '',
  deskripsi: '',
}

async function uploadSingle(file: File, category?: string) {
  const fd = new FormData()
  fd.append('file', file)
  if (category) fd.append('category', category)

  const res = await fetch('/api/upload/thumbnail', {
    method: 'POST',
    body: fd,
  })

  const data = (await res.json()) as { url?: string; error?: string }
  if (!res.ok || !data.url) throw new Error(data.error || 'Upload gagal')
  return data.url
}

export function AdminGaleri() {
  const [items, setItems] = useState<Galeri[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'FOTO' | 'VIDEO'>('all')
  const [search, setSearch] = useState('')

  // dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mode, setMode] = useState<AddMode>('FOTO')
  const [editing, setEditing] = useState<Galeri | null>(null)

  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState(emptyForm)
  const [fotoFiles, setFotoFiles] = useState<File[]>([])
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')

  // dynamic file inputs
  const maxFotoFiles = 10
  const [fotoPickCount, setFotoPickCount] = useState(1)

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

  const openAdd = (m: AddMode) => {
    setEditing(null)
    setMode(m)
    setForm(emptyForm)
    setFotoFiles([])
    setThumbnailFile(null)
    setThumbnailPreview('')
    setFotoPickCount(1)
    setDialogOpen(true)
  }

  const openEdit = (item: Galeri) => {
    setEditing(item)
    const m: AddMode = item.kategori === 'VIDEO' ? 'VIDEO' : 'FOTO'
    setMode(m)

    setForm({
      judul: item.judul,
      url: item.url || '',
      thumbnail: item.thumbnail || '',
      deskripsi: item.deskripsi || '',
    })

    // FOTO edit: url/thumbnail akan di-handle via select file pertama bila user memilih
    setFotoFiles([])
    setThumbnailFile(null)
    setThumbnailPreview('')
    setFotoPickCount(1)

    setDialogOpen(true)
  }

  const resetFotoPick = () => {
    setFotoFiles([])
    setFotoPickCount(1)
  }

  const onPickFoto = (idx: number, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    const file = fileList[0]

    setFotoFiles((prev) => {
      const next = [...prev]
      next[idx] = file
      return next.filter(Boolean)
    })

    // ensure next picker exists until max
    setFotoPickCount((prev) => {
      const shouldGrow = idx + 1 <= maxFotoFiles
      if (!shouldGrow) return prev
      return Math.max(prev, idx + 2)
    })
  }

  const handleSubmit = async () => {
    const kategori: Galeri['kategori'] = mode

    if (!form.judul.trim()) {
      toast.error('Judul wajib diisi')
      return
    }

    try {
      setSaving(true)

      if (mode === 'FOTO') {
        const files = fotoFiles.filter(Boolean)
        if (files.length === 0) {
          toast.error('Pilih minimal 1 foto')
          return
        }

        const filesToUpload = editing ? [files[0]] : files
        const urls = await Promise.all(filesToUpload.map((f) => uploadSingle(f, 'photos')))
        const url = urls[0]
        const thumbnailUrl = urls[0]

        if (editing) {
          const payload = {
            judul: form.judul,
            kategori,
            url,
            thumbnail: thumbnailUrl,
            deskripsi: form.deskripsi || null,
          }
          await apiPut(`/api/galeri/${editing.id}`, payload)
          toast.success('Galeri FOTO berhasil diperbarui')
        } else {
          // bulk create: 1 item per file
          const allUrls = await Promise.all(files.map((f) => uploadSingle(f, 'photos')))
          const thumb = allUrls[0]
          const payloadItems = allUrls.map((u, i) => ({
            judul: payloadJudulFoto(form.judul, i),
            kategori,
            url: u,
            thumbnail: thumb,
            deskripsi: form.deskripsi || undefined,
          }))

          await apiPost('/api/galeri', { items: payloadItems })
          toast.success(`${payloadItems.length} item FOTO berhasil ditambahkan`)
        }
      } else {
        // VIDEO
        if (!form.url.trim()) {
          toast.error('URL Video wajib diisi')
          return
        }
        if (!thumbnailFile) {
          toast.error('Pilih minimal 1 file thumbnail untuk VIDEO')
          return
        }

        const thumbnailUrl = await uploadSingle(thumbnailFile, 'thumbnails')

        if (editing) {
          const payload = {
            judul: form.judul,
            kategori,
            url: form.url,
            thumbnail: thumbnailUrl,
            deskripsi: form.deskripsi || null,
          }
          await apiPut(`/api/galeri/${editing.id}`, payload)
          toast.success('Galeri VIDEO berhasil diperbarui')
        } else {
          const payload = {
            judul: form.judul,
            kategori,
            url: form.url,
            thumbnail: thumbnailUrl,
            deskripsi: form.deskripsi || null,
          }
          await apiPost('/api/galeri', payload)
          toast.success('Galeri VIDEO berhasil ditambahkan')
        }
      }

      setDialogOpen(false)
      await fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const payloadJudulFoto = (base: string, idx: number) => {
    if (idx === 0) return base
    return `${base} ${idx + 1}`
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
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => openAdd('FOTO')}>
            <Upload className="w-4 h-4 mr-2" />
            Tambah Foto
          </Button>
          <Button variant="outline" onClick={() => openAdd('VIDEO')}>
            <Video className="w-4 h-4 mr-2" />
            Tambah Video
          </Button>
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Cari galeri..." />
      </AdminPageHeader>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-4">
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
                  <img src={g.thumbnail || g.url} alt={g.judul} className="w-full h-full object-cover" />
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
                  <Button size="icon" variant="secondary" className="h-9 w-9" onClick={() => openEdit(g)}>
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
                {g.deskripsi && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{g.deskripsi}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Galeri' : mode === 'FOTO' ? 'Tambah Foto' : 'Tambah Video'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'FOTO'
                ? 'Pilih file foto lokal (maks 10). Thumbnail otomatis dari file pertama.'
                : 'Pilih file thumbnail lokal untuk video.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Judul *</Label>
              <Input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
            </div>

            {mode === 'VIDEO' && (
              <div>
                <Label>URL Video *</Label>
                <Input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}

            {mode === 'FOTO' && (
              <div className="space-y-2">
                <Label>URL Foto *</Label>
                <div className="text-sm text-muted-foreground">
                  Gunakan tombol pilih file berikut. Setelah memilih, input berikutnya akan muncul otomatis.
                </div>

                <div className="space-y-2">
                  {Array.from({ length: Math.min(fotoPickCount, maxFotoFiles) }).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm"
                        onChange={(e) => onPickFoto(idx, e.target.files)}
                        disabled={fotoFiles.length > idx && !!fotoFiles[idx]}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => resetFotoPick()}
                        disabled={fotoFiles.length === 0}
                      >
                        Reset
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground">
                  Dipilih: {fotoFiles.filter(Boolean).length}/{maxFotoFiles}
                </div>
              </div>
            )}

            {mode === 'VIDEO' && (
              <div className="space-y-2">
                <Label>URL Thumbnail *</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null
                    setThumbnailFile(f)
                    setThumbnailPreview(f ? URL.createObjectURL(f) : '')
                  }}
                />
                {thumbnailPreview && (
                  <div className="mt-2">
                    <img src={thumbnailPreview} alt="thumbnail preview" className="w-24 h-24 object-cover rounded" />
                  </div>
                )}
              </div>
            )}

            {/* FOTO: URL Thumbnail dihilangkan */}

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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : editing ? (
                'Simpan Perubahan'
              ) : (
                'Tambah'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>Apakah Anda yakin ingin menghapus item ini?</AlertDialogDescription>
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

