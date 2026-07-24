# MotifKain — Katalog Motif Tradisional Nusantara

Etalase digital untuk motif kain tradisional Indonesia — batik, tenun, songket, sasirangan, dan lain-lain.
Live: [katalog.motifkain.com](https://katalog.motifkain.com)

## Stack

- **Frontend**: HTML statis + vanilla JS + CSS (no build, no deps)
- **Backend**: PocketBase v0.22 (single binary, SQLite, admin UI)
- **Hosting**: Vercel (frontend) + Railway (PocketBase)
- **Font**: Cormorant Garamond + Inter (Google Fonts)
- **Palet**: Cokelat kayu + krem aged-paper + aksen emas antik

## Struktur

```
.
├── index.html              # Halaman publik (beranda + katalog + detail)
├── config.js               # URL PocketBase + nama koleksi + sample fallback
├── assets/
│   ├── css/style.css       # Design tokens + layout responsif
│   ├── js/app.js           # Load hierarki PB + render + interaksi
│   └── images/             # Aset visual
├── logo/                   # Logo MotifKain
├── admin.html              # [Phase 2] Dashboard admin
├── vercel.json             # Rewrite /admin → admin.html
├── Dockerfile              # Image PocketBase untuk self-host
├── pocketbase/
│   ├── docker-compose.yml  # PocketBase + Nginx (self-host)
│   ├── README.md           # Setup self-host
│   └── migrations/
│       └── motifkain-collections.js   # Auto-create 8 koleksi
├── DEPLOYMENT-GUIDE.md     # Deploy Vercel + Railway
├── POCKETBASE_SETUP.md     # Schema detail + manual setup
└── README.md               # (file ini)
```

## Struktur Data (PocketBase)

Hierarki 6 koleksi + 2 pendukung:

```
layanan ──→ kategori ──→ subkategori ──→ produk ──→ warna ──→ gambar
                                                        └─→ deskripsi (per gambar)
+ portofolio
+ kontak     (role: desainer | pemasaran)
```

Setiap `produk` bisa punya banyak `warna`, dan setiap `warna` punya banyak `gambar` dengan deskripsi sendiri.

API rules: publik bisa baca (List/View), hanya admin yang login bisa Create/Update/Delete.

## Jalankan Lokal

```bash
cd "katalog desain"
python -m http.server 8000
# Buka: http://localhost:8000/
```

Atau gunakan VS Code Live Server extension, klik kanan `index.html` → "Open with Live Server".

Tanpa PocketBase berjalan pun, frontend tetap menampilkan data sample fallback (6 motif dari 4 layanan) sehingga UI bisa dievaluasi langsung.

## Setup PocketBase Production

Lihat [POCKETBASE_SETUP.md](./POCKETBASE_SETUP.md) untuk schema detail, atau gunakan migration otomatis:

1. Buka admin UI PocketBase (`https://katalog-production-104e.up.railway.app/_/`)
2. Login sebagai admin
3. Buka DevTools (F12) → Console
4. Paste seluruh isi `pocketbase/migrations/motifkain-collections.js`
5. Tunggu sampai `[OK] DONE.` muncul
6. Refresh admin UI — 8 koleksi sudah siap

Setelah koleksi dibuat, login admin UI dan isi data berurutan dari atas:
**layanan → kategori → subkategori → produk → warna → gambar**

## Phase 1 (sekarang): Katalog Publik

Yang sudah jadi:
- ✅ Hero beranda dengan statistik
- ✅ Filter kategori (chip pill)
- ✅ Search bar
- ✅ Grid motif responsif (2/3/4 kolom)
- ✅ Modal detail (gallery + warna + kontak WA)
- ✅ Lightbox gambar
- ✅ Section Cerita (3 info card)
- ✅ Section Tentang + kontak
- ✅ Footer
- ✅ Fallback sample data (otomatis)
- ✅ Mobile-first responsive
- ✅ A11y: focus-visible, keyboard nav, ARIA

Yang akan datang (Phase 2):
- ⏳ Dashboard admin
- ⏳ Login admin PocketBase
- ⏳ Form produk cascade (warna + gambar)

## Deploy ke Vercel

Lihat [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md).

Singkat:
1. Push ke GitHub
2. Vercel → Import project → Deploy
3. `vercel.json` sudah mengatur rewrite `/admin` → `admin.html`
4. PocketBase production URL sudah ada di `config.js`

## Warna & Tipografi

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-primary` | `#5D4037` | Cokelat kayu — heading, tombol primary |
| `--color-primary-dark` | `#3E2723` | Heading level-1, hover, footer |
| `--color-accent` | `#C9A961` | Emas antik — highlight, border hover |
| `--color-secondary` | `#A47148` | Kayu manis — gradient hero |
| `--color-bg` | `#FAF7F2` | Kertas aged — body background |
| `--color-card` | `#FFFFFF` | Card motif |
| `--color-text` | `#2C2520` | Teks utama |

Font display: **Cormorant Garamond** (serif, judul & section). Font body: **Inter** (sans, paragraf & UI).

## Lisensi

© 2026 MotifKain. Konten motif adalah warisan budaya bersama — bukan milik perseorangan.