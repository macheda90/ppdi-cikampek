import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const desa = await db.desa.update({
      where: { id },
      data: {
        ...(body.namaDesa !== undefined && { namaDesa: body.namaDesa }),
        ...(body.alamat !== undefined && { alamat: body.alamat }),
        ...(body.kecamatan !== undefined && { kecamatan: body.kecamatan }),
        ...(body.kabupaten !== undefined && { kabupaten: body.kabupaten }),
        ...(body.provinsi !== undefined && { provinsi: body.provinsi }),
        ...(body.kodePos !== undefined && { kodePos: body.kodePos }),
        ...(body.kepalaDesa !== undefined && { kepalaDesa: body.kepalaDesa }),
        ...(body.kontak !== undefined && { kontak: body.kontak }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'UPDATE', module: 'DESA',
        detail: `Mengubah desa: ${desa.namaDesa}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ desa })
  } catch (error) {
    console.error('Update desa error:', error)
    return NextResponse.json({ error: 'Gagal mengubah desa' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const desa = await db.desa.delete({ where: { id } })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'DELETE', module: 'DESA',
        detail: `Menghapus desa: ${desa.namaDesa}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete desa error:', error)
    return NextResponse.json({ error: 'Gagal menghapus desa' }, { status: 500 })
  }
}
