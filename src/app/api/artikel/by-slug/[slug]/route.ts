import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const artikel = await db.artikel.findUnique({ where: { slug } })
  if (!artikel || !artikel.publishedAt) {
    return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
  }

  await db.artikel.update({
    where: { id: artikel.id },
    data: { viewCount: { increment: 1 } },
  })

  const related = await db.artikel.findMany({
    where: {
      publishedAt: { not: null },
      kategori: artikel.kategori,
      id: { not: artikel.id },
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  })

  return NextResponse.json({ artikel: { ...artikel, viewCount: artikel.viewCount + 1 }, related })
}
