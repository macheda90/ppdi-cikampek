import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''

  if (q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const [berita, artikel, kegiatan, agenda, pengurus] = await Promise.all([
    db.berita.findMany({
      where: { status: 'PUBLISH', judul: { contains: q } },
      take: 5,
      select: { id: true, judul: true, slug: true, kategori: true, publishedAt: true },
    }),
    db.artikel.findMany({
      where: { publishedAt: { not: null }, judul: { contains: q } },
      take: 5,
      select: { id: true, judul: true, slug: true, kategori: true, publishedAt: true },
    }),
    db.kegiatan.findMany({
      where: { namaKegiatan: { contains: q } },
      take: 5,
      select: { id: true, namaKegiatan: true, slug: true, tanggal: true, lokasi: true },
    }),
    db.agenda.findMany({
      where: { namaAgenda: { contains: q } },
      take: 5,
      select: { id: true, namaAgenda: true, tanggalMulai: true, lokasi: true },
    }),
    db.pengurus.findMany({
      where: { statusAktif: true, namaLengkap: { contains: q } },
      take: 5,
      select: { id: true, namaLengkap: true, foto: true, jabatan: { select: { namaJabatan: true } }, desa: { select: { namaDesa: true } } },
    }),
  ])

  return NextResponse.json({
    results: {
      berita: berita.map((b) => ({ type: 'berita', id: b.id, title: b.judul, slug: b.slug, category: b.kategori, date: b.publishedAt })),
      artikel: artikel.map((a) => ({ type: 'artikel', id: a.id, title: a.judul, slug: a.slug, category: a.kategori, date: a.publishedAt })),
      kegiatan: kegiatan.map((k) => ({ type: 'kegiatan', id: k.id, title: k.namaKegiatan, slug: k.slug, date: k.tanggal, location: k.lokasi })),
      agenda: agenda.map((a) => ({ type: 'agenda', id: a.id, title: a.namaAgenda, date: a.tanggalMulai, location: a.lokasi })),
      pengurus: pengurus.map((p) => ({ type: 'pengurus', id: p.id, title: p.namaLengkap, foto: p.foto, jabatan: p.jabatan?.namaJabatan, desa: p.desa?.namaDesa })),
    },
  })
}
