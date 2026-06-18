import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const kategori = searchParams.get('kategori')
  const search = searchParams.get('search')
  const limit = searchParams.get('limit')
  const admin = searchParams.get('admin') === 'true'

  const user = admin ? await getSession() : null

  const where: Record<string, unknown> = {}
  if (!admin || !user) {
    where.publishedAt = { not: null }
  }
  if (kategori && kategori !== 'all') where.kategori = kategori
  if (search) {
    where.OR = [
      { judul: { contains: search } },
      { ringkasan: { contains: search } },
    ]
  }

  const artikel = await db.artikel.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    ...(limit ? { take: parseInt(limit) } : {}),
  })

  return NextResponse.json({ artikel })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const slug = body.judul.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')

    const artikel = await db.artikel.create({
      data: {
        judul: body.judul,
        slug,
        kategori: body.kategori || 'Umum',
        thumbnail: body.thumbnail || null,
        ringkasan: body.ringkasan || null,
        isi: body.isi,
        penulis: body.penulis || user.name,
        tags: body.tags || null,
        seoTitle: body.seoTitle || null,
        metaDescription: body.metaDescription || null,
        publishedAt: new Date(),
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'CREATE', module: 'ARTIKEL',
        detail: `Membuat artikel: ${body.judul}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ artikel })
  } catch (error) {
    console.error('Create artikel error:', error)
    return NextResponse.json({ error: 'Gagal membuat artikel' }, { status: 500 })
  }
}
