import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const kategori = searchParams.get('kategori')
  const limit = searchParams.get('limit')

  const where: Record<string, unknown> = {}
  if (kategori && kategori !== 'all') where.kategori = kategori

  const galeri = await db.galeri.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    ...(limit ? { take: parseInt(limit) } : {}),
  })

  return NextResponse.json({ galeri })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // Support bulk create
    if (Array.isArray(body.items)) {
      const created = await db.$transaction(
        body.items.map((item: { judul: string; kategori: string; url: string; thumbnail?: string; deskripsi?: string }) =>
          db.galeri.create({
            data: {
              judul: item.judul,
              kategori: item.kategori || 'FOTO',
              url: item.url,
              thumbnail: item.thumbnail || item.url,
              deskripsi: item.deskripsi || null,
            },
          })
        )
      )

      await db.auditLog.create({
        data: {
          userId: user.id, userName: user.name, action: 'CREATE', module: 'GALERI',
          detail: `Menambah ${created.length} item galeri`,
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        },
      })

      return NextResponse.json({ galeri: created })
    }

    const galeri = await db.galeri.create({
      data: {
        judul: body.judul,
        kategori: body.kategori || 'FOTO',
        url: body.url,
        thumbnail: body.thumbnail || body.url,
        deskripsi: body.deskripsi || null,
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'CREATE', module: 'GALERI',
        detail: `Menambah galeri: ${body.judul}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ galeri })
  } catch (error) {
    console.error('Create galeri error:', error)
    return NextResponse.json({ error: 'Gagal membuat galeri' }, { status: 500 })
  }
}
