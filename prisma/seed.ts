import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding PPDI Cikampek database...')

  // ==================== SETTINGS ====================
  const settings = [
    { key: 'org_name', value: 'Persatuan Perangkat Desa Indonesia (PPDI) Kecamatan Cikampek', category: 'GENERAL' },
    { key: 'org_short_name', value: 'PPDI Cikampek', category: 'GENERAL' },
    { key: 'org_tagline', value: 'Menguatkan Sinergi Perangkat Desa Menuju Pelayanan Publik yang Profesional dan Berintegritas', category: 'GENERAL' },
    { key: 'org_description', value: 'Portal resmi Persatuan Perangkat Desa Indonesia Kecamatan Cikampek sebagai media informasi, komunikasi, publikasi kegiatan, pengelolaan organisasi, dan penyebaran informasi bagi seluruh perangkat desa di wilayah Kecamatan Cikampek.', category: 'GENERAL' },
    { key: 'org_address', value: 'Sekretariat PPDI, Kantor Kecamatan Cikampek, Jl. Raya Cikampek No.1, Cikampek, Kabupaten Karawang, Jawa Barat 41373', category: 'GENERAL' },
    { key: 'org_email', value: 'ppdi.cikampek@gmail.com', category: 'GENERAL' },
    { key: 'org_phone', value: '+62 267 862134', category: 'GENERAL' },
    { key: 'org_logo', value: '/logo.svg', category: 'GENERAL' },
    { key: 'org_favicon', value: '/logo.svg', category: 'GENERAL' },
    { key: 'hero_title', value: 'Persatuan Perangkat Desa Indonesia', category: 'HOMEPAGE' },
    { key: 'hero_subtitle', value: 'Kecamatan Cikampek', category: 'HOMEPAGE' },
    { key: 'hero_description', value: 'Menguatkan Sinergi Perangkat Desa Menuju Pelayanan Publik yang Profesional dan Berintegritas', category: 'HOMEPAGE' },
    { key: 'hero_image', value: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&q=80', category: 'HOMEPAGE' },
    { key: 'ketua_nama', value: 'Ahmad Fauzi, S.IP', category: 'HOMEPAGE' },
    { key: 'ketua_foto', value: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80', category: 'HOMEPAGE' },
    { key: 'ketua_sambutan', value: 'Assalamualaikum Warahmatullahi Wabarakatuh. Selamat datang di portal resmi Persatuan Perangkat Desa Indonesia (PPDI) Kecamatan Cikampek. Portal ini hadir sebagai wujud komitmen kami untuk transparansi, akuntabilitas, dan peningkatan kualitas pelayanan publik di tingkat desa. Mari bersama-sama kita membangun desa yang maju, mandiri, dan berintegritas demi kesejahteraan masyarakat Cikampek.', category: 'HOMEPAGE' },
    { key: 'profil_sejarah', value: '<h2>Sejarah PPDI Kecamatan Cikampek</h2><p>Persatuan Perangkat Desa Indonesia (PPDI) Kecamatan Cikampek didirikan sebagai wadah organisasi bagi seluruh perangkat desa di wilayah Kecamatan Cikampek, Kabupaten Karawang, Jawa Barat. Berdiri sejak tahun 2015, PPDI Kecamatan Cikampek lahir dari kebutuhan akan peningkatan kapasitas, profesionalisme, dan sinergi antar perangkat desa dalam menjalankan tugas pemerintahan dan pelayanan publik.</p><p>Seiring berjalannya waktu, PPDI Kecamatan Cikampek berkembang menjadi organisasi yang aktif dalam berbagai kegiatan pelatihan, advokasi, dan penguatan kapasitas perangkat desa. Organisasi ini berperan penting dalam menjembatani komunikasi antara pemerintah desa dengan pemerintah kecamatan dan kabupaten.</p>', category: 'PROFIL' },
    { key: 'profil_visi', value: '<p>"Menjadi organisasi perangkat desa yang profesional, berintegritas, dan mandiri dalam mewujudkan pelayanan publik prima di Kecamatan Cikampek."</p>', category: 'PROFIL' },
    { key: 'profil_misi', value: '<ul><li>Meningkatkan kapasitas dan kompetensi perangkat desa melalui pelatihan dan pendidikan berkelanjutan.</li><li>Memperkuat sinergi dan kerjasama antar perangkat desa di wilayah Kecamatan Cikampek.</li><li>Mendorong pelayanan publik yang transparan, akuntabel, dan partisipatif.</li><li>Mengadvokasi hak dan kesejahteraan perangkat desa.</li><li>Mendukung pembangunan desa yang berkelanjutan dan inklusif.</li></ul>', category: 'PROFIL' },
    { key: 'profil_tujuan', value: '<ul><li>Terbentuknya perangkat desa yang profesional dan berkompeten.</li><li>Terwujudnya pelayanan publik yang berkualitas di tingkat desa.</li><li>Tersedianya wadah komunikasi dan kerjasama antar perangkat desa.</li><li>Terjaganya hak dan kesejahteraan perangkat desa.</li><li>Terkembangnya inovasi pelayanan desa yang adaptif terhadap perkembangan zaman.</li></ul>', category: 'PROFIL' },
    { key: 'profil_adart', value: '<p>AD/ART PPDI Kecamatan Cikampek mengatur tentang nama, kedudukan, sifat, asas, tujuan, fungsi, keanggotaan, struktur organisasi, tugas dan wewenang pengurus, serta mekanisme pengambilan keputusan organisasi. Dokumen lengkap AD/ART dapat diunduh pada halaman Download.</p>', category: 'PROFIL' },
    { key: 'seo_title', value: 'PPDI Kecamatan Cikampek - Portal Resmi Perangkat Desa', category: 'SEO' },
    { key: 'seo_description', value: 'Portal resmi Persatuan Perangkat Desa Indonesia (PPDI) Kecamatan Cikampek. Informasi organisasi, berita, kegiatan, agenda, dan layanan perangkat desa.', category: 'SEO' },
    { key: 'seo_keywords', value: 'PPDI, PPDI Cikampek, Perangkat Desa, Cikampek, Karawang, Organisasi Desa, Pemerintahan Desa', category: 'SEO' },
    { key: 'social_facebook', value: 'https://facebook.com/ppdi.cikampek', category: 'SOCIAL' },
    { key: 'social_instagram', value: 'https://instagram.com/ppdi.cikampek', category: 'SOCIAL' },
    { key: 'social_youtube', value: 'https://youtube.com/@ppdicikampek', category: 'SOCIAL' },
    { key: 'social_tiktok', value: 'https://tiktok.com/@ppdicikampek', category: 'SOCIAL' },
    { key: 'social_x', value: 'https://x.com/ppdicikampek', category: 'SOCIAL' },
    { key: 'footer_copyright', value: '© 2026 PPDI Kecamatan Cikampek. Hak Cipta Dilindungi.', category: 'FOOTER' },
    { key: 'footer_about', value: 'Persatuan Perangkat Desa Indonesia Kecamatan Cikampek adalah organisasi resmi yang menaungi seluruh perangkat desa di wilayah Kecamatan Cikampek.', category: 'FOOTER' },
    { key: 'theme_primary', value: '#0F4C81', category: 'THEME' },
    { key: 'theme_secondary', value: '#D4AF37', category: 'THEME' },
    { key: 'theme_background', value: '#F8FAFC', category: 'THEME' },
    { key: 'maps_embed', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.4207845!2d107.4567!3d-6.3911!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjMnMjguMCJTIDEwN8KwMjcnMjQuMSJF!5e0!3m2!1sid!2sid!4v1620000000000', category: 'GENERAL' },
  ]

  for (const s of settings) {
    await db.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    })
  }
  console.log(`✓ Settings: ${settings.length} records`)

  // ==================== DESA ====================
  const desaList = [
    { namaDesa: 'Cikampek Kota', kepalaDesa: 'H. Endang Suryadi', alamat: 'Jl. Raya Cikampek Kota' },
    { namaDesa: 'Cikampek Selatan', kepalaDesa: 'Asep Ruhiat', alamat: 'Jl. Cikampek Selatan No. 12' },
    { namaDesa: 'Cikampek Timur', kepalaDesa: 'Ahmad Fauzi, S.IP', alamat: 'Jl. Raya Timur Cikampek' },
    { namaDesa: 'Dawuan Barat', kepalaDesa: 'Rudi Hartono', alamat: 'Jl. Dawuan Barat' },
    { namaDesa: 'Dawuan Tengah', kepalaDesa: 'Yusuf Maulana', alamat: 'Jl. Dawuan Tengah' },
    { namaDesa: 'Dawuan Wetan', kepalaDesa: 'Toto Hermawan', alamat: 'Jl. Dawuan Wetan' },
    { namaDesa: 'Kamojing', kepalaDesa: 'Yayan Suryana', alamat: 'Jl. Kamojing' },
    { namaDesa: 'Kalihurip', kepalaDesa: 'Ade Sumarna', alamat: 'Jl. Kalihurip' },
    { namaDesa: 'Kutawargi', kepalaDesa: 'Nana Sutisna', alamat: 'Jl. Kutawargi' },
    { namaDesa: 'Lubangbuaya', kepalaDesa: 'Erik Setiawan', alamat: 'Jl. Lubangbuaya' },
    { namaDesa: 'Tamanmekar', kepalaDesa: 'Dadang Suhendar', alamat: 'Jl. Tamanmekar' },
    { namaDesa: 'Tegalsari', kepalaDesa: 'Wawan Setiawan', alamat: 'Jl. Tegalsari' },
  ]

  const desaRecords = []
  for (const d of desaList) {
    const desa = await db.desa.create({ data: { ...d, kecamatan: 'Cikampek', kabupaten: 'Karawang', provinsi: 'Jawa Barat', kodePos: '41373' } })
    desaRecords.push(desa)
  }
  console.log(`✓ Desa: ${desaRecords.length} records`)

  // ==================== JABATAN ====================
  const jabatanList = [
    { namaJabatan: 'Ketua', urutan: 1, kategori: 'PIMPINAN' },
    { namaJabatan: 'Wakil Ketua', urutan: 2, kategori: 'PIMPINAN' },
    { namaJabatan: 'Sekretaris', urutan: 3, kategori: 'PIMPINAN' },
    { namaJabatan: 'Bendahara', urutan: 4, kategori: 'PIMPINAN' },
    { namaJabatan: 'Ketua Bidang Organisasi', urutan: 5, kategori: 'BIDANG' },
    { namaJabatan: 'Ketua Bidang Hukum', urutan: 6, kategori: 'BIDANG' },
    { namaJabatan: 'Ketua Bidang SDM', urutan: 7, kategori: 'BIDANG' },
    { namaJabatan: 'Ketua Bidang Pemberdayaan', urutan: 8, kategori: 'BIDANG' },
    { namaJabatan: 'Ketua Bidang Humas', urutan: 9, kategori: 'BIDANG' },
    { namaJabatan: 'Anggota', urutan: 10, kategori: 'ANGGOTA' },
  ]

  const jabatanRecords = []
  for (const j of jabatanList) {
    const jab = await db.jabatan.create({ data: j })
    jabatanRecords.push(jab)
  }
  console.log(`✓ Jabatan: ${jabatanRecords.length} records`)

  // ==================== USERS + PENGURUS ====================
  const passwordHash = await bcrypt.hash('password123', 10)

  const pengurusData = [
    {
      namaLengkap: 'Ahmad Fauzi, S.IP',
      nipd: 'PPDI-001-2015',
      nik: '3201150101800001',
      tempatLahir: 'Karawang',
      tanggalLahir: new Date('1980-01-01'),
      jenisKelamin: 'L',
      foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
      desaIndex: 2, // Cikampek Timur
      jabatanIndex: 0, // Ketua
      masaJabatan: '2024-2029',
      noHp: '081234567801',
      email: 'ahmad.fauzi@ppdi-cikampek.id',
      alamat: 'Jl. Raya Timur Cikampek No. 45',
      role: 'SUPER_ADMIN',
      username: 'admin',
    },
    {
      namaLengkap: 'Rudi Hartono',
      nipd: 'PPDI-002-2015',
      nik: '3201150202810002',
      tempatLahir: 'Karawang',
      tanggalLahir: new Date('1981-02-02'),
      jenisKelamin: 'L',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      desaIndex: 3, // Dawuan Barat
      jabatanIndex: 1, // Wakil Ketua
      masaJabatan: '2024-2029',
      noHp: '081234567802',
      email: 'rudi.hartono@ppdi-cikampek.id',
      alamat: 'Jl. Dawuan Barat No. 10',
      role: 'ADMIN',
      username: 'rudi',
    },
    {
      namaLengkap: 'Dedi Mulyadi',
      nipd: 'PPDI-003-2015',
      nik: '3201150303820003',
      tempatLahir: 'Bandung',
      tanggalLahir: new Date('1982-03-03'),
      jenisKelamin: 'L',
      foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      desaIndex: 1, // Cikampek Selatan
      jabatanIndex: 2, // Sekretaris
      masaJabatan: '2024-2029',
      noHp: '081234567803',
      email: 'dedi.mulyadi@ppdi-cikampek.id',
      alamat: 'Jl. Cikampek Selatan No. 22',
      role: 'EDITOR',
      username: 'dedi',
    },
    {
      namaLengkap: 'Yayan Suryana',
      nipd: 'PPDI-004-2015',
      nik: '3201150404830004',
      tempatLahir: 'Karawang',
      tanggalLahir: new Date('1983-04-04'),
      jenisKelamin: 'L',
      foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      desaIndex: 6, // Kamojing
      jabatanIndex: 3, // Bendahara
      masaJabatan: '2024-2029',
      noHp: '081234567804',
      email: 'yayan.suryana@ppdi-cikampek.id',
      alamat: 'Jl. Kamojing No. 5',
      role: 'PENGURUS',
      username: 'yayan',
    },
    {
      namaLengkap: 'H. Endang Suryadi',
      nipd: 'PPDI-005-2016',
      nik: '3201150505840005',
      tempatLahir: 'Karawang',
      tanggalLahir: new Date('1984-05-05'),
      jenisKelamin: 'L',
      foto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
      desaIndex: 0, // Cikampek Kota
      jabatanIndex: 4, // Ketua Bidang Organisasi
      masaJabatan: '2024-2029',
      noHp: '081234567805',
      email: 'endang.suryadi@ppdi-cikampek.id',
      alamat: 'Jl. Cikampek Kota No. 1',
      role: 'PENGURUS',
      username: 'endang',
    },
    {
      namaLengkap: 'Asep Ruhiat',
      nipd: 'PPDI-006-2016',
      nik: '3201150606850006',
      tempatLahir: 'Bandung',
      tanggalLahir: new Date('1985-06-06'),
      jenisKelamin: 'L',
      foto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80',
      desaIndex: 1,
      jabatanIndex: 5, // Ketua Bidang Hukum
      masaJabatan: '2024-2029',
      noHp: '081234567806',
      email: 'asep.ruhiat@ppdi-cikampek.id',
      alamat: 'Jl. Cikampek Selatan No. 30',
      role: 'PENGURUS',
      username: 'asep',
    },
    {
      namaLengkap: 'Siti Aminah, S.E',
      nipd: 'PPDI-007-2017',
      nik: '3201150707860007',
      tempatLahir: 'Cirebon',
      tanggalLahir: new Date('1986-07-07'),
      jenisKelamin: 'P',
      foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      desaIndex: 7, // Kalihurip
      jabatanIndex: 6, // Ketua Bidang SDM
      masaJabatan: '2024-2029',
      noHp: '081234567807',
      email: 'siti.aminah@ppdi-cikampek.id',
      alamat: 'Jl. Kalihurip No. 8',
      role: 'PENGURUS',
      username: 'siti',
    },
    {
      namaLengkap: 'Bambang Wijaya',
      nipd: 'PPDI-008-2017',
      nik: '3201150808870008',
      tempatLahir: 'Karawang',
      tanggalLahir: new Date('1987-08-08'),
      jenisKelamin: 'L',
      foto: 'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=400&q=80',
      desaIndex: 8, // Kutawargi
      jabatanIndex: 7, // Ketua Bidang Pemberdayaan
      masaJabatan: '2024-2029',
      noHp: '081234567808',
      email: 'bambang.wijaya@ppdi-cikampek.id',
      alamat: 'Jl. Kutawargi No. 12',
      role: 'PENGURUS',
      username: 'bambang',
    },
    {
      namaLengkap: 'Nurhasanah, S.Sos',
      nipd: 'PPDI-009-2018',
      nik: '3201150909880009',
      tempatLahir: 'Subang',
      tanggalLahir: new Date('1988-09-09'),
      jenisKelamin: 'P',
      foto: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
      desaIndex: 10, // Tamanmekar
      jabatanIndex: 8, // Ketua Bidang Humas
      masaJabatan: '2024-2029',
      noHp: '081234567809',
      email: 'nurhasanah@ppdi-cikampek.id',
      alamat: 'Jl. Tamanmekar No. 15',
      role: 'PENGURUS',
      username: 'nur',
    },
    {
      namaLengkap: 'Tono Sugianto',
      nipd: 'PPDI-010-2018',
      nik: '3201151010890010',
      tempatLahir: 'Karawang',
      tanggalLahir: new Date('1989-10-10'),
      jenisKelamin: 'L',
      foto: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80',
      desaIndex: 9, // Lubangbuaya
      jabatanIndex: 9, // Anggota
      masaJabatan: '2024-2029',
      noHp: '081234567810',
      email: 'tono.sugianto@ppdi-cikampek.id',
      alamat: 'Jl. Lubangbuaya No. 20',
      role: 'PENGURUS',
      username: 'tono',
    },
  ]

  for (const p of pengurusData) {
    const user = await db.user.create({
      data: {
        username: p.username,
        password: passwordHash,
        name: p.namaLengkap,
        email: p.email,
        role: p.role,
        avatar: p.foto,
        isActive: true,
      },
    })

    await db.pengurus.create({
      data: {
        namaLengkap: p.namaLengkap,
        nipd: p.nipd,
        nik: p.nik,
        tempatLahir: p.tempatLahir,
        tanggalLahir: p.tanggalLahir,
        jenisKelamin: p.jenisKelamin,
        foto: p.foto,
        desaId: desaRecords[p.desaIndex].id,
        jabatanId: jabatanRecords[p.jabatanIndex].id,
        masaJabatan: p.masaJabatan,
        noHp: p.noHp,
        email: p.email,
        alamat: p.alamat,
        statusAktif: true,
        userId: user.id,
      },
    })
  }
  console.log(`✓ Users + Pengurus: ${pengurusData.length} records`)

  // ==================== BERITA ====================
  const beritaData = [
    { judul: 'Rapat Koordinasi PPDI Kecamatan Cikampek Tahun 2026', kategori: 'Organisasi', thumbnail: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80', tags: 'rapat,koordinasi,2026', isi: '<p>Karawang, 10 Januari 2026 — Persatuan Perangkat Desa Indonesia (PPDI) Kecamatan Cikampek menggelar Rapat Koordinasi Tahun 2026 di Aula Kecamatan Cikampek. Kegiatan ini dihadiri oleh seluruh pengurus PPDI dan perwakilan perangkat desa se-Kecamatan Cikampek.</p><p>Rapat koordinasi ini membahas program kerja tahun 2026, evaluasi kinerja tahun sebelumnya, serta strategi penguatan kapasitas perangkat desa. Ketua PPDI Kecamatan Cikampek, Ahmad Fauzi, S.IP, dalam sambutannya menekankan pentingnya sinergi antar perangkat desa untuk meningkatkan kualitas pelayanan publik.</p><p>"Mari kita jadikan tahun 2026 sebagai tahun kebangkitan perangkat desa Cikampek. Kita harus mampu memberikan pelayanan prima kepada masyarakat dengan profesionalisme dan integritas," ujar Ahmad Fauzi.</p><p>Rapat berjalan dengan lancar dan menghasilkan beberapa keputusan penting, antara lain penyusunan program pelatihan rutin, peningkatan kerjasama dengan instansi terkait, dan penguatan administrasi desa.</p>' },
    { judul: 'Pelatihan Administrasi Digital untuk Perangkat Desa', kategori: 'Pelatihan', thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80', tags: 'pelatihan,digital,administrasi', isi: '<p>Cikampek, 18 Januari 2026 — PPDI Kecamatan Cikampek menyelenggarakan Pelatihan Administrasi Digital untuk seluruh perangkat desa di wilayah Cikampek. Kegiatan ini bertujuan untuk meningkatkan kompetensi perangkat desa dalam mengelola administrasi secara digital.</p><p>Pelatihan diikuti oleh lebih dari 50 peserta dari 12 desa se-Kecamatan Cikampek. Materi yang diberikan meliputi penggunaan aplikasi Sistem Kepegawaian Daerah (SIMPEG), pengelolaan arsip digital, dan pemanfaatan teknologi informasi dalam pelayanan publik.</p><p>Narasumber pelatihan ini merupakan praktisi teknologi informasi yang berpengalaman dalam bidang pemerintahan digital. Para peserta antusias mengikuti pelatihan dan berharap ilmu yang didapat dapat diterapkan di desa masing-masing.</p>' },
    { judul: 'PPDI Cikampek Ikuti Musyawarah Daerah PPDI Karawang', kategori: 'Organisasi', thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80', tags: 'musda,karawang', isi: '<p>Karawang, 5 Februari 2026 — Delegasi PPDI Kecamatan Cikampek menghadiri Musyawarah Daerah (Musda) PPDI Kabupaten Karawang. Acara ini digelar untuk membahas program kerja daerah dan pemilihan pengurus periode baru.</p><p>Musda dihadiri oleh perwakilan dari seluruh kecamatan di Kabupaten Karawang. Delegasi Cikampek dipimpin langsung oleh Ketua PPDI Cikampek, Ahmad Fauzi, S.IP.</p><p>Dalam musyawarah ini, PPDI Cikampek menyampaikan beberapa usulan program untuk ditingkatkan menjadi program daerah, antara lain program pelatihan berkelanjutan dan penguatan kesejahteraan perangkat desa.</p>' },
    { judul: 'Bakti Sosial PPDI di Desa Kamojing', kategori: 'Sosial', thumbnail: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80', tags: 'baksos,sosial,kamojing', isi: '<p>Kamojing, 22 Februari 2026 — PPDI Kecamatan Cikampek mengadakan kegiatan Bakti Sosial di Desa Kamojing. Kegiatan ini berupa pembagian sembako kepada warga kurang mampu dan pemeriksaan kesehatan gratis.</p><p>Bakti sosial ini diikuti oleh seluruh pengurus PPDI dan bekerjasama dengan Puskesmas Cikampek. Sebanyak 100 paket sembako dibagikan kepada warga yang membutuhkan.</p><p>Ketua PPDI Ahmad Fauzi menyampaikan bahwa kegiatan bakti sosial ini merupakan bentuk kepedulian organisasi terhadap masyarakat. "Kita tidak hanya melayani administrasi, tetapi juga hadir untuk masyarakat," ungkapnya.</p>' },
    { judul: 'Workshop Penguatan Kapasitas Kepala Desa', kategori: 'Pelatihan', thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', tags: 'workshop,kapasitas,kades', isi: '<p>Cikampek, 10 Maret 2026 — PPDI Kecamatan Cikampek bekerjasama dengan Pemerintah Kecamatan Cikampek menyelenggarakan Workshop Penguatan Kapasitas Kepala Desa. Kegiatan ini diikuti oleh seluruh kepala desa se-Kecamatan Cikampek.</p><p>Workshop membahas berbagai topik, antara lain manajemen pemerintahan desa, pengelolaan keuangan desa, dan implementasi regulasi terbaru. Narasumber yang dihadirkan merupakan pakar tata kelola pemerintahan desa.</p><p>Acara ini diharapkan dapat meningkatkan kemampuan kepala desa dalam menjalankan tugas pemerintahan dan pelayanan publik secara optimal.</p>' },
    { judul: 'PPDI Cikampek Gelar Dialog Interaktif dengan Masyarakat', kategori: 'Organisasi', thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80', tags: 'dialog,masyarakat', isi: '<p>Cikampek, 28 Maret 2026 — Dalam rangka meningkatkan transparansi dan partisipasi publik, PPDI Kecamatan Cikampek menggelar Dialog Interaktif dengan masyarakat. Acara ini digelar di Aula Kecamatan Cikampek dan dihadiri oleh ratusan warga.</p><p>Dialog ini membahas berbagai isu yang berkaitan dengan pelayanan publik di tingkat desa, antara lain keluhan masyarakat, usulan perbaikan layanan, dan harapan masyarakat terhadap perangkat desa.</p><p>"Dialog seperti ini penting untuk menjembatani komunikasi antara perangkat desa dan masyarakat. Kita ingin mendengar langsung aspirasi warga," kata Ahmad Fauzi, Ketua PPDI Cikampek.</p>' },
    { judul: 'Kunjungan Kerja PPDI ke Pemerintah Kabupaten Karawang', kategori: 'Organisasi', thumbnail: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&q=80', tags: 'kunker,karawang', isi: '<p>Karawang, 15 April 2026 — Pengurus PPDI Kecamatan Cikampek melakukan kunjungan kerja ke Pemerintah Kabupaten Karawang. Kunjungan ini bertujuan untuk silaturahmi dan membahas potensi kerjasama dalam penguatan kapasitas perangkat desa.</p><p>Delegasi PPDI Cikampek diterima oleh perwakilan Dinas Pemberdayaan Masyarakat dan Desa (DPMD) Kabupaten Karawang. Pembahasan difokuskan pada program peningkatan kompetensi perangkat desa dan dukungan teknis bagi desa-desa di Cikampek.</p>' },
    { judul: 'Turnamen Olahraga Antar Perangkat Desa Cikampek', kategori: 'Olahraga', thumbnail: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800&q=80', tags: 'olahraga,turnamen', isi: '<p>Cikampek, 5 Mei 2026 — PPDI Kecamatan Cikampek menggelar Turnamen Olahraga Antar Perangkat Desa se-Kecamatan Cikampek. Cabang olahraga yang dipertandingkan antara lain futsal, badminton, dan voli.</p><p>Turnamen ini diikuti oleh 12 tim perangkat desa se-Kecamatan Cikampek. Kegiatan ini bertujuan untuk mempererat kebersamaan dan silaturahmi antar perangkat desa.</p><p>Acara berlangsung meriah dengan semangat sportivitas yang tinggi. Pemenang akan menerima piala dan pembinaan dari PPDI Cikampek.</p>' },
    { judul: 'Sosialisasi Anti Korupsi untuk Perangkat Desa', kategori: 'Hukum', thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80', tags: 'sosialisasi,anti korupsi', isi: '<p>Cikampek, 20 Mei 2026 — PPDI Kecamatan Cikampek bekerjasama dengan KPK menyelenggarakan Sosialisasi Anti Korupsi untuk seluruh perangkat desa di Kecamatan Cikampek. Kegiatan ini bertujuan untuk membangun integritas dan mencegah praktik korupsi di tingkat desa.</p><p>Sosialisasi membahas berbagai modus korupsi di desa, pencegahan, serta pentingnya transparansi dalam pengelolaan anggaran desa. Materi disampaikan langsung oleh narasumber dari KPK.</p><p>"Integritas adalah modal utama seorang perangkat desa. Tanpa integritas, pelayanan publik tidak akan berjalan dengan baik," pesan Ahmad Fauzi.</p>' },
    { judul: 'PPDI Cikampek Raih Penghargaan Organisasi Terbaik', kategori: 'Organisasi', thumbnail: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80', tags: 'penghargaan,terbaik', isi: '<p>Karawang, 12 Juni 2026 — PPDI Kecamatan Cikampek meraih penghargaan sebagai Organisasi Perangkat Desa Terbaik se-Kabupaten Karawang tahun 2026. Penghargaan diserahkan langsung oleh Bupati Karawang dalam acara HUT Kabupaten Karawang.</p><p>Penghargaan ini diberikan atas kontribusi PPDI Cikampek dalam meningkatkan kualitas pelayanan publik, penguatan kapasitas perangkat desa, dan kegiatan sosial yang berdampak positif bagi masyarakat.</p><p>Ketua PPDI Ahmad Fauzi menyampaikan terima kasih atas penghargaan ini dan berkomitmen untuk terus berinovasi dalam pelayanan publik. "Penghargaan ini memotivasi kami untuk terus berbuat yang terbaik bagi masyarakat Cikampek," ungkapnya.</p>' },
  ]

  for (let i = 0; i < beritaData.length; i++) {
    const b = beritaData[i]
    const slug = b.judul.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    await db.berita.create({
      data: {
        ...b,
        slug,
        ringkasan: b.isi.replace(/<[^>]*>/g, '').substring(0, 180) + '...',
        penulis: 'Admin PPDI',
        status: 'PUBLISH',
        publishedAt: new Date(2026, i, 10 + i),
        seoTitle: b.judul,
        metaDescription: b.isi.replace(/<[^>]*>/g, '').substring(0, 160),
        metaKeywords: b.tags,
        featured: i < 3,
      },
    })
  }
  console.log(`✓ Berita: ${beritaData.length} records`)

  // ==================== ARTIKEL ====================
  const artikelData = [
    { judul: 'Peran Strategis Perangkat Desa dalam Transformasi Digital Pemerintahan Desa', kategori: 'Opini', thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80', tags: 'digital,transformasi', isi: '<p>Era digital telah mengubah lanskap pemerintahan di seluruh dunia, termasuk di Indonesia. Di tingkat desa, transformasi digital bukan lagi sekadar pilihan, melainkan keharusan untuk meningkatkan kualitas pelayanan publik. Perangkat desa memiliki peran strategis dalam menggerakkan transformasi ini.</p><p>Transformasi digital di desa mencakup digitalisasi administrasi kependudukan, pengelolaan keuangan desa berbasis aplikasi, hingga pelayanan publik online. Perangkat desa dituntut untuk mampu mengoperasikan teknologi informasi agar pelayanan menjadi lebih cepat, akurat, dan transparan.</p><p>Namun, transformasi digital bukan tanpa tantangan. Keterbatasan infrastruktur, literasi digital yang masih rendah, dan keterbatasan anggaran menjadi hambatan utama. Diperlukan komitmen bersama antara pemerintah, organisasi seperti PPDI, dan masyarakat untuk mengatasi tantangan tersebut.</p><p>Perangkat desa sebagai ujung tombak pelayanan publik harus menjadi agent of change dalam transformasi digital. Dengan peningkatan kapasitas dan dukungan yang memadai, perangkat desa dapat mewujudkan pemerintahan desa yang modern dan responsif terhadap kebutuhan masyarakat.</p>' },
    { judul: 'Membangun Desa Mandiri: Antara Harapan dan Tantangan', kategori: 'Opini', thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', tags: 'desa mandiri', isi: '<p>Desa mandiri adalah dambaan setiap masyarakat Indonesia. Konsep desa mandiri mengarah pada kemampuan desa untuk mengelola potensi lokal secara optimal sehingga mampu memenuhi kebutuhan masyarakatnya tanpa terlalu bergantung pada bantuan eksternal.</p><p>Untuk mewujudkan desa mandiri, diperlukan berbagai strategi. Pertama, penguatan SDM melalui pelatihan dan pendidikan. Kedua, pengembangan ekonomi berbasis potensi lokal. Ketiga, pemanfaatan teknologi untuk meningkatkan efisiensi.</p><p>Perangkat desa berperan penting dalam proses ini. Mereka adalah perencana, pelaksana, sekaligus pengawas pembangunan desa. Tanpa perangkat desa yang kompeten, mustahil desa mandiri dapat terwujud.</p>' },
    { judul: 'Pentingnya Good Governance di Tingkat Desa', kategori: 'Pemerintahan', thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80', tags: 'governance', isi: '<p>Good governance atau tata kelola pemerintahan yang baik merupakan prinsip yang harus dijunjung di setiap tingkat pemerintahan, termasuk di tingkat desa. Prinsip ini mencakup transparansi, akuntabilitas, partisipasi, dan responsivitas.</p><p>Di tingkat desa, good governance sangat penting karena desa adalah institusi pemerintahan yang paling dekat dengan masyarakat. Penerapan good governance akan meningkatkan kepercayaan masyarakat dan efektivitas pelayanan publik.</p><p>Perangkat desa harus memahami dan menerapkan prinsip-prinsip good governance dalam setiap aspek pekerjaannya. Pelatihan dan pembinaan berkelanjutan diperlukan untuk memastikan hal ini terwujud.</p>' },
    { judul: 'Pengelolaan Keuangan Desa yang Transparan dan Akuntabel', kategori: 'Keuangan', thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80', tags: 'keuangan,transparan', isi: '<p>Pengelolaan keuangan desa adalah aspek krusial dalam pemerintahan desa. Dana desa yang semakin besar setiap tahunnya menuntut pengelolaan yang transparan dan akuntabel agar bermanfaat optimal bagi masyarakat.</p><p>Transparansi dalam pengelolaan keuangan desa berarti setiap pengeluaran harus dapat dipertanggungjawabkan dan diketahui oleh masyarakat. Akuntabilitas berarti perangkat desa bertanggung jawab atas setiap keputusan keuangan yang diambil.</p><p>Sistem informasi keuangan desa yang baik, pelatihan untuk bendahara desa, dan pengawasan oleh masyarakat adalah kunci pengelolaan keuangan desa yang sehat.</p>' },
    { judul: 'Pemberdayaan Masyarakat Melalui BUMDes', kategori: 'Ekonomi', thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80', tags: 'bumdes,ekonomi', isi: '<p>BUMDes (Badan Usaha Milik Desa) merupakan instrumen penting untuk pemberdayaan ekonomi masyarakat desa. Melalui BUMDes, desa dapat mengelola potensi ekonomi lokal secara profesional dan berkelanjutan.</p><p>Keberhasilan BUMDes bergantung pada kemampuan pengelola, dukungan pemerintah desa, dan partisipasi masyarakat. Perangkat desa berperan sebagai fasilitator dan pengawas dalam operasional BUMDes.</p><p>Di Kecamatan Cikampek, beberapa desa telah berhasil mengembangkan BUMDes yang produktif. Hal ini menjadi contoh baik bagi desa lain untuk mengembangkan potensi ekonomi lokal.</p>' },
    { judul: 'Pentingnya Data Terkini untuk Perencanaan Desa', kategori: 'Pemerintahan', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', tags: 'data,perencanaan', isi: '<p>Data yang akurat dan terkini adalah fondasi perencanaan pembangunan desa. Tanpa data yang baik, perencanaan akan kacau dan pembangunan tidak akan tepat sasaran.</p><p>Perangkat desa harus mampu mengumpulkan, mengelola, dan memanfaatkan data untuk perencanaan. Inilah mengapa kemampuan literasi data menjadi penting bagi perangkat desa modern.</p><p>Pemerintah telah menyediakan berbagai sistem informasi desa, namun pemanfaatannya masih perlu dioptimalkan. Pelatihan dan pendampingan diperlukan agar perangkat desa mampu memanfaatkan sistem ini secara maksimal.</p>' },
    { judul: 'Sinergi Desa dan Kecamatan dalam Pembangunan', kategori: 'Pemerintahan', thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80', tags: 'sinergi', isi: '<p>Sinergi antara pemerintah desa dan kecamatan sangat penting untuk pembangunan yang harmonis. Tanpa sinergi, program-program pembangunan dapat tumpang tindih atau bahkan kontradiktif.</p><p>Organisasi seperti PPDI berperan sebagai jembatan komunikasi antara desa dan kecamatan. Melalui PPDI, aspirasi desa dapat disampaikan ke kecamatan, dan sebaliknya program kecamatan dapat dijangkau ke desa.</p><p>Sinergi yang baik akan menghasilkan pembangunan yang lebih efektif dan efisien, serta masyarakat yang lebih sejahtera.</p>' },
    { judul: 'Etika Pelayanan Publik bagi Perangkat Desa', kategori: 'Opini', thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80', tags: 'etika,pelayanan', isi: '<p>Etika pelayanan publik adalah landasan moral bagi setiap perangkat desa dalam menjalankan tugasnya. Etika ini mencakup integritas, profesionalisme, empati, dan dedikasi.</p><p>Perangkat desa yang beretika akan melayani masyarakat dengan tulus, tanpa diskriminasi, dan tanpa pamrih. Mereka memahami bahwa tugas mereka adalah amanah yang harus dijalankan dengan sebaik-baiknya.</p><p>Pembinaan etika harus dilakukan secara berkelanjutan, baik melalui pelatihan formal maupun keteladanan dari pimpinan. Dengan etika yang kuat, kepercayaan masyarakat terhadap perangkat desa akan meningkat.</p>' },
    { judul: 'Inovasi Pelayanan Publik di Era New Normal', kategori: 'Inovasi', thumbnail: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&q=80', tags: 'inovasi,new normal', isi: '<p>Era new normal menuntut adaptasi di segala bidang, termasuk pelayanan publik di tingkat desa. Inovasi menjadi kunci untuk tetap memberikan pelayanan yang berkualitas di tengah keterbatasan.</p><p>Beberapa inovasi yang dapat dilakukan antara lain pelayanan online, penggunaan media sosial untuk informasi publik, dan digitalisasi administrasi. Inovasi-inovasi ini tidak hanya menjawab tantangan saat ini, tetapi juga mempersiapkan desa menghadapi masa depan.</p><p>Perangkat desa harus terbuka terhadap perubahan dan terus belajar agar mampu berinovasi. Dukungan dari organisasi seperti PPDI sangat penting dalam proses ini.</p>' },
    { judul: 'Membangun Karakter Perangkat Desa yang Berkualitas', kategori: 'Opini', thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80', tags: 'karakter,sdm', isi: '<p>Karakter perangkat desa yang berkualitas adalah aset terbesar bagi pembangunan desa. Karakter ini dibangun dari nilai-nilai integritas, profesionalisme, dedikasi, dan empati terhadap masyarakat.</p><p>Pembentukan karakter tidak bisa instan. Diperlukan proses panjang yang melibatkan pendidikan, pelatihan, keteladanan, dan pembinaan berkelanjutan. Organisasi seperti PPDI berperan penting dalam proses ini.</p><p>Investasi pada pembangunan karakter perangkat desa adalah investasi jangka panjang yang akan memberikan dampak positif bagi masyarakat desa selama bertahun-tahun ke depan.</p>' },
  ]

  for (let i = 0; i < artikelData.length; i++) {
    const a = artikelData[i]
    const slug = a.judul.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    await db.artikel.create({
      data: {
        ...a,
        slug,
        ringkasan: a.isi.replace(/<[^>]*>/g, '').substring(0, 180) + '...',
        penulis: 'Redaksi PPDI',
        publishedAt: new Date(2026, i, 5 + i),
        seoTitle: a.judul,
        metaDescription: a.isi.replace(/<[^>]*>/g, '').substring(0, 160),
      },
    })
  }
  console.log(`✓ Artikel: ${artikelData.length} records`)

  // ==================== KEGIATAN ====================
  const kegiatanData = [
    { namaKegiatan: 'Pelatihan Pengelolaan Administrasi Desa', tanggal: new Date('2026-07-15'), lokasi: 'Aula Kecamatan Cikampek', penanggungJawab: 'Ahmad Fauzi, S.IP', deskripsi: 'Pelatihan pengelolaan administrasi desa untuk seluruh sekretaris desa se-Kecamatan Cikampek. Materi meliputi tata kelola arsip, dokumentasi, dan pelaporan desa.', fotos: JSON.stringify(['https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80']), videoUrl: '' },
    { namaKegiatan: 'Bakti Sosial di Desa Kamojing', tanggal: new Date('2026-02-22'), lokasi: 'Desa Kamojing', penanggungJawab: 'Yayan Suryana', deskripsi: 'Kegiatan bakti sosial berupa pembagian sembako dan pemeriksaan kesehatan gratis bagi warga kurang mampu.', fotos: JSON.stringify(['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80', 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80']), videoUrl: '' },
    { namaKegiatan: 'Workshop Penguatan Kapasitas Kepala Desa', tanggal: new Date('2026-03-10'), lokasi: 'Aula Kecamatan Cikampek', penanggungJawab: 'Ahmad Fauzi, S.IP', deskripsi: 'Workshop untuk seluruh kepala desa se-Kecamatan Cikampek dalam rangka peningkatan kapasitas tata kelola pemerintahan desa.', fotos: JSON.stringify(['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80']), videoUrl: '' },
    { namaKegiatan: 'Turnamen Futsal Antar Perangkat Desa', tanggal: new Date('2026-05-05'), lokasi: 'GOR Cikampek', penanggungJawab: 'Rudi Hartono', deskripsi: 'Turnamen futsal antar perangkat desa se-Kecamatan Cikampek untuk mempererat kebersamaan.', fotos: JSON.stringify(['https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800&q=80', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80']), videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { namaKegiatan: 'Sosialisasi Anti Korupsi', tanggal: new Date('2026-05-20'), lokasi: 'Aula Kecamatan Cikampek', penanggungJawab: 'Asep Ruhiat', deskripsi: 'Sosialisasi anti korupsi bekerjasama dengan KPK untuk seluruh perangkat desa.', fotos: JSON.stringify(['https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80']), videoUrl: '' },
    { namaKegiatan: 'Pelatihan Administrasi Digital', tanggal: new Date('2026-01-18'), lokasi: 'Kantor Kecamatan Cikampek', penanggungJawab: 'Dedi Mulyadi', deskripsi: 'Pelatihan administrasi digital untuk meningkatkan kompetensi perangkat desa dalam teknologi informasi.', fotos: JSON.stringify(['https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80']), videoUrl: '' },
    { namaKegiatan: 'Dialog Interaktif dengan Masyarakat', tanggal: new Date('2026-03-28'), lokasi: 'Aula Kecamatan Cikampek', penanggungJawab: 'Nurhasanah, S.Sos', deskripsi: 'Dialog interaktif antara perangkat desa dan masyarakat untuk meningkatkan transparansi dan partisipasi publik.', fotos: JSON.stringify(['https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80']), videoUrl: '' },
    { namaKegiatan: 'Kunjungan Kerja ke Pemkab Karawang', tanggal: new Date('2026-04-15'), lokasi: 'Pemkab Karawang', penanggungJawab: 'Ahmad Fauzi, S.IP', deskripsi: 'Kunjungan kerja PPDI Cikampek ke Pemerintah Kabupaten Karawang untuk silaturahmi dan kerjasama.', fotos: JSON.stringify(['https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&q=80']), videoUrl: '' },
    { namaKegiatan: 'Pelatihan Pengelolaan Keuangan Desa', tanggal: new Date('2026-06-25'), lokasi: 'Aula Kecamatan Cikampek', penanggungJawab: 'Yayan Suryana', deskripsi: 'Pelatihan pengelolaan keuangan desa untuk bendahara desa se-Kecamatan Cikampek.', fotos: JSON.stringify(['https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80']), videoUrl: '' },
    { namaKegiatan: 'Bakti Sosial di Desa Dawuan Barat', tanggal: new Date('2026-08-12'), lokasi: 'Desa Dawuan Barat', penanggungJawab: 'Rudi Hartono', deskripsi: 'Kegiatan bakti sosial berupa pembagian sembako dan donor darah di Desa Dawuan Barat.', fotos: JSON.stringify(['https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80']), videoUrl: '' },
  ]

  for (const k of kegiatanData) {
    const slug = k.namaKegiatan.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    await db.kegiatan.create({ data: { ...k, slug } })
  }
  console.log(`✓ Kegiatan: ${kegiatanData.length} records`)

  // ==================== AGENDA ====================
  const agendaData = [
    { namaAgenda: 'Musyawarah Kerja PPDI Kecamatan Cikampek', tanggalMulai: new Date('2026-08-20'), tanggalSelesai: new Date('2026-08-20'), lokasi: 'Gedung Serbaguna Kecamatan Cikampek', deskripsi: 'Musyawarah kerja tahunan PPDI Kecamatan Cikampek untuk membahas program kerja dan evaluasi.', status: 'MENDATANG' },
    { namaAgenda: 'Pelatihan Administrasi Digital Tahap II', tanggalMulai: new Date('2026-09-10'), tanggalSelesai: new Date('2026-09-10'), lokasi: 'Kantor Kecamatan Cikampek', deskripsi: 'Pelatihan lanjutan administrasi digital untuk perangkat desa.', status: 'MENDATANG' },
    { namaAgenda: 'Rapat Koordinasi Triwulan III', tanggalMulai: new Date('2026-09-25'), tanggalSelesai: new Date('2026-09-25'), lokasi: 'Aula Kecamatan Cikampek', deskripsi: 'Rapat koordinasi triwulan III dengan seluruh pengurus dan perwakilan desa.', status: 'MENDATANG' },
    { namaAgenda: 'Workshop Good Governance', tanggalMulai: new Date('2026-10-15'), tanggalSelesai: new Date('2026-10-15'), lokasi: 'Aula Kecamatan Cikampek', deskripsi: 'Workshop tata kelola pemerintahan desa yang baik.', status: 'MENDATANG' },
    { namaAgenda: 'Bakti Sosial Akhir Tahun', tanggalMulai: new Date('2026-12-15'), tanggalSelesai: new Date('2026-12-15'), lokasi: 'Desa Cikampek Timur', deskripsi: 'Kegiatan bakti sosial akhir tahun untuk warga kurang mampu.', status: 'MENDATANG' },
    { namaAgenda: 'Rapat Koordinasi Awal Tahun 2026', tanggalMulai: new Date('2026-01-10'), tanggalSelesai: new Date('2026-01-10'), lokasi: 'Aula Kecamatan Cikampek', deskripsi: 'Rapat koordinasi awal tahun 2026 dengan seluruh pengurus.', status: 'SELESAI' },
    { namaAgenda: 'Pelatihan Administrasi Digital Tahap I', tanggalMulai: new Date('2026-01-18'), tanggalSelesai: new Date('2026-01-18'), lokasi: 'Kantor Kecamatan Cikampek', deskripsi: 'Pelatihan administrasi digital tahap pertama.', status: 'SELESAI' },
    { namaAgenda: 'Musda PPDI Kabupaten Karawang', tanggalMulai: new Date('2026-02-05'), tanggalSelesai: new Date('2026-02-06'), lokasi: 'Gedung DPRD Karawang', deskripsi: 'Musyawarah Daerah PPDI Kabupaten Karawang.', status: 'SELESAI' },
    { namaAgenda: 'Bakti Sosial Desa Kamojing', tanggalMulai: new Date('2026-02-22'), tanggalSelesai: new Date('2026-02-22'), lokasi: 'Desa Kamojing', deskripsi: 'Bakti sosial pembagian sembako dan pemeriksaan kesehatan.', status: 'SELESAI' },
    { namaAgenda: 'Workshop Kepala Desa', tanggalMulai: new Date('2026-03-10'), tanggalSelesai: new Date('2026-03-10'), lokasi: 'Aula Kecamatan Cikampek', deskripsi: 'Workshop penguatan kapasitas kepala desa.', status: 'SELESAI' },
  ]

  for (const a of agendaData) {
    await db.agenda.create({ data: a })
  }
  console.log(`✓ Agenda: ${agendaData.length} records`)

  // ==================== GALERI ====================
  const fotoUrls = [
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80',
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
    'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&q=80',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
  ]

  const galeriJudul = [
    'Rapat Koordinasi 2026', 'Pelatihan Administrasi Digital', 'Musda PPDI Karawang',
    'Bakti Sosial Kamojing', 'Workshop Kepala Desa', 'Dialog Interaktif',
    'Turnamen Futsal', 'Sosialisasi Anti Korupsi', 'Kunjungan Kerja Pemkab',
    'Pelatihan Keuangan Desa', 'Bakti Sosial Dawuan', 'Penghargaan Organisasi Terbaik',
  ]

  for (let i = 0; i < 12; i++) {
    await db.galeri.create({
      data: {
        judul: galeriJudul[i],
        kategori: 'FOTO',
        url: fotoUrls[i],
        thumbnail: fotoUrls[i],
        deskripsi: `Dokumentasi kegiatan ${galeriJudul[i]}`,
      },
    })
  }

  // Video galeri
  const videoGaleri = [
    { judul: 'Profile PPDI Cikampek', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { judul: 'Rapat Koordinasi 2026', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { judul: 'Pelatihan Digital', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { judul: 'Turnamen Futsal 2026', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  ]
  for (const v of videoGaleri) {
    await db.galeri.create({
      data: { ...v, kategori: 'VIDEO', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', deskripsi: `Video ${v.judul}` },
    })
  }
  console.log(`✓ Galeri: ${12 + videoGaleri.length} records`)

  // ==================== DOWNLOAD ====================
  const downloadData = [
    { judul: 'Surat Edaran Rapat Koordinasi 2026', kategori: 'SURAT_EDARAN', fileUrl: '/files/SE-Rapat-Koordinasi-2026.pdf', fileType: 'PDF', fileSize: '245 KB', deskripsi: 'Surat edaran rapat koordinasi PPDI tahun 2026' },
    { judul: 'Surat Edaran Pelatihan Digital', kategori: 'SURAT_EDARAN', fileUrl: '/files/SE-Pelatihan-Digital.pdf', fileType: 'PDF', fileSize: '198 KB', deskripsi: 'Surat edaran pelatihan administrasi digital' },
    { judul: 'AD/ART PPDI Kecamatan Cikampek', kategori: 'AD_ART', fileUrl: '/files/AD-ART-PPDI-Cikampek.pdf', fileType: 'PDF', fileSize: '1.2 MB', deskripsi: 'Anggaran Dasar dan Rumah Tangga PPDI Cikampek' },
    { judul: 'Program Kerja 2026', kategori: 'DOKUMEN', fileUrl: '/files/Program-Kerja-2026.pdf', fileType: 'PDF', fileSize: '856 KB', deskripsi: 'Program kerja PPDI Cikampek tahun 2026' },
    { judul: 'Laporan Tahunan 2025', kategori: 'DOKUMEN', fileUrl: '/files/Laporan-Tahunan-2025.pdf', fileType: 'PDF', fileSize: '2.4 MB', deskripsi: 'Laporan tahunan kegiatan PPDI 2025' },
    { judul: 'Formulir Pendaftaran Kegiatan', kategori: 'FORMULIR', fileUrl: '/files/Formulir-Kegiatan.docx', fileType: 'DOCX', fileSize: '120 KB', deskripsi: 'Formulir pendaftaran peserta kegiatan' },
    { judul: 'Formulir Proposal Program', kategori: 'FORMULIR', fileUrl: '/files/Formulir-Proposal.docx', fileType: 'DOCX', fileSize: '95 KB', deskripsi: 'Formulir proposal program desa' },
    { judul: 'Data Perangkat Desa 2026', kategori: 'DOKUMEN', fileUrl: '/files/Data-Perangkat-Desa.xlsx', fileType: 'XLSX', fileSize: '340 KB', deskripsi: 'Data perangkat desa se-Kecamatan Cikampek' },
    { judul: 'Tata Tertib Rapat', kategori: 'DOKUMEN', fileUrl: '/files/Tata-Tertib-Rapat.pdf', fileType: 'PDF', fileSize: '180 KB', deskripsi: 'Tata tertib rapat PPDI Cikampek' },
    { judul: 'Struktur Organisasi 2024-2029', kategori: 'DOKUMEN', fileUrl: '/files/Struktur-Organisasi.pdf', fileType: 'PDF', fileSize: '420 KB', deskripsi: 'Struktur organisasi PPDI periode 2024-2029' },
  ]

  for (const d of downloadData) {
    await db.download.create({ data: d })
  }
  console.log(`✓ Download: ${downloadData.length} records`)

  // ==================== PESAN KONTAK (sample) ====================
  await db.pesanKontak.create({
    data: {
      nama: 'Budi Santoso',
      email: 'budi@email.com',
      telepon: '081234567890',
      subjek: 'Pertanyaan tentang PPDI',
      pesan: 'Apakah PPDI Cikampek menerima anggota baru?',
    },
  })
  console.log('✓ Pesan Kontak: 1 record')

  console.log('\n✅ Seeding complete!')
  console.log('   Login: admin / password123 (Super Admin)')
  console.log('   Login: rudi / password123 (Admin)')
  console.log('   Login: dedi / password123 (Editor)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
