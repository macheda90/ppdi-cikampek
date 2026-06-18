import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, hashPassword } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const desaId = searchParams.get('desaId')
  const jabatanId = searchParams.get('jabatanId')
  const search = searchParams.get('search')
  const admin = searchParams.get('admin') === 'true'

  const user = admin ? await getSession() : null

  const where: Record<string, unknown> = {}
  if (!admin || !user) {
    where.statusAktif = true
  }
  if (desaId && desaId !== 'all') where.desaId = desaId
  if (jabatanId && jabatanId !== 'all') where.jabatanId = jabatanId
  if (search) {
    where.OR = [
      { namaLengkap: { contains: search } },
      { nipd: { contains: search } },
    ]
  }

  const pengurus = await db.pengurus.findMany({
    where,
    include: {
      desa: { select: { id: true, namaDesa: true } },
      jabatan: { select: { id: true, namaJabatan: true, urutan: true } },
    },
    orderBy: [{ jabatan: { urutan: 'asc' } }, { namaLengkap: 'asc' }],
  })

  return NextResponse.json({ pengurus })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // Create user account if username/password provided
    let userId: string | undefined
    if (body.username && body.password) {
      const existing = await db.user.findUnique({ where: { username: body.username } })
      if (existing) {
        return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
      }
      const hashed = await hashPassword(body.password)
      const newUser = await db.user.create({
        data: {
          username: body.username,
          password: hashed,
          name: body.namaLengkap,
          email: body.email || null,
          role: body.role || 'PENGURUS',
          avatar: body.foto || null,
          isActive: body.statusAktif ?? true,
        },
      })
      userId = newUser.id
    }

    const pengurus = await db.pengurus.create({
      data: {
        nipd: body.nipd || null,
        namaLengkap: body.namaLengkap,
        nik: body.nik || null,
        tempatLahir: body.tempatLahir || null,
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null,
        jenisKelamin: body.jenisKelamin || null,
        foto: body.foto || null,
        desaId: body.desaId || null,
        jabatanId: body.jabatanId || null,
        masaJabatan: body.masaJabatan || null,
        alamat: body.alamat || null,
        noHp: body.noHp || null,
        email: body.email || null,
        statusAktif: body.statusAktif ?? true,
        userId,
      },
      include: {
        desa: { select: { id: true, namaDesa: true } },
        jabatan: { select: { id: true, namaJabatan: true, urutan: true } },
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'CREATE', module: 'PENGURUS',
        detail: `Menambah pengurus: ${body.namaLengkap}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ pengurus })
  } catch (error) {
    console.error('Create pengurus error:', error)
    return NextResponse.json({ error: 'Gagal membuat pengurus' }, { status: 500 })
  }
}
