'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'
import type { Jabatan } from '@/lib/types'
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
import { Pencil, Trash2, Loader2, Briefcase, Users } from 'lucide-react'
import { toast } from 'sonner'

interface JabatanWithCount extends Jabatan {
  _count?: { pengurus: number }
}

const KATEGORI_LABEL: Record<string, string> = {
  PIMPINAN: 'Pimpinan',
  BIDANG: 'Bidang',
  ANGGOTA: 'Anggota',
}

const KATEGORI_COLOR: Record<string, string> = {
  PIMPINAN: 'bg-primary text-primary-foreground',
  BIDANG: 'bg-gold text-gold-foreground',
  ANGGOTA: 'bg-muted text-muted-foreground',
}

const emptyForm = {
  namaJabatan: '',
  kategori: 'ANGGOTA',
  urutan: '99',
}

export function AdminJabatan() {
  const [items, setItems] = useState<JabatanWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<JabatanWithCount | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ jabatan: JabatanWithCount[] }>('/api/jabatan')
      setItems(data.jabatan)
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
      (j) => !s || j.namaJabatan.toLowerCase().includes(s) || (KATEGORI_LABEL[j.kategori] || '').toLowerCase().includes(s)
    )
  }, [items, search])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (item: JabatanWithCount) => {
    setEditing(item)
    setForm({
      namaJabatan: item.namaJabatan,
      kategori: item.kategori,
      urutan: String(item.urutan),
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.namaJabatan.trim()) {
      toast.error('Nama jabatan wajib diisi')
      return
    }
    setSaving(true)
    try {
      const payload = {
        namaJabatan: form.namaJabatan,
        kategori: form.kategori,
        urutan: parseInt(form.urutan) || 99,
      }
      if (editing) {
        await apiPut(`/api/jabatan/${editing.id}`, payload)
        toast.success('Jabatan berhasil diperbarui')
      } else {
        await apiPost('/api/jabatan', payload)
        toast.success('Jabatan berhasil ditambahkan')
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
      await apiDelete(`/api/jabatan/${deleteId}`)
      toast.success('Jabatan berhasil dihapus')
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
        title="Jabatan"
        description="Kelola daftar jabatan dalam struktur PPDI Cikampek"
        onAdd={openAdd}
        addLabel="Tambah Jabatan"
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Cari jabatan..." />
      </AdminPageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <AdminLoading rows={5} />
          ) : filtered.length === 0 ? (
            <AdminEmpty message="Belum ada data jabatan" />
          ) : (
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-16">Urutan</TableHead>
                    <TableHead>Nama Jabatan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Pengurus</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((j) => (
                    <TableRow key={j.id}>
                      <TableCell>
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-muted text-xs font-semibold">
                          {j.urutan}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{j.namaJabatan}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={KATEGORI_COLOR[j.kategori] || ''}>
                          {KATEGORI_LABEL[j.kategori] || j.kategori}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Users className="w-3 h-3 mr-1" />
                          {j._count?.pengurus ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(j)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(j.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Jabatan' : 'Tambah Jabatan'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Perbarui data jabatan' : 'Tambah jabatan baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nama Jabatan *</Label>
              <Input
                value={form.namaJabatan}
                onChange={(e) => setForm({ ...form, namaJabatan: e.target.value })}
                placeholder="mis. Ketua, Wakil Ketua, Sekretaris"
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
                  <SelectItem value="PIMPINAN">Pimpinan</SelectItem>
                  <SelectItem value="BIDANG">Bidang</SelectItem>
                  <SelectItem value="ANGGOTA">Anggota</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Urutan (1 = teratas)</Label>
              <Input
                type="number"
                min="1"
                value={form.urutan}
                onChange={(e) => setForm({ ...form, urutan: e.target.value })}
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
              ) : editing ? 'Simpan Perubahan' : 'Tambah Jabatan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jabatan ini?
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
