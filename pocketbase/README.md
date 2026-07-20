# MOTIFKAIN KATALOG - POCKETBASE SETUP

## Quick Start

### 1. Jalankan PocketBase dengan Docker

```bash
cd pocketbase
docker-compose up -d
```

### 2. Setup Admin

1. Buka browser: http://localhost:8090/_/
2. Buat admin account baru

### 3. Buat Collection

1. Buka **Collections** → **New Collection**
2. Nama: `catalog_pages`
3. Tipe: **Base**

Tambahkan field sesuai tabel di DEPLOYMENT-GUIDE.md

### 4. Set API Rules

- **List/View**: `""` (public)
- **Create/Update/Delete**: `""` (admin only)

### 5. Update CORS

1. Settings → CORS
2. Allowed Origins: `*` atau domain spesifik kamu

---

## Docker Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f pocketbase

# Restart
docker-compose restart pocketbase
```

---

## Data Location

Data PocketBase tersimpan di: `./pb_data/`

**PENTING:** Backup folder ini secara berkala!
