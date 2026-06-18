'use client'

import { useEffect, useState, useCallback } from 'react'
import { apiGet, apiPost } from '@/lib/api-client'
import { useAppStore, type SessionUserClient } from '@/lib/store'

export function useAuth() {
  const [user, setUser] = useState<SessionUserClient | null>(null)
  const [loading, setLoading] = useState(true)
  const { setAuthUser } = useAppStore()

  const checkAuth = useCallback(async () => {
    try {
      const data = await apiGet<{ user: SessionUserClient | null }>('/api/auth/me')
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (username: string, password: string) => {
    const data = await apiPost<{ user: SessionUserClient }>('/api/auth/login', { username, password })
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    await apiPost('/api/auth/logout')
    setUser(null)
    // Immediately clear persisted Zustand cache so UI switches right away.
    setAuthUser(null)
  }

  return { user, loading, login, logout, checkAuth }
}
