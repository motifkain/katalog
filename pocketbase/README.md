# MotifKain — PocketBase Setup

Backend API untuk `katalog.motifkain.com`. PocketBase v0.22+ dengan 8 koleksi (6 hierarki + 2 pendukung).

## Struktur Data

```
layanan ──→ kategori ──→ subkategori ──→ produk ──→ warna ──→ gambar
                                                        └─→ deskripsi (per gambar)
+ portofolio (karya/galeri)
+ kontak     (desainer, pemasaran)
```

Lihat [POCKETBASE_SETUP.md](../POCKETBASE_SETUP.md) untuk detail field & relasi.

## Quick Start (Self-host dengan Docker)

### 1. Jalankan PocketBase

```bash
cd pocketbase
docker-compose up -d
```

PocketBase tersedia di `http://localhost:8090` (admin UI di `/_/`).

### 2. Buat Admin Account

Buka `http://localhost:8090/_/`, buat admin account baru.

### 3. Buat 8 Koleksi (Otomatis)

Paling cepat — pakai migration script:

1. Login admin UI di `http://localhost:8090/_/`
2. Buka DevTools → Console
3. Paste seluruh isi file `migrations/motifkain-collections.js`
4. Tunggu sampai muncul `[OK] DONE.` di console
5. Refresh halaman admin UI — semua koleksi sudah ada

Atau buat manual satu per satu mengikuti [POCKETBASE_SETUP.md](../POCKETBASE_SETUP.md).

### 4. Set API Rules

Koleksi publik (read-only):
- List/View: kosong (publik)
- Create/Update/Delete: `@request.auth.id != ""` (admin only)

### 5. Update CORS

Di admin UI → **Settings** → **CORS**:
- Allowed Origins: `*` (dev) atau `https://katalog.motifkain.com` (production)

### 6. Isi Data

Login admin UI → tambahkan `layanan` → `kategori` → `subkategori` → `produk` → `warna` → `gambar` dari urutan paling atas ke paling bawah. Upload gambar di koleksi `gambar` dengan relasi ke `warna`.

## Docker Commands

```bash
docker-compose up -d      # Start
docker-compose down      # Stop
docker-compose logs -f pocketbase   # View logs
docker-compose restart pocketbase   # Restart
```

## Backup

Data tersimpan di `./pb_data/`. **Backup folder ini secara berkala** (zip + upload ke cloud storage / Git LFS lokal).

## Production

Untuk deployment production, ada dua opsi:

### Opsi A — Railway (managed)

Repo sudah terkoneksi dengan Railway. URL production saat ini:
`https://katalog-production-104e.up.railway.app`

Tidak perlu Docker di server — Railway menjalankan PocketBase langsung dari image yang di-deploy.

### Opsi B — Self-host dengan Docker (server sendiri)

```bash
# Di VPS
git clone <repo>
cd <repo>/pocketbase
docker-compose up -d
```

Setup Nginx + SSL (Let's Encrypt) untuk `api.motifkain.com` → proxy ke `pocketbase:8090`.

Lihat [DEPLOYMENT-GUIDE.md](../DEPLOYMENT-GUIDE.md) untuk detail lengkap.