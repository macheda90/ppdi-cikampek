import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export interface SessionUser {
  id: string
  username: string
  name: string
  email: string | null
  role: string
  avatar: string | null
  pengurusId?: string | null
}

export async function createSession(userId: string): Promise<string> {
  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await db.session.create({
    data: { token, userId, expiresAt },
  })

  return token
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('ppdi_session')?.value
    if (!token) return null

    const session = await db.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            pengurus: { select: { id: true } },
          },
        },
      },
    })

    if (!session) return null
    if (session.expiresAt < new Date()) {
      await db.session.delete({ where: { id: session.id } })
      return null
    }

    return {
      id: session.user.id,
      username: session.user.username,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      avatar: session.user.avatar,
      pengurusId: session.user.pengurus?.id ?? null,
    }
  } catch {
    return null
  }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

async function requireAuth(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

async function requireRole(...roles: string[]): Promise<SessionUser> {
  const user = await requireAuth()
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden')
  }
  return user
}

// Re-export client-safe constants

