import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const galeri = await db.galeri.delete({ where: { id } })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'DELETE', module: 'GALERI',
        detail: `Menghapus galeri: ${galeri.judul}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete galeri error:', error)
    return NextResponse.json({ error: 'Gagal menghapus galeri' }, { status: 500 })
  }
}
