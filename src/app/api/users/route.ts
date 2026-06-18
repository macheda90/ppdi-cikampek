import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await db.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      pengurus: { select: { id: true, namaLengkap: true, desa: { select: { namaDesa: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ users })
}
