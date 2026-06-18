import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET public settings (only certain categories exposed publicly)
export async function GET() {
  const settings = await db.setting.findMany({
    where: {
      category: { in: ['GENERAL', 'HOMEPAGE', 'PROFIL', 'SEO', 'SOCIAL', 'FOOTER', 'THEME'] },
    },
  })
  return NextResponse.json({ settings })
}

// PUT update settings (admin only)
export async function PUT(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { settings } = body as { settings: { key: string; value: string }[] }

    for (const s of settings) {
      await db.setting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: { key: s.key, value: s.value, category: 'GENERAL' },
      })
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        action: 'UPDATE',
        module: 'SETTINGS',
        detail: `Mengubah ${settings.length} pengaturan`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan' }, { status: 500 })
  }
}
