import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const berita = await db.berita.findUnique({ where: { id } })
  if (!berita) {
    return NextResponse.json({ error: 'Berita tidak ditemukan' }, { status: 404 })
  }
  return NextResponse.json({ berita })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const slug = body.judul ? body.judul.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') : undefined

    const berita = await db.berita.update({
      where: { id },
      data: {
        ...(body.judul !== undefined && { judul: body.judul, slug }),
        ...(body.kategori !== undefined && { kategori: body.kategori }),
        ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail }),
        ...(body.ringkasan !== undefined && { ringkasan: body.ringkasan }),
        ...(body.isi !== undefined && { isi: body.isi }),
        ...(body.penulis !== undefined && { penulis: body.penulis }),
        ...(body.status !== undefined && { status: body.status, publishedAt: body.status === 'PUBLISH' ? (await db.berita.findUnique({ where: { id }, select: { publishedAt: true } }))?.publishedAt || new Date() : undefined }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.seoTitle !== undefined && { seoTitle: body.seoTitle }),
        ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription }),
        ...(body.metaKeywords !== undefined && { metaKeywords: body.metaKeywords }),
        ...(body.featured !== undefined && { featured: body.featured }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        action: 'UPDATE',
        module: 'BERITA',
        detail: `Mengubah berita: ${berita.judul}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ berita })
  } catch (error) {
    console.error('Update berita error:', error)
    return NextResponse.json({ error: 'Gagal mengubah berita' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const berita = await db.berita.delete({ where: { id } })

    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        action: 'DELETE',
        module: 'BERITA',
        detail: `Menghapus berita: ${berita.judul}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete berita error:', error)
    return NextResponse.json({ error: 'Gagal menghapus berita' }, { status: 500 })
  }
}
