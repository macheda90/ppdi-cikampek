import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Public stats for homepage
export async function GET() {
  const [totalPengurus, totalDesa, totalKegiatan, totalBerita, totalAgenda] = await Promise.all([
    db.pengurus.count({ where: { statusAktif: true } }),
    db.desa.count(),
    db.kegiatan.count(),
    db.berita.count({ where: { status: 'PUBLISH' } }),
    db.agenda.count({ where: { status: 'MENDATANG' } }),
  ])

  return NextResponse.json({
    totalPengurus,
    totalDesa,
    totalKegiatan,
    totalBerita,
    totalAgenda,
  })
}
