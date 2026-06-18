'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PublicView =
  | 'beranda'
  | 'profil'
  | 'pengurus'
  | 'berita'
  | 'berita-detail'
  | 'artikel'
  | 'artikel-detail'
  | 'kegiatan'
  | 'kegiatan-detail'
  | 'agenda'
  | 'galeri'
  | 'download'
  | 'kontak'

type ProfilTab = 'sejarah' | 'visi' | 'misi' | 'tujuan' | 'adart' | 'struktur'

type AdminView =
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-pengurus'
  | 'admin-desa'
  | 'admin-jabatan'
  | 'admin-berita'
  | 'admin-artikel'
  | 'admin-kegiatan'
  | 'admin-agenda'
  | 'admin-galeri'
  | 'admin-download'
  | 'admin-setting'
  | 'admin-pesan'
  | 'admin-audit'
  | 'admin-user'

interface AppState {
  // Navigation
  isPublic: boolean
  currentView: string
  currentParams: Record<string, string>
  adminView: string

  // UI state
  mobileMenuOpen: boolean
  searchOpen: boolean
  globalSearch: string

  // Auth (client-side cache)
  authUser: SessionUserClient | null

  // Actions
  navigate: (view: string, params?: Record<string, string>) => void
  goAdmin: (view: string) => void
  goToPublic: (view: PublicView, params?: Record<string, string>) => void
  setMobileMenu: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  setGlobalSearch: (q: string) => void
  setAuthUser: (user: SessionUserClient | null) => void
  logout: () => void
}

export interface SessionUserClient {
  id: string
  username: string
  name: string
  email: string | null
  role: string
  avatar: string | null
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isPublic: true,
      currentView: 'beranda',
      currentParams: {},
      adminView: 'admin-login',
      mobileMenuOpen: false,
      searchOpen: false,
      globalSearch: '',
      authUser: null,

      navigate: (view, params = {}) => {
        set({ currentView: view, currentParams: params, mobileMenuOpen: false })
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      },

      goAdmin: (view) => {
        set({ isPublic: false, adminView: view, mobileMenuOpen: false })
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0 })
        }
      },

      goToPublic: (view, params = {}) => {
        set({ isPublic: true, currentView: view, currentParams: params, mobileMenuOpen: false })
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      },

      setMobileMenu: (open) => set({ mobileMenuOpen: open }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      setGlobalSearch: (q) => set({ globalSearch: q }),
      setAuthUser: (user) => set({ authUser: user }),
      logout: () => {
        set({ authUser: null, isPublic: true, currentView: 'beranda', adminView: 'admin-login' })
      },
    }),
    {
      name: 'ppdi-storage',
      partialize: (state) => ({
        isPublic: state.isPublic,
        currentView: state.currentView,
        adminView: state.adminView,
        authUser: state.authUser,
      }),
    }
  )
)
