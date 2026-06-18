import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const limit = searchParams.get('limit')

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { namaKegiatan: { contains: search } },
      { lokasi: { contains: search } },
    ]
  }

  const kegiatan = await db.kegiatan.findMany({
    where,
    orderBy: { tanggal: 'desc' },
    ...(limit ? { take: parseInt(limit) } : {}),
  })

  return NextResponse.json({ kegiatan })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const slug = body.namaKegiatan.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')

    const kegiatan = await db.kegiatan.create({
      data: {
        namaKegiatan: body.namaKegiatan,
        slug,
        tanggal: new Date(body.tanggal),
        lokasi: body.lokasi || null,
        penanggungJawab: body.penanggungJawab || null,
        deskripsi: body.deskripsi || null,
        fotos: body.fotos ? JSON.stringify(body.fotos) : null,
        videoUrl: body.videoUrl || null,
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'CREATE', module: 'KEGIATAN',
        detail: `Membuat kegiatan: ${body.namaKegiatan}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ kegiatan })
  } catch (error) {
    console.error('Create kegiatan error:', error)
    return NextResponse.json({ error: 'Gagal membuat kegiatan' }, { status: 500 })
  }
}
