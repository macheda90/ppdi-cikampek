import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const kegiatan = await db.kegiatan.findUnique({ where: { id } })
  if (!kegiatan) return NextResponse.json({ error: 'Kegiatan tidak ditemukan' }, { status: 404 })
  return NextResponse.json({ kegiatan })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const slug = body.namaKegiatan ? body.namaKegiatan.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') : undefined

    const kegiatan = await db.kegiatan.update({
      where: { id },
      data: {
        ...(body.namaKegiatan !== undefined && { namaKegiatan: body.namaKegiatan, slug }),
        ...(body.tanggal !== undefined && { tanggal: new Date(body.tanggal) }),
        ...(body.lokasi !== undefined && { lokasi: body.lokasi }),
        ...(body.penanggungJawab !== undefined && { penanggungJawab: body.penanggungJawab }),
        ...(body.deskripsi !== undefined && { deskripsi: body.deskripsi }),
        ...(body.fotos !== undefined && { fotos: JSON.stringify(body.fotos) }),
        ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'UPDATE', module: 'KEGIATAN',
        detail: `Mengubah kegiatan: ${kegiatan.namaKegiatan}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ kegiatan })
  } catch (error) {
    console.error('Update kegiatan error:', error)
    return NextResponse.json({ error: 'Gagal mengubah kegiatan' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const kegiatan = await db.kegiatan.delete({ where: { id } })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'DELETE', module: 'KEGIATAN',
        detail: `Menghapus kegiatan: ${kegiatan.namaKegiatan}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete kegiatan error:', error)
    return NextResponse.json({ error: 'Gagal menghapus kegiatan' }, { status: 500 })
  }
}
