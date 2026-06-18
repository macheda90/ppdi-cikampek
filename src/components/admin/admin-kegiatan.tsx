'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'
import type { Kegiatan } from '@/lib/types'
import { formatDate } from '@/lib/types'
import { AdminPageHeader, SearchInput, AdminLoading, AdminEmpty } from './_shared'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Trash2, Loader2, Image as ImageIcon, MapPin, User } from 'lucide-react'
import { toast } from 'sonner'

const emptyForm = {
  namaKegiatan: '',
  tanggal: '',
  lokasi: '',
  penanggungJawab: '',
  deskripsi: '',
  fotos: '',
  videoUrl: '',
}

function parseFotos(raw: string | null): string[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) return arr.filter(Boolean)
  } catch {
    // ignore
  }
  // Fallback: comma separated
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

export function AdminKegiatan() {
  const [items, setItems] = useState<Kegiatan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Kegiatan | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ kegiatan: Kegiatan[] }>('/api/kegiatan')
      setItems(data.kegiatan)
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
    return items.filter(
      (k) => !s || k.namaKegiatan.toLowerCase().includes(s) || (k.lokasi || '').toLowerCase().includes(s)
    )
  }, [items, search])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (item: Kegiatan) => {
    setEditing(item)
    setForm({
      namaKegiatan: item.namaKegiatan,
      tanggal: item.tanggal ? item.tanggal.split('T')[0] : '',
      lokasi: item.lokasi || '',
      penanggungJawab: item.penanggungJawab || '',
      deskripsi: item.deskripsi || '',
      fotos: parseFotos(item.fotos).join(', '),
      videoUrl: item.videoUrl || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.namaKegiatan.trim()) {
      toast.error('Nama kegiatan wajib diisi')
      return
    }
    if (!form.tanggal) {
      toast.error('Tanggal wajib diisi')
      return
    }
    setSaving(true)
    try {
      const fotosArray = form.fotos
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const payload = {
        namaKegiatan: form.namaKegiatan,
        tanggal: form.tanggal,
        lokasi: form.lokasi,
        penanggungJawab: form.penanggungJawab,
        deskripsi: form.deskripsi,
        fotos: fotosArray,
        videoUrl: form.videoUrl,
      }
      if (editing) {
        await apiPut(`/api/kegiatan/${editing.id}`, payload)
        toast.success('Kegiatan berhasil diperbarui')
      } else {
        await apiPost('/api/kegiatan', payload)
        toast.success('Kegiatan berhasil ditambahkan')
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
      await apiDelete(`/api/kegiatan/${deleteId}`)
      toast.success('Kegiatan berhasil dihapus')
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
        title="Kegiatan"
        description="Kelola dokumentasi kegiatan PPDI Cikampek"
        onAdd={openAdd}
        addLabel="Tambah Kegiatan"
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Cari kegiatan..." />
      </AdminPageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <AdminLoading rows={5} />
          ) : filtered.length === 0 ? (
            <AdminEmpty message="Belum ada kegiatan" />
          ) : (
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-20">Foto</TableHead>
                    <TableHead>Nama Kegiatan</TableHead>
                    <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                    <TableHead className="hidden lg:table-cell">Lokasi</TableHead>
                    <TableHead className="hidden lg:table-cell">Penanggung Jawab</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((k) => {
                    const fotos = parseFotos(k.fotos)
                    return (
                      <TableRow key={k.id}>
                        <TableCell>
                          <div className="w-16 h-12 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                            {fotos[0] ? (
                              <img src={fotos[0]} alt={k.namaKegiatan} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium line-clamp-2">{k.namaKegiatan}</div>
                          {fotos.length > 0 && (
                            <div className="text-xs text-muted-foreground">{fotos.length} foto</div>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {formatDate(k.tanggal)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {k.lokasi ? (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {k.lokasi}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {k.penanggungJawab ? (
                            <span className="inline-flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {k.penanggungJawab}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(k)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(k.id)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Kegiatan' : 'Tambah Kegiatan'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Perbarui kegiatan' : 'Tambah kegiatan baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nama Kegiatan *</Label>
              <Input
                value={form.namaKegiatan}
                onChange={(e) => setForm({ ...form, namaKegiatan: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tanggal *</Label>
                <Input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                />
              </div>
              <div>
                <Label>Lokasi</Label>
                <Input
                  value={form.lokasi}
                  onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Penanggung Jawab</Label>
              <Input
                value={form.penanggungJawab}
                onChange={(e) => setForm({ ...form, penanggungJawab: e.target.value })}
              />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label>URL Foto (pisahkan dengan koma)</Label>
              <Textarea
                value={form.fotos}
                onChange={(e) => setForm({ ...form, fotos: e.target.value })}
                rows={3}
                placeholder="https://foto1.jpg, https://foto2.jpg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Masukkan beberapa URL foto dipisahkan dengan tanda koma.
              </p>
            </div>
            <div>
              <Label>URL Video (opsional)</Label>
              <Input
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
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
              ) : editing ? 'Simpan Perubahan' : 'Tambah Kegiatan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kegiatan ini?
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
