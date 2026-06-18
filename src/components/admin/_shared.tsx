'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search } from 'lucide-react'

interface AdminPageHeaderProps {
  title: string
  description?: string
  onAdd?: () => void
  addLabel?: string
  children?: ReactNode
}

export function AdminPageHeader({
  title,
  description,
  onAdd,
  addLabel = 'Tambah',
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {onAdd && (
          <Button onClick={onAdd} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

interface SearchInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = 'Cari...' }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 w-full sm:w-64"
      />
    </div>
  )
}

function AdminTableCard({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  )
}

export function AdminLoading({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardContent className="p-0">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 border-b last:border-0">
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function AdminEmpty({ message = 'Belum ada data' }: { message?: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}
