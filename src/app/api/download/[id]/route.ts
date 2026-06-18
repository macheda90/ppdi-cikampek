import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// Increment download count (public)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.download.update({
    where: { id },
    data: { downloadCount: { increment: 1 } },
  })
  return NextResponse.json({ success: true })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const download = await db.download.update({
      where: { id },
      data: {
        ...(body.judul !== undefined && { judul: body.judul }),
        ...(body.kategori !== undefined && { kategori: body.kategori }),
        ...(body.fileUrl !== undefined && { fileUrl: body.fileUrl }),
        ...(body.fileSize !== undefined && { fileSize: body.fileSize }),
        ...(body.fileType !== undefined && { fileType: body.fileType }),
        ...(body.deskripsi !== undefined && { deskripsi: body.deskripsi }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'UPDATE', module: 'DOWNLOAD',
        detail: `Mengubah dokumen: ${download.judul}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ download })
  } catch (error) {
    console.error('Update download error:', error)
    return NextResponse.json({ error: 'Gagal mengubah dokumen' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const download = await db.download.delete({ where: { id } })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'DELETE', module: 'DOWNLOAD',
        detail: `Menghapus dokumen: ${download.judul}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete download error:', error)
    return NextResponse.json({ error: 'Gagal menghapus dokumen' }, { status: 500 })
  }
}
