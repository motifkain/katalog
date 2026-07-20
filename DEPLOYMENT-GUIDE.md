# Setup PocketBase + Vercel Deployment Guide

Panduan lengkap deploy MotifKain Katalog ke:
- Database: **PocketBase** (self-hosted atau cloud)
- Frontend: **Vercel** (katalog.motifkain.com)
- Domain: **katalog.motifkain.com**

---

## BAGIAN 1: POCKETBASE SETUP

### Opsi A: PocketBase Self-Hosted (Recommended untuk kontrol penuh)

#### 1. Download PocketBase

```bash
# Buat folder untuk pocketbase
mkdir -p pocketbase
cd pocketbase

# Download PocketBase v0.22+
# https://github.com/pocketbase/pocketbase/releases
# Pilih: pocketbase_0.22.x_linux_amd64.zip
```

#### 2. Setup dengan Docker (Lebih Mudah)

```bash
# Buat docker-compose.yml di folder pocketbase/
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  pocketbase:
    build: .
    ports:
      - "8090:8090"
    volumes:
      - ./pb_data:/pb_data
    restart: unless-stopped
    environment:
      - TZ=Asia/Jakarta

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - pocketbase
    restart: unless-stopped

volumes:
  pb_data:
EOF
```

```bash
# Buat nginx.conf
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name api.motifkain.com;

    location / {
        proxy_pass http://pocketbase:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

```bash
# Jalankan
docker-compose up -d
```

#### 3. Setup Admin Account

1. Buka `http://YOUR_SERVER_IP:8090/_/`
2. Klik "Create Account"
3. Buat admin credentials

#### 4. Buat Collection "catalog_pages"

1. Buka **Collections** → **New Collection**
2. Nama: `catalog_pages`
3. Tipe: **Base** (bukan Auth)

**Fields:**

| Name | Type | Required | Notes |
|------|------|----------|-------|
| template | Text | Yes | Template ID |
| order | Number | Yes | Page order |
| mainTitle | Text | No | |
| subtitle | Text | No | |
| description | Text | No | |
| title | Text | No | |
| body | Text | No | |
| overlayText | Text | No | |
| overlayPosition | Text | No | |
| header | Text | No | |
| footerText | Text | No | |
| image | File (single) | No | |
| images | File (multiple) | No | |
| logo | File (single) | No | |
| colorTheme | Text | No | Theme ID |
| fontFamily | Text | No | Font name |
| fontSizePx | Number | No | Font size |
| titleSizePx | Number | No | Title size |
| bodySizePx | Number | No | Body size |
| textColor | Text | No | Custom text color |
| bgColor | Text | No | Custom bg color |

**API Rules:**
- **List/View**: `""` (public read)
- **Create**: `""` (admin only)
- **Update**: `""` (admin only)
- **Delete**: `""` (admin only)

---

### Opsi B: PocketBase Cloud (Lebih Simpel)

1. Daftar di https://pocketbase.com/
2. Buat project baru
3. Ikuti langkah setup collection di atas
4. URL API: `https://YOUR-PROJECT.pockethost.io`

---

## BAGIAN 2: PERSIAPAN GITHUB REPO

### 1. Buat GitHub Repository

```bash
# Di folder katalog desain
cd "c:\motifkain\Katalog desain"

# Initialize git (jika belum)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - MotifKain Katalog"

# Buat repo di GitHub.com, lalu:
git remote add origin https://github.com/YOUR_USERNAME/motifkain-katalog.git
git branch -M main
git push -u origin main
```

### 2. File yang Perlu Di-push

Pastikan `.gitignore` sudah ada:

```
# .gitignore
.DS_Store
Thumbs.db
*.log
```

---

## BAGIAN 3: VERCEL DEPLOYMENT

### 1. Buat Vercel Account

1. Buka https://vercel.com
2. Login dengan GitHub
3. Klik "Add New Project"

### 2. Import Repository

1. Pilih repository `motifkain-katalog`
2. Framework: **Other** (karena pure HTML/JS)
3. Root Directory: `/` (default)
4. Build Command: Kosongkan
5. Output Directory: `/`
6. Klik **Deploy**

### 3. Setup Custom Domain

1. Setelah deploy, buka project settings
2. Klik **Domains**
3. Masukkan `katalog.motifkain.com`
4. Klik **Add**

### 4. Konfigurasi DNS

Di panel domain kamu (GoDaddy/Namecheap/etc):

```
Type: A Record / CNAME
Name: katalog
Value: cname.vercel-dns.com (atau IP dari Vercel)
```

Tunggu propagasi (biasanya 5-30 menit).

---

## BAGIAN 4: KONEKSIKAN FRONTEND KE POCKETBASE

### 1. Update Kode untuk Production

Karena ini static site di Vercel, kamu perlu update URL PocketBase:

**Option A: Hardcoded URL**
Edit `admin.html` line ~646:
```javascript
this.pocketbaseUrl = 'https://api.motifkain.com'; // atau URL PocketBase kamu
```

**Option B: Environment Variable**
Vercel doesn't support runtime env vars untuk static sites dengan mudah.

**Option C: Config File (Recommended)**
Buat file `config.js`:

```javascript
// config.js - Deploy ini ke root folder
window.MOTIFKAIN_CONFIG = {
    pocketbaseUrl: 'https://api.motifkain.com',
    pocketbaseCollection: 'catalog_pages'
};
```

Lalu include di `index.html` dan `admin.html`:
```html
<script src="config.js"></script>
```

### 2. Update flipbook.js

Edit `assets/js/flipbook.js`:

```javascript
async loadPages() {
    // Gunakan config atau fallback
    const pbUrl = window.MOTIFKAIN_CONFIG?.pocketbaseUrl;

    if (pbUrl) {
        try {
            const response = await fetch(`${pbUrl}/api/collections/catalog_pages/records?sort=order`);
            const data = await response.json();
            this.pages = data.items;
        } catch (e) {
            console.log('PocketBase unavailable, using localStorage');
            this.pages = this.loadFromLocalStorage();
        }
    } else {
        this.pages = this.loadFromLocalStorage();
    }

    this.totalPages = this.pages.length;
}
```

---

## BAGIAN 5: VERIFIKASI

### Checklist:

- [ ] PocketBase running dan accessible
- [ ] Collection "catalog_pages" sudah dibuat dengan field yang benar
- [ ] API Rules sudah diset (public read)
- [ ] GitHub repo sudah dibuat
- [ ] Vercel project sudah di-deploy
- [ ] Domain `katalog.motifkain.com` sudah ditambahkan
- [ ] DNS sudah propagasi
- [ ] `config.js` sudah diupdate dengan URL PocketBase
- [ ] Test: Buka `katalog.motifkain.com`
- [ ] Test: Login ke `katalog.motifkain.com/admin`
- [ ] Test: Sync data dari PocketBase

### Test Commands:

```bash
# Test PocketBase API
curl https://api.motifkain.com/api/collections/catalog_pages/records

# Should return: {"items":[],"totalItems":0,"totalPages":1,"page":1}
```

---

## BAGIAN 6: SSL & SECURITY

### Auto SSL di Vercel
SSL otomatis diberikan oleh Vercel untuk custom domain.

### Auto SSL untuk PocketBase (Self-hosted)
Nginx config sudah include SSL setup. Atau gunakan Let's Encrypt:

```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d api.motifkain.com
```

---

## ARCHITECTURE AKHIR

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET                             │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
   katalog.motifkain.com      api.motifkain.com
   (Vercel - Static)          (PocketBase - API)
        │                           │
        │    ┌──────────────────────┘
        │    │
        ▼    ▼
   ┌─────────────────┐
   │  PocketBase DB   │
   │  catalog_pages   │
   └─────────────────┘

Admin: katalog.motifkain.com/admin
Viewer: katalog.motifkain.com
API: api.motifkain.com
```

---

## TROUBLESHOOTING

### Error: PocketBase Connection Failed
1. Cek PocketBase running: `curl http://localhost:8090/api/health`
2. Cek CORS settings di PocketBase Admin → Settings → CORS
3. Tambahkan: `https://katalog.motifkain.com` ke allowed origins

### Error: CORS Policy
Di PocketBase Admin:
1. Settings → CORS
2. Allowed Origins: `https://katalog.motifkain.com`
3. Save

### Error: 404 Domain
1. Cek DNS propagation: https://dnschecker.org
2. Pastikan CNAME record benar

---

Butuh bantuan untuk bagian tertentu?
