# PocketBase Collections Guide - MotifKain Katalog

## Struktur Data Hirarkis

```
layanan ──→ kategori ──→ subkategori ──→ produk ──→ warna ──→ gambar
                                                        └─→ deskripsi (per gambar)
```

---

## 1. Collection: `layanan`

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `nama` | text | Yes | Nama layanan (contoh: "Jasa Desain", "Kain Printing", "Pakaian Jadi", "Asesoris") |
| `order` | number | No | Urutan tampil (untuk sorting) |

### Settings:
- **Name**: `layanan`
- **List rule**: Leave empty (public read)
- **Create rule**: `@request.auth.id != ""` (admin only)
- **Update rule**: `@request.auth.id != ""` (admin only)
- **Delete rule**: `@request.auth.id != ""` (admin only)

---

## 2. Collection: `kategori`

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `nama` | text | Yes | Nama kategori (contoh: "Batik", "Tenun", "Songket") |
| `layanan` | relation | Yes | Relasi ke collection `layanan` |
| `order` | number | No | Urutan tampil |

### Settings:
- **Name**: `kategori`
- **List rule**: Leave empty (public read)
- **Create rule**: `@request.auth.id != ""`
- **Update rule**: `@request.auth.id != ""`
- **Delete rule**: `@request.auth.id != ""`

### Relation Settings:
- **Collection**: `layanan`
- **Type**: One (setiap kategori milik satu layanan)
- **Display fields**: `nama`
- **MaxSelect**: 1

---

## 3. Collection: `subkategori`

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `nama` | text | Yes | Nama subkategori (contoh: "Motif Bunga", "Motif Geometris", "Kain Polos") |
| `kategori` | relation | Yes | Relasi ke collection `kategori` |
| `order` | number | No | Urutan tampil |

### Settings:
- **Name**: `subkategori`
- **List rule**: Leave empty (public read)
- **Create rule**: `@request.auth.id != ""`
- **Update rule**: `@request.auth.id != ""`
- **Delete rule**: `@request.auth.id != ""`

### Relation Settings:
- **Collection**: `kategori`
- **Type**: One (setiap subkategori milik satu kategori)
- **Display fields**: `nama`
- **MaxSelect**: 1

---

## 4. Collection: `produk`

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `nama` | text | Yes | Nama produk (contoh: "Motif Parang Klasik") |
| `subkategori` | relation | Yes | Relasi ke collection `subkategori` |
| `harga` | number | No | Harga produk (angka saja, contoh: 150000) |
| `deskripsi` | text | No | Deskripsi umum produk |

### Settings:
- **Name**: `produk`
- **List rule**: Leave empty (public read)
- **Create rule**: `@request.auth.id != ""`
- **Update rule**: `@request.auth.id != ""`
- **Delete rule**: `@request.auth.id != ""`

### Relation Settings:
- **Collection**: `subkategori`
- **Type**: One (setiap produk milik satu subkategori)
- **Display fields**: `nama`
- **MaxSelect**: 1

---

## 5. Collection: `warna`

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `nama` | text | Yes | Nama warna (contoh: "Merah Maroon", "Biru Navy") |
| `produk` | relation | Yes | Relasi ke collection `produk` |

### Settings:
- **Name**: `warna`
- **List rule**: Leave empty (public read)
- **Create rule**: `@request.auth.id != ""`
- **Update rule**: `@request.auth.id != ""`
- **Delete rule**: `@request.auth.id != ""`

### Relation Settings:
- **Collection**: `produk`
- **Type**: Many (satu produk bisa punya banyak warna)
- **Display fields**: `nama`
- **MaxSelect**: No limit

---

## 6. Collection: `gambar`

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `gambar` | file | Yes | File gambar (jpg, png, webp) |
| `deskripsi` | text | No | Sub deskripsi untuk gambar ini |
| `warna` | relation | Yes | Relasi ke collection `warna` |

### Settings:
- **Name**: `gambar`
- **List rule**: Leave empty (public read)
- **Create rule**: `@request.auth.id != ""`
- **Update rule**: `@request.auth.id != ""`
- **Delete rule**: `@request.auth.id != ""`

### File Storage:
- **Max file size**: 10MB
- **Allowed file types**: `image/jpeg`, `image/png`, `image/webp`

### Relation Settings:
- **Collection**: `warna`
- **Type**: Many (satu warna bisa punya banyak gambar)
- **Display fields**: `nama`
- **MaxSelect**: No limit

---

## 7. Collection: `portofolio`

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `judul` | text | Yes | Judul portofolio |
| `kategori` | text | No | Kategori portofolio |
| `deskripsi` | text | No | Deskripsi portofolio |
| `image` | file | No | Gambar utama portofolio |
| `images` | file (multiple) | No | Gambar tambahan portofilio |

### Settings:
- **Name**: `portofolio`
- **List rule**: Leave empty (public read)
- **Create rule**: `@request.auth.id != ""`
- **Update rule**: `@request.auth.id != ""`
- **Delete rule**: `@request.auth.id != ""`

---

## 8. Collection: `kontak`

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `nama` | text | Yes | Nama lengkap kontak |
| `role` | select | Yes | Role: `desainer`, `pemasaran` |
| `whatsapp` | text | Yes | Nomor WA dengan kode negara (contoh: `6281234567890`) |

### Settings:
- **Name**: `kontak`
- **List rule**: Leave empty (public read)
- **Create rule**: `@request.auth.id != ""`
- **Update rule**: `@request.auth.id != ""`
- **Delete rule**: `@request.auth.id != ""`

---

## Setup Steps

### Step 1: Buat Collection `layanan`
1. PocketBase → Collections → New Collection
2. Name: `layanan`
3. Add fields:
   - **nama**: Type `text`, Required ✓
   - **order**: Type `number`
4. Set API Rules:
   - List rule: (kosongkan)
   - Create/Update/Delete: `@request.auth.id != ""`
5. Insert sample data: "Jasa Desain", "Kain Printing", "Pakaian Jadi", "Asesoris"

### Step 2: Buat Collection `kategori`
1. New Collection → Name: `kategori`
2. Add fields:
   - **nama**: Type `text`, Required ✓
   - **layanan**: Type `relation`, Relation to `layanan`, Type `One`, MaxSelect `1`
   - **order**: Type `number`
3. Set API Rules: Same as above
4. Relasikan ke layanan yang sesuai

### Step 3: Buat Collection `subkategori`
1. New Collection → Name: `subkategori`
2. Add fields:
   - **nama**: Type `text`, Required ✓
   - **kategori**: Type `relation`, Relation to `kategori`, Type `One`, MaxSelect `1`
   - **order**: Type `number`
3. Set API Rules: Same as above

### Step 4: Buat/UPDATE Collection `produk`
> **CATATAN**: Jika collection `produk` sudah ada, hapus field `kategori` dan `subkategori` yang lama (text), lalu tambahkan field baru:

1. Collection: `produk`
2. Hapus field lama: `kategori` (text), `subkategori` (text), `layanan` (select)
3. Add fields:
   - **nama**: Type `text`, Required ✓ (jika belum ada)
   - **subkategori**: Type `relation`, Relation to `subkategori`, Type `One`, MaxSelect `1`
   - **harga**: Type `number` (jika belum ada)
   - **deskripsi**: Type `text` (jika belum ada)
4. Set API Rules: Same as above

### Step 5-6: Buat Collection `warna` dan `gambar`
(Sama seperti sebelumnya, tidak berubah)

### Step 7: Buat Collection `portofolio`
(Sama seperti sebelumnya, tidak berubah)

### Step 8: Buat Collection `kontak`
(Sama seperti sebelumnya, tidak berubah)

---

## Alur Data (Updated)

### Menambah Produk Baru:
```
1. Pilih layanan → Pilih kategori → Pilih subkategori
2. Buat record di `produk` (nama + relasi subkategori + harga + deskripsi)
3. Buat record di `warna` untuk setiap warna (nama + relasi ke produk)
4. Upload gambar-gambar via collection `gambar` (relasi ke warna + deskripsi)
```

### Menampilkan di Katalog:
```
Load layanan → Load kategori (filter by layanan) → Load subkategori (filter by kategori)
    → Load produk (filter by subkategori)
    → Load warna (filter by produk)
    → Load gambar (filter by warna)
```

### Struktur JSON yang Di-load:
```json
{
  "layanan": [
    {
      "id": "l1",
      "nama": "Jasa Desain",
      "kategoriList": [
        {
          "id": "k1",
          "nama": "Batik",
          "subkategoriList": [
            {
              "id": "sk1",
              "nama": "Motif Parang",
              "produkList": [
                {
                  "id": "p1",
                  "nama": "Motif Parang Klasik",
                  "harga": 150000,
                  "deskripsi": "Desain motif parang klasik...",
                  "warnaList": [
                    {
                      "id": "w1",
                      "nama": "Merah Maroon",
                      "images": [
                        { "id": "g1", "gambar": "url_image", "deskripsi": "Detail motif" }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Notes

- **API Rules** menggunakan `@request.auth.id != ""` berarti hanya user yang login (admin) yang bisa create/update/delete
- **List rule** dikosongkan berarti semua orang bisa melihat data (public read)
- Urutan tampil dikontrol oleh field `order` (ascending)
- Relasi `One` = Many-to-One (banyak subkategori milik satu kategori, dll)
