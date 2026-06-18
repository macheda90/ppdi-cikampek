import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const jabatan = await db.jabatan.update({
      where: { id },
      data: {
        ...(body.namaJabatan !== undefined && { namaJabatan: body.namaJabatan }),
        ...(body.urutan !== undefined && { urutan: body.urutan }),
        ...(body.kategori !== undefined && { kategori: body.kategori }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'UPDATE', module: 'JABATAN',
        detail: `Mengubah jabatan: ${jabatan.namaJabatan}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ jabatan })
  } catch (error) {
    console.error('Update jabatan error:', error)
    return NextResponse.json({ error: 'Gagal mengubah jabatan' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const jabatan = await db.jabatan.delete({ where: { id } })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'DELETE', module: 'JABATAN',
        detail: `Menghapus jabatan: ${jabatan.namaJabatan}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete jabatan error:', error)
    return NextResponse.json({ error: 'Gagal menghapus jabatan' }, { status: 500 })
  }
}
