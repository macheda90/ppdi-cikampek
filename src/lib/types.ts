// Shared types and utilities for frontend-backend communication

export interface Pengurus {
  id: string
  nipd: string | null
  namaLengkap: string
  nik: string | null
  tempatLahir: string | null
  tanggalLahir: string | null
  jenisKelamin: string | null
  foto: string | null
  desaId: string | null
  desa?: { id: string; namaDesa: string } | null
  jabatanId: string | null
  jabatan?: { id: string; namaJabatan: string; urutan: number } | null
  masaJabatan: string | null
  alamat: string | null
  noHp: string | null
  email: string | null
  statusAktif: boolean
  userId: string | null
}

export interface Berita {
  id: string
  judul: string
  slug: string
  kategori: string
  thumbnail: string | null
  ringkasan: string | null
  isi: string
  penulis: string | null
  status: string
  tags: string | null
  seoTitle: string | null
  metaDescription: string | null
  metaKeywords: string | null
  featured: boolean
  viewCount: number
  publishedAt: string | null
  createdAt: string
}

export interface Artikel {
  id: string
  judul: string
  slug: string
  kategori: string
  thumbnail: string | null
  ringkasan: string | null
  isi: string
  penulis: string | null
  tags: string | null
  viewCount: number
  publishedAt: string | null
  createdAt: string
}

export interface Kegiatan {
  id: string
  namaKegiatan: string
  slug: string
  tanggal: string
  lokasi: string | null
  penanggungJawab: string | null
  deskripsi: string | null
  fotos: string | null
  videoUrl: string | null
  createdAt: string
}

export interface Agenda {
  id: string
  namaAgenda: string
  tanggalMulai: string
  tanggalSelesai: string | null
  lokasi: string | null
  deskripsi: string | null
  status: string
  createdAt: string
}

export interface Galeri {
  id: string
  judul: string
  kategori: string
  url: string
  thumbnail: string | null
  deskripsi: string | null
  createdAt: string
}

export interface DownloadItem {
  id: string
  judul: string
  kategori: string
  fileUrl: string
  fileSize: string | null
  fileType: string | null
  deskripsi: string | null
  downloadCount: number
  createdAt: string
}

export interface Desa {
  id: string
  namaDesa: string
  alamat: string | null
  kecamatan: string
  kabupaten: string
  provinsi: string
  kodePos: string | null
  kepalaDesa: string | null
  kontak: string | null
}

export interface Jabatan {
  id: string
  namaJabatan: string
  urutan: number
  kategori: string
}

export interface Setting {
  id: string
  key: string
  value: string | null
  category: string
}

export interface PesanKontak {
  id: string
  nama: string
  email: string
  telepon: string | null
  subjek: string
  pesan: string
  isRead: boolean
  createdAt: string
}

export interface AuditLog {
  id: string
  userId: string | null
  userName: string | null
  action: string
  module: string
  detail: string | null
  ipAddress: string | null
  createdAt: string
}

export interface User {
  id: string
  username: string
  name: string
  email: string | null
  role: string
  avatar: string | null
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

// Settings grouped by category
interface SettingsGroup {
  [key: string]: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function formatDate(date: string | Date, locale: string = 'id-ID'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateShort(date: string | Date, locale: string = 'id-ID'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | Date, locale: string = 'id-ID'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function timeAgo(date: string | Date, locale: string = 'id-ID'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))

  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  if (days < 30) return `${days} hari lalu`
  return formatDate(d, locale)
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length).trim() + '...'
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}
