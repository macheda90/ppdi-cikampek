import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const limit = searchParams.get('limit')

  const where: Record<string, unknown> = {}
  if (status && status !== 'all') where.status = status

  const agenda = await db.agenda.findMany({
    where,
    orderBy: { tanggalMulai: 'asc' },
    ...(limit ? { take: parseInt(limit) } : {}),
  })

  return NextResponse.json({ agenda })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const agenda = await db.agenda.create({
      data: {
        namaAgenda: body.namaAgenda,
        tanggalMulai: new Date(body.tanggalMulai),
        tanggalSelesai: body.tanggalSelesai ? new Date(body.tanggalSelesai) : null,
        lokasi: body.lokasi || null,
        deskripsi: body.deskripsi || null,
        status: body.status || 'MENDATANG',
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'CREATE', module: 'AGENDA',
        detail: `Membuat agenda: ${body.namaAgenda}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ agenda })
  } catch (error) {
    console.error('Create agenda error:', error)
    return NextResponse.json({ error: 'Gagal membuat agenda' }, { status: 500 })
  }
}
