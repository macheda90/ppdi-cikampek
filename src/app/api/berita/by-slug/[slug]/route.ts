import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const berita = await db.berita.findUnique({ where: { slug } })

  if (!berita || berita.status !== 'PUBLISH') {
    return NextResponse.json({ error: 'Berita tidak ditemukan' }, { status: 404 })
  }

  // Increment view count
  await db.berita.update({
    where: { id: berita.id },
    data: { viewCount: { increment: 1 } },
  })

  // Get related berita
  const related = await db.berita.findMany({
    where: {
      status: 'PUBLISH',
      kategori: berita.kategori,
      id: { not: berita.id },
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  })

  return NextResponse.json({ berita: { ...berita, viewCount: berita.viewCount + 1 }, related })
}
