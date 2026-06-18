import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const user = await getSession()

    if (user) {
      await db.auditLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          action: 'LOGOUT',
          module: 'AUTH',
          detail: `User ${user.username} logout`,
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        },
      })

      const cookieStore = await cookies()
      const token = cookieStore.get('ppdi_session')?.value
      if (token) {
        await db.session.deleteMany({ where: { token } }).catch(() => {})
      }
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete('ppdi_session')
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
