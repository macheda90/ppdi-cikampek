// Client-safe auth constants and helpers (no server imports)
// This file can be safely imported from client components

const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  PENGURUS: 'PENGURUS',
} as const

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  PENGURUS: 'Pengurus',
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-700 border-red-200',
  ADMIN: 'bg-primary/10 text-primary border-primary/20',
  EDITOR: 'bg-blue-100 text-blue-700 border-blue-200',
  PENGURUS: 'bg-muted text-muted-foreground border-border',
}

function hasPermission(role: string, allowedRoles: string[]): boolean {
  if (role === ROLES.SUPER_ADMIN) return true
  return allowedRoles.includes(role)
}
