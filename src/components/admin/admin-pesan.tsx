'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { apiGet, apiPut, apiDelete } from '@/lib/api-client'
import type { PesanKontak } from '@/lib/types'
import { formatDateTime } from '@/lib/types'
import { AdminPageHeader, SearchInput, AdminLoading, AdminEmpty } from './_shared'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Mail, MailOpen, Trash2, Loader2, Mailbox, Search, Reply } from 'lucide-react'
import { toast } from 'sonner'

export function AdminPesan() {
  const [items, setItems] = useState<PesanKontak[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const [selected, setSelected] = useState<PesanKontak | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [markingRead, setMarkingRead] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ pesan: PesanKontak[] }>('/api/kontak')
      setItems(data.pesan)
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
    return items.filter((p) => {
      const matchSearch =
        !s ||
        p.nama.toLowerCase().includes(s) ||
        p.subjek.toLowerCase().includes(s) ||
        p.email.toLowerCase().includes(s)
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'unread' && !p.isRead) ||
        (filterStatus === 'read' && p.isRead)
      return matchSearch && matchStatus
    })
  }, [items, search, filterStatus])

  const unreadCount = items.filter((p) => !p.isRead).length

  const openDetail = async (p: PesanKontak) => {
    setSelected(p)
    if (!p.isRead) {
      await markAsRead(p.id)
    }
  }

  const markAsRead = async (id: string) => {
    setMarkingRead(id)
    try {
      await apiPut(`/api/pesan/${id}`, {})
      setItems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isRead: true } : p))
      )
      if (selected?.id === id) {
        setSelected({ ...selected, isRead: true })
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menandai pesan')
    } finally {
      setMarkingRead(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await apiDelete(`/api/pesan/${deleteId}`)
      toast.success('Pesan berhasil dihapus')
      setDeleteId(null)
      if (selected?.id === deleteId) setSelected(null)
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
        title="Pesan Masuk"
        description={
          unreadCount > 0
            ? `${unreadCount} pesan belum dibaca dari total ${items.length} pesan`
            : `Total ${items.length} pesan`
        }
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Cari pesan..." />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="unread">Belum Dibaca</SelectItem>
            <SelectItem value="read">Sudah Dibaca</SelectItem>
          </SelectContent>
        </Select>
      </AdminPageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <AdminLoading rows={6} />
          ) : filtered.length === 0 ? (
            <AdminEmpty message="Belum ada pesan masuk" />
          ) : (
            <div className="max-h-[75vh] overflow-y-auto custom-scrollbar divide-y">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  onClick={() => openDetail(p)}
                  className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                    !p.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback
                      className={`text-xs font-semibold ${
                        p.isRead
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {initials(p.nama)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm ${!p.isRead ? 'font-bold' : 'font-medium'}`}>
                        {p.nama}
                      </span>
                      {!p.isRead && (
                        <Badge className="bg-gold text-gold-foreground text-[10px] h-5">
                          Baru
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDateTime(p.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm font-medium truncate mt-0.5">{p.subjek}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {p.pesan}
                    </div>
                    <div className="text-xs text-muted-foreground/70 mt-1">{p.email}</div>
                  </div>
                  {!p.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{selected?.subjek}</DialogTitle>
            <DialogDescription>
              {selected && formatDateTime(selected.createdAt)}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-3 pb-4 border-b">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials(selected.nama)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selected.nama}</p>
                  <p className="text-sm text-muted-foreground">{selected.email}</p>
                  {selected.telepon && (
                    <p className="text-sm text-muted-foreground">Telp: {selected.telepon}</p>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Pesan</Label>
                <div className="mt-2 p-4 rounded-md bg-muted/50 whitespace-pre-wrap text-sm leading-relaxed">
                  {selected.pesan}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90"
                >
                  <a href={`mailto:${selected.email}?subject=Re: ${selected.subjek}`}>
                    <Reply className="w-4 h-4 mr-2" />
                    Balas via Email
                  </a>
                </Button>
                {!selected.isRead && (
                  <Button
                    variant="outline"
                    onClick={() => markAsRead(selected.id)}
                    disabled={markingRead === selected.id}
                  >
                    {markingRead === selected.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <MailOpen className="w-4 h-4 mr-2" />
                    )}
                    Tandai Dibaca
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(selected.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pesan ini?
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
