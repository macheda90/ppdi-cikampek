import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, hashPassword } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pengurus = await db.pengurus.findUnique({
    where: { id },
    include: {
      desa: true,
      jabatan: true,
      user: { select: { id: true, username: true, role: true, isActive: true, lastLoginAt: true } },
    },
  })
  if (!pengurus) return NextResponse.json({ error: 'Pengurus tidak ditemukan' }, { status: 404 })
  return NextResponse.json({ pengurus })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    // Update or create linked user
    const existing = await db.pengurus.findUnique({ where: { id }, select: { userId: true } })

    if (body.username && body.password) {
      const hashed = await hashPassword(body.password)
      if (existing?.userId) {
        await db.user.update({
          where: { id: existing.userId },
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
      } else {
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
        await db.pengurus.update({ where: { id }, data: { userId: newUser.id } })
      }
    }

    const pengurus = await db.pengurus.update({
      where: { id },
      data: {
        ...(body.nipd !== undefined && { nipd: body.nipd }),
        ...(body.namaLengkap !== undefined && { namaLengkap: body.namaLengkap }),
        ...(body.nik !== undefined && { nik: body.nik }),
        ...(body.tempatLahir !== undefined && { tempatLahir: body.tempatLahir }),
        ...(body.tanggalLahir !== undefined && { tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null }),
        ...(body.jenisKelamin !== undefined && { jenisKelamin: body.jenisKelamin }),
        ...(body.foto !== undefined && { foto: body.foto }),
        ...(body.desaId !== undefined && { desaId: body.desaId || null }),
        ...(body.jabatanId !== undefined && { jabatanId: body.jabatanId || null }),
        ...(body.masaJabatan !== undefined && { masaJabatan: body.masaJabatan }),
        ...(body.alamat !== undefined && { alamat: body.alamat }),
        ...(body.noHp !== undefined && { noHp: body.noHp }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.statusAktif !== undefined && { statusAktif: body.statusAktif }),
      },
      include: {
        desa: { select: { id: true, namaDesa: true } },
        jabatan: { select: { id: true, namaJabatan: true, urutan: true } },
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'UPDATE', module: 'PENGURUS',
        detail: `Mengubah pengurus: ${pengurus.namaLengkap}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ pengurus })
  } catch (error) {
    console.error('Update pengurus error:', error)
    return NextResponse.json({ error: 'Gagal mengubah pengurus' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const pengurus = await db.pengurus.findUnique({ where: { id }, select: { namaLengkap: true, userId: true } })

    if (pengurus?.userId) {
      await db.user.delete({ where: { id: pengurus.userId } }).catch(() => {})
    }
    await db.pengurus.delete({ where: { id } })

    await db.auditLog.create({
      data: {
        userId: user.id, userName: user.name, action: 'DELETE', module: 'PENGURUS',
        detail: `Menghapus pengurus: ${pengurus?.namaLengkap || id}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete pengurus error:', error)
    return NextResponse.json({ error: 'Gagal menghapus pengurus' }, { status: 500 })
  }
}
