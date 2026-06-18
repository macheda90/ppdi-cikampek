import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const artikel = await db.artikel.findUnique({ where: { id } })
  if (!artikel) return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
  return NextResponse.json({ artikel })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const slug = body.judul ? body.judul.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') : undefined

    const artikel = await db.artikel.update({
      where: { id },
      data: {
        ...(body.judul !== undefined && { judul: body.judul, slug }),
        ...(body.kategori !== undefined && { kategori: body.kategori }),
        ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail }),
        ...(body.ringkasan !== undefined && { ringkasan: body.ringkasan }),
        ...(body.isi !== undefined && { isi: body.isi }),
        ...(body.penulis !== undefined && { penulis: body.penulis }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.seoTitle !== undefined && { seoTitle: body.seoTitle }),
        ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'UPDATE', module: 'ARTIKEL',
        detail: `Mengubah artikel: ${artikel.judul}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ artikel })
  } catch (error) {
    console.error('Update artikel error:', error)
    return NextResponse.json({ error: 'Gagal mengubah artikel' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const artikel = await db.artikel.delete({ where: { id } })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'DELETE', module: 'ARTIKEL',
        detail: `Menghapus artikel: ${artikel.judul}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete artikel error:', error)
    return NextResponse.json({ error: 'Gagal menghapus artikel' }, { status: 500 })
  }
}
