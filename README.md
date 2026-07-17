# MotifKain Katalog Desain

Katalog flipbook interaktif dengan ukuran **Instagram Portrait (4:5)** - 1080x1350px

## 🚀 Fitur

- ✅ **Auto-post** - Setiap halaman langsung masuk katalog
- ✅ **Drag & Drop** - Tukar posisi halaman dengan drag
- ✅ **7 Template** - Cover, Gambar Penuh, Image+Text, Text+Image, Text Only, Gallery
- ✅ **Ukuran Instagram** - 4:5 Portrait (1080x1350)
- ✅ **Responsive** - Tampil optimal di mobile & desktop
- ✅ **PocketBase Ready** - Sinkronisasi data ke database cloud
- ✅ **Share** - Bagikan katalog via link

## 📁 Struktur

```
katalog desain/
├── index.html           # Halaman katalog publik
├── admin.html           # Dashboard admin
├── assets/
│   ├── css/style.css   # Styling dasar
│   ├── js/
│   │   ├── templates.js  # Template halaman
│   │   └── flipbook.js   # Logika flipbook
│   └── logo/
├── data/
└── README.md
```

## 🔧 Setup Lokal

1. **Buka dengan Live Server** (VS Code):
   - Install extension "Live Server"
   - Klik kanan `admin.html` → "Open with Live Server"

2. **Atau dengan Python**:
   ```bash
   cd "c:\motifkain\katalog desain"
   python -m http.server 8000
   ```
   Buka: `http://localhost:8000/`

## ☁️ Setup PocketBase (untuk Production)

Karena Vercel adalah static hosting, data perlu disimpan di database cloud. Gunakan **PocketBase**:

### 1. Download PocketBase
- Download dari https://pocketbase.io/docs/
- Extract ke folder lokal

### 2. Jalankan PocketBase
```bash
./pocketbase serve
```
Akan berjalan di `http://127.0.0.1:8090`

### 3. Setup Admin
1. Buka `http://127.0.0.1:8090/_/`
2. Buat admin account baru

### 4. Buat Collection
1. Buka **Collections** → **New Collection**
2. Nama: `catalog_pages`
3. Tipe: **Base** (bukan Auth)

#### Fields:
| Name | Type | Required |
|------|------|----------|
| template | Text | Yes |
| order | Number | Yes |
| mainTitle | Text | No |
| subtitle | Text | No |
| description | Text | No |
| title | Text | No |
| body | Text | No |
| overlayText | Text | No |
| overlayPosition | Text | No |
| header | Text | No |
| footerText | Text | No |
| image | File (single) | No |
| images | File (multiple) | No |
| logo | File (single) | No |

### 5. Set API Rules
- **List/View**: `""` (public)
- **Create/Update/Delete**: `""` (admin only)

### 6. Hubungkan ke App
1. Buka dashboard admin
2. Masukkan PocketBase URL: `http://127.0.0.1:8090`
3. Masukkan admin password
4. Klik **Sync**

## 🌐 Deploy ke Vercel

1. Push kode ke GitHub
2. Buat project baru di Vercel
3. Import repository
4. Deploy!

**Note:** Untuk production, gunakan PocketBase cloud atau hosted version, bukan localhost.

## 📱 Penggunaan

### Admin Dashboard
- **Tambah halaman**: Klik tombol "+ Tambah"
- **Edit halaman**: Klik halaman di daftar kiri
- **Tukar posisi**: Drag halaman untuk rearrange
- **Pilih template**: Klik template di panel kanan
- **Upload gambar**: Klik area upload

### Katalog Publik
- **Navigasi**: Klik kiri/kanan, atau swipe
- **Page dots**: Klik untuk loncat ke halaman
- **Keyboard**: Arrow keys, Space
- **Share**: Klik tombol "Bagikan"

## 🎨 Template

| Template | Deskripsi |
|----------|-----------|
| Cover Gelap | Background gradient gelap premium |
| Cover Terang | Background cream/beige premium |
| Gambar Penuh | Foto full dengan overlay teks |
| Gambar + Teks | Gambar 60% atas, teks 40% bawah |
| Teks + Gambar | Teks 40% atas, gambar 60% bawah |
| Teks Saja | Layout teks premium tanpa gambar |
| Gallery 2x2 | Grid 4 gambar |

## 🔐 Default Password

Admin: `motifkain2024`

## 📝 Warna

| Nama | Hex | Penggunaan |
|------|-----|-----------|
| Coklat Tua | #5D4037 | Heading, teks utama |
| Teal | #008B8B | Accent, tombol |
| Beige | #F5F0E8 | Background |
| Cream | #FFF8F0 | Card, area teks |
| Gold | #C9A66B | Decorative accent |

## 📄 License

© 2024 MotifKain. All rights reserved.
