import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [
    totalPengurus,
    totalBerita,
    totalArtikel,
    totalKegiatan,
    totalAgenda,
    totalUsers,
    totalDesa,
    totalGaleri,
    totalDownloads,
    unreadPesan,
    beritaPublished,
    beritaDraft,
  ] = await Promise.all([
    db.pengurus.count(),
    db.berita.count(),
    db.artikel.count(),
    db.kegiatan.count(),
    db.agenda.count(),
    db.user.count(),
    db.desa.count(),
    db.galeri.count(),
    db.download.count(),
    db.pesanKontak.count({ where: { isRead: false } }),
    db.berita.count({ where: { status: 'PUBLISH' } }),
    db.berita.count({ where: { status: 'DRAFT' } }),
  ])

  // Monthly activity data for chart (last 6 months)
  const now = new Date()
  const monthsData: { month: string; berita: number; artikel: number; kegiatan: number }[] = []
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

    const [b, a, k] = await Promise.all([
      db.berita.count({ where: { createdAt: { gte: d, lt: next } } }),
      db.artikel.count({ where: { createdAt: { gte: d, lt: next } } }),
      db.kegiatan.count({ where: { createdAt: { gte: d, lt: next } } }),
    ])

    monthsData.push({ month: monthNames[d.getMonth()], berita: b, artikel: a, kegiatan: k })
  }

  // Content by category
  const beritaByKategori = await db.berita.groupBy({
    by: ['kategori'],
    _count: true,
  })

  // Recent activity
  const recentActivity = await db.auditLog.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } },
  })

  // Upcoming agenda
  const upcomingAgenda = await db.agenda.findMany({
    where: {
      status: 'MENDATANG',
      tanggalMulai: { gte: new Date() },
    },
    take: 5,
    orderBy: { tanggalMulai: 'asc' },
  })

  return NextResponse.json({
    stats: {
      totalPengurus,
      totalBerita,
      totalArtikel,
      totalKegiatan,
      totalAgenda,
      totalUsers,
      totalDesa,
      totalGaleri,
      totalDownloads,
      unreadPesan,
      beritaPublished,
      beritaDraft,
    },
    chartData: monthsData,
    beritaByKategori,
    recentActivity,
    upcomingAgenda,
  })
}
