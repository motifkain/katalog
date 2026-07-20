/**
 * MOTIFKAIN KATALOG CONFIG
 *
 * PENTING: Update URL sesuai dengan PocketBase kamu
 *
 * Untuk LOCAL development: http://127.0.0.1:8090
 * Untuk PRODUCTION: https://api.motifkain.com (sesuaikan dengan server kamu)
 */
window.MOTIFKAIN_CONFIG = {
    // URL PocketBase API - PRODUCTION
    // LOCAL: http://127.0.0.1:8090
    // PRODUCTION: https://api.motifkain.com
    pocketbaseUrl: 'https://api.motifkain.com',

    // Nama collection (default: catalog_pages)
    pocketbaseCollection: 'catalog_pages',

    // Catalog settings
    catalogTitle: 'MotifKain Katalog',
    websiteUrl: 'https://motifkain.com',

    // WhatsApp number untuk kontak (contoh: '6281234567890')
    whatsappNumber: '',

    // Debug mode - set true untuk melihat log di console
    debug: true
};
