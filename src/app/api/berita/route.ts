import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET berita list (public: only PUBLISH; admin: all with filters)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const kategori = searchParams.get('kategori')
  const search = searchParams.get('search')
  const limit = searchParams.get('limit')
  const featured = searchParams.get('featured')
  const admin = searchParams.get('admin') === 'true'

  const user = admin ? await getSession() : null

  const where: Record<string, unknown> = {}
  if (!admin || !user) {
    where.status = 'PUBLISH'
  } else if (status) {
    where.status = status
  }
  if (kategori && kategori !== 'all') where.kategori = kategori
  if (featured === 'true') where.featured = true
  if (search) {
    where.OR = [
      { judul: { contains: search } },
      { ringkasan: { contains: search } },
    ]
  }

  const berita = await db.berita.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    ...(limit ? { take: parseInt(limit) } : {}),
  })

  return NextResponse.json({ berita })
}

// POST create berita (admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const slug = body.judul.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')

    const berita = await db.berita.create({
      data: {
        judul: body.judul,
        slug,
        kategori: body.kategori || 'Umum',
        thumbnail: body.thumbnail || null,
        ringkasan: body.ringkasan || null,
        isi: body.isi,
        penulis: body.penulis || user.name,
        status: body.status || 'DRAFT',
        tags: body.tags || null,
        seoTitle: body.seoTitle || null,
        metaDescription: body.metaDescription || null,
        metaKeywords: body.metaKeywords || null,
        featured: body.featured || false,
        publishedAt: body.status === 'PUBLISH' ? new Date() : null,
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        action: 'CREATE',
        module: 'BERITA',
        detail: `Membuat berita: ${body.judul}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ berita })
  } catch (error) {
    console.error('Create berita error:', error)
    return NextResponse.json({ error: 'Gagal membuat berita' }, { status: 500 })
  }
}
