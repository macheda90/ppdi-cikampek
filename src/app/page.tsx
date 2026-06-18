'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/hooks/use-auth'
import { PublicSite } from '@/components/public/public-site'
import { AdminApp } from '@/components/admin/admin-app'

export default function Home() {
  const { isPublic, authUser, setAuthUser } = useAppStore()
  const { user, loading, logout } = useAuth()

  // Sync auth state
  useEffect(() => {
    // Zustand cache must reflect cookie changes (logout/login).
    // This runs on every auth change so AdminApp can re-render immediately.
    setAuthUser(user)
  }, [user, setAuthUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Memuat PPDI Cikampek...</p>
        </div>
      </div>
    )
  }

  // Show admin app if not in public mode (AdminApp handles login state internally)
  if (!isPublic) {
    return <AdminApp onLogout={logout} />
  }

  return <PublicSite />
}
