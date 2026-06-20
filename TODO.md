# TODO - Perubahan Sambutan Ketua (Beranda)

## Rencana
1. Analisis komponen `src/components/public/views/beranda.tsx` untuk bagian “Sambutan Ketua” yang masih hardcode.
2. Ambil data “Ketua” dari tabel `pengurus` yang diurutkan berdasarkan `jabatan.urutan`.
   - Kriteria: jabatan dengan `urutan = 1`.
3. Ubah komponen beranda agar:
   - Nama ketua diambil dari `pengurus.namaLengkap` (jabatan urutan 1).
   - Foto ketua diambil dari `pengurus.foto` (fallback jika null).
   - Konten sambutan tetap bisa memakai `settings.ketua_sambutan` (jika belum diminta berubah), atau ambil dari sumber lain jika sudah ada.
4. Validasi tipe data dengan `src/lib/types.ts` (tipe `Pengurus`).
5. Jalankan build/lint/check kompilasi agar tidak ada error TypeScript.

## Steps setelah eksekusi
- [ ] (1) Konfirmasi lokasi hardcode dan tambahkan state untuk ketua.
- [ ] (2) Tambahkan fetch endpoint yang sesuai (atau tambah endpoint baru jika perlu).
- [ ] (3) Render ulang section “Sambutan Ketua” menggunakan data dari tabel.
- [ ] (4) Testing build.
- [x] (5) Update status: centang selesai untuk langkah yang dilakukan.



