'use client'

import { useAppStore } from '@/lib/store'
import { AdminLogin } from './admin-login'
import { AdminLayout } from './admin-layout'
import { AdminDashboard } from './admin-dashboard'
import { AdminDashboardUser } from './admin-dashboard-user'

import { AdminPengurus } from './admin-pengurus'

import { AdminDesa } from './admin-desa'

import { AdminJabatan } from './admin-jabatan'
import { AdminBerita } from './admin-berita'
import { AdminArtikel } from './admin-artikel'
import { AdminKegiatan } from './admin-kegiatan'
import { AdminAgenda } from './admin-agenda'
import { AdminGaleri } from './admin-galeri'
import { AdminDownload } from './admin-download'
import { AdminPesan } from './admin-pesan'
import { AdminSetting } from './admin-setting'
import { AdminUser } from './admin-user'
import { AdminAudit } from './admin-audit'

interface AdminAppProps {
  onLogout: () => void
}

export function AdminApp({ onLogout }: AdminAppProps) {
  const { authUser, adminView, goAdmin, setAuthUser } = useAppStore()

  if (!authUser) {
    return (
      <AdminLogin
        onLogin={(user) => {
          setAuthUser(user)
          if (user.role === 'USER') {
            goAdmin('user-dashboard')
          } else {
            goAdmin('admin-dashboard')
          }
        }}
      />
    )
  }

  const renderView = () => {
    switch (adminView) {
      case 'admin-dashboard':
        return <AdminDashboard />
      case 'admin-pengurus':
        return <AdminPengurus />
      case 'admin-desa':
        return <AdminDesa />
      case 'admin-jabatan':
        return <AdminJabatan />
      case 'admin-berita':
        return <AdminBerita />
      case 'admin-artikel':
        return <AdminArtikel />
      case 'admin-kegiatan':
        return <AdminKegiatan />
      case 'admin-agenda':
        return <AdminAgenda />
      case 'admin-galeri':
        return <AdminGaleri />
      case 'admin-download':
        return <AdminDownload />
      case 'admin-pesan':
        return <AdminPesan />
      case 'admin-setting':
        return <AdminSetting />
      case 'admin-user':
        return <AdminUser />
      case 'admin-audit':
        return <AdminAudit />
      default:
        return authUser.role === 'USER' ? <AdminDashboardUser /> : <AdminDashboard />

    }
  }

  return (
    <AdminLayout
      onLogout={onLogout}
      currentView={adminView}
      onNavigate={goAdmin}
    >
      {renderView()}
    </AdminLayout>
  )
}
