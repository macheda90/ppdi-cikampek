import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const jabatan = await db.jabatan.findMany({
    orderBy: { urutan: 'asc' },
    include: { _count: { select: { pengurus: true } } },
  })
  return NextResponse.json({ jabatan })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const jabatan = await db.jabatan.create({
      data: {
        namaJabatan: body.namaJabatan,
        urutan: body.urutan ?? 99,
        kategori: body.kategori || 'ANGGOTA',
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'CREATE', module: 'JABATAN',
        detail: `Menambah jabatan: ${body.namaJabatan}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ jabatan })
  } catch (error) {
    console.error('Create jabatan error:', error)
    return NextResponse.json({ error: 'Gagal membuat jabatan' }, { status: 500 })
  }
}
