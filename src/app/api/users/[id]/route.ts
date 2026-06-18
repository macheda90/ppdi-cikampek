import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, hashPassword } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getSession()
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    const data: Record<string, unknown> = {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.role !== undefined && { role: body.role }),
      ...(body.avatar !== undefined && { avatar: body.avatar }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    }

    if (body.password) {
      data.password = await hashPassword(body.password)
    }

    const user = await db.user.update({ where: { id }, data })

    await db.auditLog.create({
      data: {
        userId: currentUser.id, userName: currentUser.name, action: 'UPDATE', module: 'USER',
        detail: `Mengubah user: ${user.username}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Gagal mengubah user' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getSession()
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    if (id === currentUser.id) {
      return NextResponse.json({ error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 })
    }

    const user = await db.user.delete({ where: { id } })

    await db.auditLog.create({
      data: {
        userId: currentUser.id, userName: currentUser.name, action: 'DELETE', module: 'USER',
        detail: `Menghapus user: ${user.username}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Gagal menghapus user' }, { status: 500 })
  }
}
