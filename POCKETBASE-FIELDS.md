# Field untuk Collection "catalog_pages"

Tambahkan field-field ini di PocketBase Admin → Collections → catalog_pages:

## Fields yang Perlu Ditambahkan:

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
| colorTheme | Text | No |
| fontFamily | Text | No |
| fontSizePx | Number | No |
| titleSizePx | Number | No |
| bodySizePx | Number | No |
| logoSizePx | Number | No |
| textColor | Text | No |
| bgColor | Text | No |

## Cara Tambah Field:

1. Buka PocketBase: `http://127.0.0.1:8090/_/`
2. Login sebagai admin
3. Klik **Collections**
4. Klik **catalog_pages**
5. Klik **"+ New field"**
6. Pilih type (Text / Number / File)
7. Isi nama field
8. Klik **Save**

## API Rules:

- **List/View**: `""` (public read)
- **Create**: `""` (admin only)
- **Update**: `""` (admin only)
- **Delete**: `""` (admin only)
