import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const kategori = searchParams.get('kategori')
  const search = searchParams.get('search')

  const where: Record<string, unknown> = {}
  if (kategori && kategori !== 'all') where.kategori = kategori
  if (search) where.judul = { contains: search }

  const download = await db.download.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ download })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const download = await db.download.create({
      data: {
        judul: body.judul,
        kategori: body.kategori || 'DOKUMEN',
        fileUrl: body.fileUrl,
        fileSize: body.fileSize || null,
        fileType: body.fileType || null,
        deskripsi: body.deskripsi || null,
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'CREATE', module: 'DOWNLOAD',
        detail: `Menambah dokumen: ${body.judul}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ download })
  } catch (error) {
    console.error('Create download error:', error)
    return NextResponse.json({ error: 'Gagal membuat dokumen' }, { status: 500 })
  }
}
