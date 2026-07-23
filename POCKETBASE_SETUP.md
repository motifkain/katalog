# PocketBase Collections Guide - MotifKain Katalog

## Collection Overview

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   produk    │ 1 ─── n │    warna    │ 1 ─── n │    gambar    │
└─────────────┘         └─────────────┘         └─────────────┘

┌─────────────┐
│  portfolio  │ (standalone)
└─────────────┘
```

---

## 1. Collection: `produk`

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `nama` | text | Yes | Nama produk (contoh: "Motif Parang Klasik") |
| `kategori` | text | No | Kategori produk (contoh: "Batik", "Tenun", "Songket") |
| `subkategori` | text | No | Sub kategori (contoh: "Motif Bunga", "Geometris") |
| `layanan` | select | No | Jenis layanan. Options: `Jasa Desain`, `Kain Printing`, `Pakaian Jadi`, `Asesoris` |
| `harga` | number | No | Harga produk (angka saja, contoh: 150000) |
| `deskripsi` | text | No | Deskripsi umum produk |

### Settings:
- **Name**: `produk`
- **List rule**: Leave empty (public read)
- **Create rule**: Admin auth only
- **Update rule**: Admin auth only
- **Delete rule**: Admin auth only

---

## 2. Collection: `warna`

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `nama` | text | Yes | Nama warna (contoh: "Merah Maroon", "Biru Navy") |
| `produk` | relation | Yes | Relasi ke collection `produk` |

### Settings:
- **Name**: `warna`
- **List rule**: Leave empty (public read)
- **Create rule**: Admin auth only
- **Update rule**: Admin auth only
- **Delete rule**: Admin auth only

### Relation Settings:
- **Collection**: `produk`
- **Type**: Many
- **Display fields**: `nama`
- **MaxSelect**: No limit

---

## 3. Collection: `gambar`

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `gambar` | file | Yes | File gambar (jpg, png, webp) |
| `deskripsi` | text | No | Deskripsi untuk gambar ini |
| `warna` | relation | Yes | Relasi ke collection `warna` |

### Settings:
- **Name**: `gambar`
- **List rule**: Leave empty (public read)
- **Create rule**: Admin auth only
- **Update rule**: Admin auth only
- **Delete rule**: Admin auth only

### File Storage:
- **Max file size**: 10MB (sesuaikan)
- **Allowed file types**: `image/jpeg`, `image/png`, `image/webp`

### Relation Settings:
- **Collection**: `warna`
- **Type**: Many
- **Display fields**: `nama`
- **MaxSelect**: No limit

---

## 4. Collection: `portfolio`

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `judul` | text | Yes | Judul portfolio (contoh: "Koleksi Batik Nusantara") |
| `kategori` | text | No | Kategori portfolio (contoh: "Batik", "Tenun") |
| `deskripsi` | text | No | Deskripsi portfolio |
| `image` | file | No | Gambar utama portfolio |
| `images` | file (multiple) | No | Gambar tambahan portfolio |

### Settings:
- **Name**: `portfolio`
- **List rule**: Leave empty (public read)
- **Create rule**: Admin auth only
- **Update rule**: Admin auth only
- **Delete rule**: Admin auth only

### File Storage:
- **Max file size**: 10MB
- **Allowed file types**: `image/jpeg`, `image/png`, `image/webp`

---

## Setup Steps

### Step 1: Buat Collection `produk`
1. Buka PocketBase → Collections → New Collection
2. Name: `produk`
3. Add fields:
   - **nama**: Type `text`, Required ✓
   - **kategori**: Type `text`
   - **subkategori**: Type `text`
   - **layanan**: Type `select`, Options: `Jasa Desain`, `Kain Printing`, `Pakaian Jadi`, `Asesoris`
   - **harga**: Type `number`
   - **deskripsi**: Type `text`
4. Set API Rules:
   - List rule: (kosongkan)
   - Create rule: `@request.auth.id != ""`
   - Update rule: `@request.auth.id != ""`
   - Delete rule: `@request.auth.id != ""`
5. Save

### Step 2: Buat Collection `warna`
1. New Collection → Name: `warna`
2. Add fields:
   - **nama**: Type `text`, Required ✓
   - **produk**: Type `relation`, Relation to `produk`, Type `Many`
3. Set API Rules: Same as above
4. Save

### Step 3: Buat Collection `gambar`
1. New Collection → Name: `gambar`
2. Add fields:
   - **gambar**: Type `file`, Required ✓
   - **deskripsi**: Type `text`
   - **warna**: Type `relation`, Relation to `warna`, Type `Many`
3. Set API Rules: Same as above
4. Save

### Step 4: Buat Collection `portfolio`
1. New Collection → Name: `portfolio`
2. Add fields:
   - **judul**: Type `text`, Required ✓
   - **kategori**: Type `text`
   - **deskripsi**: Type `text`
   - **image**: Type `file`
   - **images**: Type `file`, MaxSelect `50`
3. Set API Rules: Same as above
4. Save

---

## Alur Data

### Menambah Produk Baru:
1. Buat record di `produk` (nama, kategori, subkategori, layanan, harga, deskripsi)
2. Buat record di `warna` untuk setiap warna (nama + relasi ke produk)
3. Di setiap `warna`, upload gambar-gambar via collection `gambar`

### Menampilkan di Katalog:
```
Load produk → Load semua warna untuk produk tersebut → Load semua gambar untuk setiap warna
```

### Struktur JSON yang Di-load:
```json
{
  "id": "xxx",
  "nama": "Motif Parang Klasik",
  "kategori": "Batik",
  "subkategori": "Motif Parang",
  "layanan": "Jasa Desain",
  "harga": 150000,
  "deskripsi": "Desain motif parang klasik...",
  "warnaList": [
    {
      "id": "yyy",
      "nama": "Merah Maroon",
      "images": [
        { "id": "zzz", "gambar": "url_to_image", "deskripsi": "Detail motif" }
      ]
    },
    {
      "id": "yyy2",
      "nama": "Biru Navy",
      "images": [
        { "id": "zzz2", "gambar": "url_to_image", "deskripsi": "Tampak samping" }
      ]
    }
  ]
}
```

---

## Notes

- **API Rules** menggunakan `@request.auth.id != ""` berarti hanya user yang login (admin) yang bisa create/update/delete
- **List rule** dikosongkan berarti semua orang bisa melihat data (public read)
- Untuk testing, kamu bisa pakai sample data yang sudah ada di code
