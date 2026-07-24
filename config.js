/**
 * MOTIFKAIN KATALOG CONFIG
 *
 * Struktur Data Hirarkis:
 * layanan → kategori → subkategori → produk → warna → gambar
 */

window.MOTIFKAIN_CONFIG = {
    // URL PocketBase API
    pocketbaseUrl: 'https://katalog-production-104e.up.railway.app',

    // Collections - Hierarki
    layananCollection: 'layanan',
    kategoriCollection: 'kategori',
    subkategoriCollection: 'subkategori',

    // Collections - Produk
    produkCollection: 'produk',
    warnaCollection: 'warna',
    gambarCollection: 'gambar',

    // Collections - Lainnya
    portfolioCollection: 'portofolio',
    kontakCollection: 'kontak',
    userCollection: 'users'
};

// Filter default untuk fallback (jika collection kosong)
const DEFAULT_LAYANAN = ['Jasa Desain', 'Kain Printing', 'Pakaian Jadi', 'Asesoris'];
