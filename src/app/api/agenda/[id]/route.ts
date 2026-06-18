import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const agenda = await db.agenda.findUnique({ where: { id } })
  if (!agenda) return NextResponse.json({ error: 'Agenda tidak ditemukan' }, { status: 404 })
  return NextResponse.json({ agenda })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const agenda = await db.agenda.update({
      where: { id },
      data: {
        ...(body.namaAgenda !== undefined && { namaAgenda: body.namaAgenda }),
        ...(body.tanggalMulai !== undefined && { tanggalMulai: new Date(body.tanggalMulai) }),
        ...(body.tanggalSelesai !== undefined && { tanggalSelesai: body.tanggalSelesai ? new Date(body.tanggalSelesai) : null }),
        ...(body.lokasi !== undefined && { lokasi: body.lokasi }),
        ...(body.deskripsi !== undefined && { deskripsi: body.deskripsi }),
        ...(body.status !== undefined && { status: body.status }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'UPDATE', module: 'AGENDA',
        detail: `Mengubah agenda: ${agenda.namaAgenda}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ agenda })
  } catch (error) {
    console.error('Update agenda error:', error)
    return NextResponse.json({ error: 'Gagal mengubah agenda' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const agenda = await db.agenda.delete({ where: { id } })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'DELETE', module: 'AGENDA',
        detail: `Menghapus agenda: ${agenda.namaAgenda}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete agenda error:', error)
    return NextResponse.json({ error: 'Gagal menghapus agenda' }, { status: 500 })
  }
}
