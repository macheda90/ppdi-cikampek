'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'
import type { Pengurus, Desa, Jabatan } from '@/lib/types'
import { formatDate } from '@/lib/types'
import { AdminPageHeader, SearchInput, AdminLoading, AdminEmpty } from './_shared'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Pencil, Trash2, Loader2, Users, UserCircle } from 'lucide-react'
import { toast } from 'sonner'
import { ROLE_LABELS } from '@/lib/auth-shared'

interface PengurusWithRelations extends Pengurus {
  user?: { id: string; username: string; role: string } | null
}

interface FormState {
  namaLengkap: string
  nipd: string
  nik: string
  tempatLahir: string
  tanggalLahir: string
  jenisKelamin: string
  foto: string
  desaId: string
  jabatanId: string
  masaJabatan: string
  alamat: string
  noHp: string
  email: string
  statusAktif: boolean
  // User account (optional)
  createAccount: boolean
  username: string
  password: string
  role: string
}

const emptyForm: FormState = {
  namaLengkap: '',
  nipd: '',
  nik: '',
  tempatLahir: '',
  tanggalLahir: '',
  jenisKelamin: 'LAKI-LAKI',
  foto: '',
  desaId: '',
  jabatanId: '',
  masaJabatan: '',
  alamat: '',
  noHp: '',
  email: '',
  statusAktif: true,
  createAccount: false,
  username: '',
  password: '',
  role: 'PENGURUS',
}

export function AdminPengurus() {
  const [items, setItems] = useState<PengurusWithRelations[]>([])
  const [desaList, setDesaList] = useState<Desa[]>([])
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDesa, setFilterDesa] = useState('all')
  const [filterJabatan, setFilterJabatan] = useState('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PengurusWithRelations | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [pengurusRes, desaRes, jabatanRes] = await Promise.all([
        apiGet<{ pengurus: PengurusWithRelations[] }>('/api/pengurus?admin=true'),
        apiGet<{ desa: Desa[] }>('/api/desa'),
        apiGet<{ jabatan: Jabatan[] }>('/api/jabatan'),
      ])
      setItems(pengurusRes.pengurus)
      setDesaList(desaRes.desa)
      setJabatanList(jabatanRes.jabatan)
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
    return items.filter((p) => {
      const s = search.toLowerCase()
      const matchSearch =
        !s ||
        p.namaLengkap.toLowerCase().includes(s) ||
        (p.nipd || '').toLowerCase().includes(s)
      const matchDesa = filterDesa === 'all' || p.desaId === filterDesa
      const matchJabatan = filterJabatan === 'all' || p.jabatanId === filterJabatan
      return matchSearch && matchDesa && matchJabatan
    })
  }, [items, search, filterDesa, filterJabatan])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (item: PengurusWithRelations) => {
    setEditing(item)
    setForm({
      namaLengkap: item.namaLengkap,
      nipd: item.nipd || '',
      nik: item.nik || '',
      tempatLahir: item.tempatLahir || '',
      tanggalLahir: item.tanggalLahir ? item.tanggalLahir.split('T')[0] : '',
      jenisKelamin: item.jenisKelamin || 'LAKI-LAKI',
      foto: item.foto || '',
      desaId: item.desaId || '',
      jabatanId: item.jabatanId || '',
      masaJabatan: item.masaJabatan || '',
      alamat: item.alamat || '',
      noHp: item.noHp || '',
      email: item.email || '',
      statusAktif: item.statusAktif,
      createAccount: !!item.user,
      username: item.user?.username || '',
      password: '',
      role: item.user?.role || 'PENGURUS',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.namaLengkap.trim()) {
      toast.error('Nama lengkap wajib diisi')
      return
    }
    setSaving(true)
    try {
      const payload: Record<string, unknown> = { ...form }
      if (!form.createAccount) {
        delete payload.username
        delete payload.password
        delete payload.role
      }
      if (editing) {
        await apiPut(`/api/pengurus/${editing.id}`, payload)
        toast.success('Pengurus berhasil diperbarui')
      } else {
        await apiPost('/api/pengurus', payload)
        toast.success('Pengurus berhasil ditambahkan')
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
      await apiDelete(`/api/pengurus/${deleteId}`)
      toast.success('Pengurus berhasil dihapus')
      setDeleteId(null)
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus')
    } finally {
      setDeleting(false)
    }
  }

  const initials = (name: string) =>
    name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

  return (
    <div>
      <AdminPageHeader
        title="Pengurus"
        description="Kelola data pengurus PPDI Cikampek"
        onAdd={openAdd}
        addLabel="Tambah Pengurus"
      >
        <div className="flex flex-wrap gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari nama / NIPD..." />
          <Select value={filterDesa} onValueChange={setFilterDesa}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter Desa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Desa</SelectItem>
              {desaList.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.namaDesa}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterJabatan} onValueChange={setFilterJabatan}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter Jabatan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jabatan</SelectItem>
              {jabatanList.map((j) => (
                <SelectItem key={j.id} value={j.id}>{j.namaJabatan}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </AdminPageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <AdminLoading rows={6} />
          ) : filtered.length === 0 ? (
            <AdminEmpty message="Belum ada data pengurus" />
          ) : (
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-14">Foto</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="hidden md:table-cell">NIPD</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead className="hidden lg:table-cell">Desa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={p.foto || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {initials(p.namaLengkap)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{p.namaLengkap}</div>
                        {p.email && (
                          <div className="text-xs text-muted-foreground">{p.email}</div>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {p.nipd || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {p.jabatan?.namaJabatan || '-'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {p.desa?.namaDesa || '-'}
                      </TableCell>
                      <TableCell>
                        {p.statusAktif ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Nonaktif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(p.id)}
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
          Menampilkan {filtered.length} dari {items.length} pengurus
        </p>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Pengurus' : 'Tambah Pengurus'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Perbarui data pengurus' : 'Tambah pengurus baru ke sistem'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="md:col-span-2">
              <Label>Nama Lengkap *</Label>
              <Input
                value={form.namaLengkap}
                onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })}
              />
            </div>
            <div>
              <Label>NIPD</Label>
              <Input
                value={form.nipd}
                onChange={(e) => setForm({ ...form, nipd: e.target.value })}
              />
            </div>
            <div>
              <Label>NIK</Label>
              <Input
                value={form.nik}
                onChange={(e) => setForm({ ...form, nik: e.target.value })}
              />
            </div>
            <div>
              <Label>Tempat Lahir</Label>
              <Input
                value={form.tempatLahir}
                onChange={(e) => setForm({ ...form, tempatLahir: e.target.value })}
              />
            </div>
            <div>
              <Label>Tanggal Lahir</Label>
              <Input
                type="date"
                value={form.tanggalLahir}
                onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })}
              />
            </div>
            <div>
              <Label>Jenis Kelamin</Label>
              <Select
                value={form.jenisKelamin}
                onValueChange={(v) => setForm({ ...form, jenisKelamin: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LAKI-LAKI">Laki-laki</SelectItem>
                  <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URL Foto</Label>
              <Input
                value={form.foto}
                onChange={(e) => setForm({ ...form, foto: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Desa</Label>
              <Select
                value={form.desaId}
                onValueChange={(v) => setForm({ ...form, desaId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih desa" />
                </SelectTrigger>
                <SelectContent>
                  {desaList.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.namaDesa}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Jabatan</Label>
              <Select
                value={form.jabatanId}
                onValueChange={(v) => setForm({ ...form, jabatanId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jabatan" />
                </SelectTrigger>
                <SelectContent>
                  {jabatanList.map((j) => (
                    <SelectItem key={j.id} value={j.id}>{j.namaJabatan}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Masa Jabatan</Label>
              <Input
                value={form.masaJabatan}
                onChange={(e) => setForm({ ...form, masaJabatan: e.target.value })}
                placeholder="2024-2029"
              />
            </div>
            <div>
              <Label>No. HP</Label>
              <Input
                value={form.noHp}
                onChange={(e) => setForm({ ...form, noHp: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Alamat</Label>
              <Textarea
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                rows={2}
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <Switch
                id="statusAktif"
                checked={form.statusAktif}
                onCheckedChange={(c) => setForm({ ...form, statusAktif: c })}
              />
              <Label htmlFor="statusAktif" className="cursor-pointer">Status Aktif</Label>
            </div>

            {/* Account section */}
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <div className="flex items-center gap-3 mb-3">
                <Switch
                  id="createAccount"
                  checked={form.createAccount}
                  onCheckedChange={(c) => setForm({ ...form, createAccount: c })}
                />
                <Label htmlFor="createAccount" className="cursor-pointer flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  Buat / kelola akun login
                </Label>
              </div>
              {form.createAccount && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-md bg-muted/50">
                  <div>
                    <Label>Username</Label>
                    <Input
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Password {editing ? '(kosongkan jika tidak diubah)' : ''}</Label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select
                      value={form.role}
                      onValueChange={(v) => setForm({ ...form, role: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLE_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
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
              ) : editing ? 'Simpan Perubahan' : 'Tambah Pengurus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengurus ini? Aksi ini tidak dapat dibatalkan
              dan akan menghapus juga akun login yang terkait.
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
