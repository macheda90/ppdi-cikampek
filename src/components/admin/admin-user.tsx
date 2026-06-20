'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { apiGet, apiPut, apiDelete } from '@/lib/api-client'
import { useAppStore } from '@/lib/store'
import type { User } from '@/lib/types'
import { ROLE_LABELS } from '@/lib/auth-shared'
import { formatDateTime } from '@/lib/types'

import { AdminPageHeader, SearchInput, AdminLoading, AdminEmpty } from './_shared'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Pencil, Trash2, Loader2, ShieldCheck, UserCircle } from 'lucide-react'
import { toast } from 'sonner'

interface UserWithPengurus extends User {
  pengurus?: { id: string; namaLengkap: string; desa?: { namaDesa: string } | null } | null
}

const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: 'bg-primary text-primary-foreground',
  ADMIN: 'bg-gold text-gold-foreground',
  EDITOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  PENGURUS: 'bg-muted text-muted-foreground',
}

const emptyForm = {
  name: '',
  email: '',
  role: 'PENGURUS',
  isActive: true,
  password: '',
}

export function AdminUser() {
  const { authUser } = useAppStore()
  const [items, setItems] = useState<UserWithPengurus[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<UserWithPengurus | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [deleting, setDeleting] = useState(false)

  const canDelete =
    authUser?.role === 'SUPER_ADMIN' || authUser?.role === 'ADMIN'

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ users: UserWithPengurus[] }>('/api/users')
      setItems(data.users)
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
    return items.filter((u) => {
      const matchSearch =
        !s ||
        u.name.toLowerCase().includes(s) ||
        u.username.toLowerCase().includes(s) ||
        (u.email || '').toLowerCase().includes(s)
      const matchRole = filterRole === 'all' || u.role === filterRole
      return matchSearch && matchRole
    })
  }, [items, search, filterRole])

  const openEdit = (item: UserWithPengurus) => {
    setEditing(item)
    setForm({
      name: item.name,
      email: item.email || '',
      role: item.role,
      isActive: item.isActive,
      password: '',
    })
    setAvatarFile(null)
    setDialogOpen(true)
  }


  const handleSave = async () => {
    if (!editing) return
    if (!form.name.trim()) {
      toast.error('Nama wajib diisi')
      return
    }
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        role: form.role,
        isActive: form.isActive,
      }
      if (form.password) {
        payload.password = form.password
      }

      if (avatarFile) {
        const fd = new FormData()
        fd.append('file', avatarFile)
        const uploadRes = await fetch('/api/upload/user-avatar', {
          method: 'POST',
          body: fd,
        })
        const uploadJson = (await uploadRes.json()) as { url?: string; error?: string }
        if (!uploadRes.ok || !uploadJson.url) {
          throw new Error(uploadJson.error || 'Gagal upload avatar')
        }
        payload.avatar = uploadJson.url
      }

      await apiPut(`/api/users/${editing.id}`, payload)
      toast.success('User berhasil diperbarui')
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
      await apiDelete(`/api/users/${deleteId}`)
      toast.success('User berhasil dihapus')
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
        title="Pengguna"
        description="Kelola akun pengguna dan hak akses"
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Cari user..." />
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminPageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <AdminLoading rows={5} />
          ) : filtered.length === 0 ? (
            <AdminEmpty message="Belum ada user" />
          ) : (
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Pengguna</TableHead>
                    <TableHead className="hidden md:table-cell">Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Login Terakhir</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={u.avatar || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {initials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium flex items-center gap-1">
                              {u.name}
                              {u.id === authUser?.id && (
                                <span className="text-[10px] text-muted-foreground">(Anda)</span>
                              )}
                            </div>
                            {u.email && (
                              <div className="text-xs text-muted-foreground truncate">
                                {u.email}
                              </div>
                            )}
                            {u.pengurus && (
                              <div className="text-[10px] text-muted-foreground/70 truncate">
                                {u.pengurus.namaLengkap}
                                {u.pengurus.desa ? ` • ${u.pengurus.desa.namaDesa}` : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        @{u.username}
                      </TableCell>
                      <TableCell>
                        <Badge className={ROLE_COLOR[u.role] || ''}>
                          {u.role === 'SUPER_ADMIN' && <ShieldCheck className="w-3 h-3 mr-1" />}
                          {ROLE_LABELS[u.role] || u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.isActive ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Nonaktif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Belum pernah'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(u)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {canDelete && u.id !== authUser?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(u.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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
          Menampilkan {filtered.length} dari {items.length} pengguna
        </p>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>
              Perbarui informasi dan hak akses pengguna
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
              <Avatar className="w-12 h-12">
                <AvatarImage src={editing?.avatar || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {editing && initials(editing.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{editing?.name}</p>
                <p className="text-sm text-muted-foreground">@{editing?.username}</p>
              </div>
            </div>
            <div>
              <Label>Nama</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
            <div className="flex items-center gap-3">
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(c) => setForm({ ...form, isActive: c })}
              />
              <Label htmlFor="isActive" className="cursor-pointer">Akun Aktif</Label>
            </div>
            <div>
              <Label>Avatar</Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setAvatarFile(f)
                    else setAvatarFile(null)
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Pilih file gambar. Jika kosong, avatar tidak berubah.
                </p>
              </div>
            </div>
            <div>
              <Label>Reset Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Kosongkan jika tidak ingin mengubah"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Masukkan password baru untuk mereset, atau kosongkan.
              </p>
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
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus User</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus user ini? Aksi ini tidak dapat dibatalkan
              dan akan menghapus seluruh data terkait.
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
