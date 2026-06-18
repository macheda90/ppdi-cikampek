import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const desa = await db.desa.findMany({
    orderBy: { namaDesa: 'asc' },
    include: { _count: { select: { pengurus: true } } },
  })
  return NextResponse.json({ desa })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const desa = await db.desa.create({
      data: {
        namaDesa: body.namaDesa,
        alamat: body.alamat || null,
        kecamatan: body.kecamatan || 'Cikampek',
        kabupaten: body.kabupaten || 'Karawang',
        provinsi: body.provinsi || 'Jawa Barat',
        kodePos: body.kodePos || null,
        kepalaDesa: body.kepalaDesa || null,
        kontak: body.kontak || null,
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'CREATE', module: 'DESA',
        detail: `Menambah desa: ${body.namaDesa}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ desa })
  } catch (error) {
    console.error('Create desa error:', error)
    return NextResponse.json({ error: 'Gagal membuat desa' }, { status: 500 })
  }
}
