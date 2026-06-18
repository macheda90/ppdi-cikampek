'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { apiGet } from '@/lib/api-client'
import type { AuditLog } from '@/lib/types'
import { formatDateTime } from '@/lib/types'
import { AdminPageHeader, SearchInput, AdminLoading, AdminEmpty } from './_shared'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { History, LogIn, LogOut, Plus, Pencil, Trash2, Activity as ActivityIcon, User } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AuditLogWithUser extends AuditLog {
  user?: { username: string; name: string } | null
}

const ACTION_OPTIONS = ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE'] as const

const ACTION_COLOR: Record<string, string> = {
  LOGIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  LOGOUT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  CREATE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  UPDATE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const ACTION_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  LOGIN: LogIn,
  LOGOUT: LogOut,
  CREATE: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
}

export function AdminAudit() {
  const [items, setItems] = useState<AuditLogWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState('all')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ logs: AuditLogWithUser[] }>('/api/audit?limit=200')
      setItems(data.logs)
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
    return items.filter((l) => {
      const matchSearch =
        !s ||
        (l.userName || '').toLowerCase().includes(s) ||
        l.module.toLowerCase().includes(s) ||
        (l.detail || '').toLowerCase().includes(s)
      const matchAction = filterAction === 'all' || l.action === filterAction
      return matchSearch && matchAction
    })
  }, [items, search, filterAction])

  return (
    <div>
      <AdminPageHeader
        title="Log Aktivitas"
        description="Riwayat aktivitas pengguna pada sistem (200 entri terakhir)"
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Cari aktivitas..." />
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Aksi</SelectItem>
            {ACTION_OPTIONS.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminPageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <AdminLoading rows={8} />
          ) : filtered.length === 0 ? (
            <AdminEmpty message="Belum ada log aktivitas" />
          ) : (
            <div className="max-h-[75vh] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-32">Waktu</TableHead>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Aksi</TableHead>
                    <TableHead className="hidden md:table-cell">Modul</TableHead>
                    <TableHead className="hidden lg:table-cell">Detail</TableHead>
                    <TableHead className="hidden lg:table-cell">IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => {
                    const Icon = ACTION_ICON[l.action] || ActivityIcon
                    return (
                      <TableRow key={l.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(l.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {l.user?.name?.[0]?.toUpperCase() || (
                                  <User className="w-3 h-3" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium truncate max-w-[140px]">
                              {l.userName || 'System'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(ACTION_COLOR[l.action] || '', 'whitespace-nowrap')}>
                            <Icon className="w-3 h-3 mr-1" />
                            {l.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {l.module}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-xs">
                          <span className="line-clamp-1">{l.detail || '-'}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground font-mono">
                          {l.ipAddress || '-'}
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

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <History className="w-3 h-3" />
          Menampilkan {filtered.length} dari {items.length} log
        </p>
      )}
    </div>
  )
}
