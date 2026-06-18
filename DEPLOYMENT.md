# ============================================
# PANDUAN DEPLOY PPDI CIKAMPEK
# ============================================

Pilih salah satu metode di bawah sesuai jenis hosting Anda.

---

## 🥇 OPSI A: VERCEL (GRATIS - PALING DIREKOMENDASIKAN)
### Cocok untuk: Semua orang. Gratis, cepat, otomatis, SSL included.

Vercel adalah pembuat Next.js, jadi deploy ke sini paling mulus.

### Langkah-langkah:

1. **Buat akun** di https://vercel.com (login dengan GitHub)

2. **Push code ke GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/ppdi-cikampek.git
   git push -u origin main
   ```

3. **Import ke Vercel**:
   - Buka https://vercel.com/new
   - Pilih repo `ppdi-cikampek`
   - Klik **Deploy** (settings otomatis, vercel.json sudah disiapkan)

4. **Set Environment Variables** (di Vercel Dashboard > Settings > Environment Variables):
   ```
   DATABASE_URL = file:./db/custom.db
   ```
   (SQLite berfungsi di Vercel untuk read-only. Untuk data persisten,
    gunakan Vercel Postgres atau planetcale.com MySQL gratis)

5. **Seed database** (jalankan sekali):
   - Di Vercel Dashboard > Settings > Functions > buka terminal
   - Atau gunakan Vercel CLI: `vercel env pull && bun run prisma/seed.ts`

6. **Selesai!** Domain otomatis: `ppdi-cikampek.vercel.app`

✅ Kelebihan: Gratis, SSL otomatis, CDN global, auto-deploy dari git
⚠️ Catatan: SQLite di Vercel tidak persisten (reset per deploy). Untuk produksi,
   gunakan database eksternal (PlanetScale MySQL gratis, atau Neon Postgres).

---

## 🥈 OPSI B: CPANEL DENGAN NODE.JS APP (SHARED HOSTING)
### Cocok untuk: Hostinger, Niagahoster (paket yang support Node), Domainesia

### Cek dulu apakah hosting Anda support Node.js:
- Login ke cPanel
- Cari menu **"Setup Node.js App"** atau **"Node.js"** di section Software
- Jika ADA → lanjut ke langkah deploy
- Jika TIDAK ADA → hosting Anda PHP-only, gunakan OPSI A (Vercel) atau pindah hosting

### Langkah deploy:

1. **Build aplikasi secara lokal** (di komputer Anda):
   ```bash
   bun install
   bun run build
   ```
   Ini akan membuat folder `.next/standalone/`

2. **Siapkan database MySQL** di cPanel:
   - Buka **MySQL Databases**
   - Buat database baru, contoh: `username_ppdi`
   - Buat user + password, beri privilege ke database
   - Catat: host (biasanya `localhost`), username, password, nama db

3. **Ganti Prisma ke MySQL**:
   ```bash
   # Backup schema SQLite
   cp prisma/schema.prisma prisma/schema.sqlite.bak

   # Pakai schema MySQL
   cp deploy/schema.mysql.prisma prisma/schema.prisma
   ```

4. **Set .env** (buat file `.env` di root project):
   ```
   DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/NAMA_DB"
   ```
   Ganti USER, PASSWORD, NAMA_DB sesuai database cPanel Anda.

5. **Push database schema**:
   ```bash
   bun run db:push
   bun run prisma/seed.ts
   ```

6. **Rebuild dengan MySQL**:
   ```bash
   bun run build
   ```

7. **Buat folder di cPanel File Manager**:
   - Masuk ke `public_html` (atau buat subfolder `app`)
   - Upload file-file berikut (zip dulu, upload, lalu extract):
     - `.next/standalone/` (isi: server.js, package.json, .next/)
     - `.next/static/` (ke `.next/standalone/.next/static`)
     - `public/` (ke `.next/standalone/public`)
     - `prisma/`
     - `.env`

8. **Setup Node.js App di cPanel**:
   - Buka **Setup Node.js App**
   - Node.js version: **18.x atau 20.x** (bukan 16)
   - Application root: `public_html/app` (folder tempat server.js)
   - Application URL: domain Anda
   - Application startup file: `server.js`
   - Klik **Create**

9. **Set environment variables** di form cPanel:
   - `DATABASE_URL` = `mysql://...` (sesuai langkah 4)
   - `NODE_ENV` = `production`

10. **Start aplikasi** → klik **Run NPM Install** lalu **Start App**

### Troubleshooting cPanel:
- **Error 502/503**: Cek logs di cPanel > Node.js App > Error Log
- **Database connection failed**: Pastikan MySQL user punya privilege ALL
- **Port issue**: cPanel Passenger otomatis handle port, jangan set manual
- **Cannot find module**: Jalankan `npm install` via cPanel terminal

---

## 🥉 OPSI C: VPS (DIGITALOCEAN / VULTR / CLOUDIKE)
### Cocok untuk: Produksi penuh, kontrol 100%

### Langkah deploy (Ubuntu 22.04):

1. **Buat VPS** (DigitalOcean droplet Rp 100rb/bln, 1GB RAM cukup)

2. **SSH ke server**:
   ```bash
   ssh root@IP_SERVER
   ```

3. **Install Node.js + Bun + Nginx**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs nginx
   curl -fsSL https://bun.sh/install | bash
   npm install -g pm2
   ```

4. **Clone / upload code**:
   ```bash
   mkdir -p /var/www/ppdi-cikampek
   cd /var/www/ppdi-cikampek
   # Upload file via SCP atau git clone
   ```

5. **Install + build**:
   ```bash
   bun install
   bun run build
   ```

6. **Copy static files**:
   ```bash
   cp -r .next/static .next/standalone/.next/
   cp -r public .next/standalone/
   ```

7. **Setup PM2** (process manager):
   ```bash
   mkdir -p /var/log/ppdi
   cp deploy/ecosystem.config.cjs .
   pm2 start ecosystem.config.cjs
   pm2 startup
   pm2 save
   ```

8. **Setup Nginx**:
   ```bash
   cp deploy/nginx.conf /etc/nginx/sites-available/ppdi
   ln -s /etc/nginx/sites-available/ppdi /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

9. **SSL gratis dengan Certbot**:
   ```bash
   apt install certbot python3-certbot-nginx
   certbot --nginx -d ppdi-cikampek.id -d www.ppdi-cikampek.id
   ```

10. **Seed database**:
    ```bash
    bun run db:push
    bun run prisma/seed.ts
    ```

---

## 🔧 KONFIGURASI PRODUKSI PENTING

### 1. Ganti password default!
Setelah deploy, LOGIN langsung dan:
- Ubah password admin (admin/password123 → password kuat)
- Hapus atau ubah password user lain

### 2. Environment variables untuk produksi:
```
DATABASE_URL="file:./db/custom.db"   # atau mysql://...
NODE_ENV="production"
NEXTAUTH_SECRET="generate-random-string-disini"  # opsional
```

Generate secret: `openssl rand -base64 32`

### 3. Backup database berkala:
```bash
# SQLite
cp db/custom.db db/backup-$(date +%Y%m%d).db

# MySQL
mysqldump -u USER -p NAMA_DB > backup-$(date +%Y%m%d).sql
```

---

## ❓ FAQ

**Q: Bisakah deploy ke shared hosting PHP-only (tanpa Node)?**
A: TIDAK. Aplikasi Next.js butuh Node.js runtime. Opsi: pindah ke hosting
   yang support Node, atau rewrite ulang ke PHP (tidak disarankan).

**Q: SQLite vs MySQL untuk produksi?**
A: SQLite OK untuk traffic kecil (<100 visitor/hari). Untuk lebih, gunakan MySQL.
   Vercel/Serverless WAJIB pakai MySQL eksternal (SQLite tidak persisten).

**Q: Kenapa gambar hilang setelah deploy?**
A: Karena thumbnail pakai URL Unsplash (internet). Untuk produksi, upload
   gambar ke storage sendiri (Vercel Blob, Cloudinary, atau /public lokal).

**Q: Domain custom (.id) bisa?**
A: Bisa. Vercel: tambahkan domain di Settings > Domains. VPS: arahkan A record
   ke IP server, setup Nginx + SSL.

---

## 📞 BUTUH BANTUAN?

Jika bingung, OPSI A (Vercel) adalah yang termudah. Cukup:
1. Push ke GitHub
2. Import ke Vercel
3. Selesai dalam 5 menit

Selamat deploy! 🚀
