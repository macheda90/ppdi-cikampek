import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// Public: send contact message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.nama || !body.email || !body.subjek || !body.pesan) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    const pesan = await db.pesanKontak.create({
      data: {
        nama: body.nama,
        email: body.email,
        telepon: body.telepon || null,
        subjek: body.subjek,
        pesan: body.pesan,
      },
    })

    return NextResponse.json({ success: true, id: pesan.id })
  } catch (error) {
    console.error('Contact error:', error)
    return NextResponse.json({ error: 'Gagal mengirim pesan' }, { status: 500 })
  }
}

// Admin: list messages
export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pesan = await db.pesanKontak.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ pesan })
}
