'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'
import type { Desa } from '@/lib/types'
import { AdminPageHeader, SearchInput, AdminLoading, AdminEmpty } from './_shared'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Trash2, Loader2, Building2, Users } from 'lucide-react'
import { toast } from 'sonner'

interface DesaWithCount extends Desa {
  _count?: { pengurus: number }
}

const emptyForm = {
  namaDesa: '',
  alamat: '',
  kecamatan: 'Cikampek',
  kabupaten: 'Karawang',
  provinsi: 'Jawa Barat',
  kodePos: '',
  kepalaDesa: '',
  kontak: '',
}

export function AdminDesa() {
  const [items, setItems] = useState<DesaWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DesaWithCount | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Include pengurus counts via separate fetch fallback (API doesn't include _count by default)
      const data = await apiGet<{ desa: DesaWithCount[] }>('/api/desa')
      setItems(data.desa)
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
      (d) => !s || d.namaDesa.toLowerCase().includes(s) || (d.kepalaDesa || '').toLowerCase().includes(s)
    )
  }, [items, search])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (item: DesaWithCount) => {
    setEditing(item)
    setForm({
      namaDesa: item.namaDesa,
      alamat: item.alamat || '',
      kecamatan: item.kecamatan,
      kabupaten: item.kabupaten,
      provinsi: item.provinsi,
      kodePos: item.kodePos || '',
      kepalaDesa: item.kepalaDesa || '',
      kontak: item.kontak || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.namaDesa.trim()) {
      toast.error('Nama desa wajib diisi')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await apiPut(`/api/desa/${editing.id}`, form)
        toast.success('Desa berhasil diperbarui')
      } else {
        await apiPost('/api/desa', form)
        toast.success('Desa berhasil ditambahkan')
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
      await apiDelete(`/api/desa/${deleteId}`)
      toast.success('Desa berhasil dihapus')
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
        title="Desa"
        description="Kelola data desa yang tergabung dalam PPDI Cikampek"
        onAdd={openAdd}
        addLabel="Tambah Desa"
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Cari desa..." />
      </AdminPageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <AdminLoading rows={5} />
          ) : filtered.length === 0 ? (
            <AdminEmpty message="Belum ada data desa" />
          ) : (
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Nama Desa</TableHead>
                    <TableHead className="hidden md:table-cell">Kepala Desa</TableHead>
                    <TableHead className="hidden lg:table-cell">Kecamatan</TableHead>
                    <TableHead className="hidden lg:table-cell">Kabupaten</TableHead>
                    <TableHead>Pengurus</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{d.namaDesa}</div>
                            {d.alamat && (
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {d.alamat}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {d.kepalaDesa || '-'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {d.kecamatan}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {d.kabupaten}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Users className="w-3 h-3 mr-1" />
                          {d._count?.pengurus ?? 0}
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Desa' : 'Tambah Desa'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Perbarui data desa' : 'Tambah desa baru ke sistem'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="md:col-span-2">
              <Label>Nama Desa *</Label>
              <Input
                value={form.namaDesa}
                onChange={(e) => setForm({ ...form, namaDesa: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Alamat</Label>
              <Input
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              />
            </div>
            <div>
              <Label>Kecamatan</Label>
              <Input
                value={form.kecamatan}
                onChange={(e) => setForm({ ...form, kecamatan: e.target.value })}
              />
            </div>
            <div>
              <Label>Kabupaten</Label>
              <Input
                value={form.kabupaten}
                onChange={(e) => setForm({ ...form, kabupaten: e.target.value })}
              />
            </div>
            <div>
              <Label>Provinsi</Label>
              <Input
                value={form.provinsi}
                onChange={(e) => setForm({ ...form, provinsi: e.target.value })}
              />
            </div>
            <div>
              <Label>Kode Pos</Label>
              <Input
                value={form.kodePos}
                onChange={(e) => setForm({ ...form, kodePos: e.target.value })}
              />
            </div>
            <div>
              <Label>Kepala Desa</Label>
              <Input
                value={form.kepalaDesa}
                onChange={(e) => setForm({ ...form, kepalaDesa: e.target.value })}
              />
            </div>
            <div>
              <Label>Kontak</Label>
              <Input
                value={form.kontak}
                onChange={(e) => setForm({ ...form, kontak: e.target.value })}
                placeholder="No. telepon / email"
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
              ) : editing ? 'Simpan Perubahan' : 'Tambah Desa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus desa ini? Pengurus yang terkait akan kehilangan
              referensi desa.
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
