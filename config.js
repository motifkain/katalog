/**
 * MOTIFKAIN KATALOG CONFIG
 * Konfigurasi untuk Katalog MotifKain
 */
window.MOTIFKAIN_CONFIG = {
    // URL PocketBase API - Railway Production
    pocketbaseUrl: 'https://katalog-production-104e.up.railway.app',

    // Collection untuk layanan
    layananCollection: 'layanan',

    // Collection untuk welcome screen settings
    welcomeCollection: 'welcome_settings',

    // Collection untuk kategori
    kategoriCollection: 'kategori',

    // Collection untuk produk
    produkCollection: 'produk',

    // Catalog settings
    catalogTitle: 'MotifKain Katalog',
    websiteUrl: 'https://motifkain.com',

    // WhatsApp number untuk kontak (contoh: '6281234567890')
    whatsappNumber: '',

    // Debug mode
    debug: true
};

// Default Welcome Screen Settings (bisa diedit dari admin)
window.WELCOME_SETTINGS = {
    // Left side - Logo area
    logoUrl: 'assets/images/logo-motifkain.png',
    leftText: 'Deskripsi singkat tentang\nkoleksi atau perusahaan Anda.',

    // Right side - Text area
    title: 'CATALOG',
    subtitle: 'Company Profile',
    description: 'Koleksi produk eksklusif kami'
};

// ===== THEME COLORS (Tiru iswaraapp) =====
const AppTheme = {
    // Primary - Green Theme
    primaryColor: '#1B5E20',
    primaryLight: '#4CAF50',
    primaryDark: '#0D3D12',

    // Accent
    accentColor: '#8BC34A',

    // Background
    backgroundColor: '#F5F5F5',
    cardColor: '#FFFFFF',

    // Text
    textPrimary: '#212121',
    textSecondary: '#757575',
    textLight: '#BDBDBD',

    // Status
    successColor: '#4CAF50',
    warningColor: '#FF9800',
    errorColor: '#F44336',
    infoColor: '#2196F3',

    // Other
    dividerColor: '#E0E0E0',
    shadowColor: 'rgba(0,0,0,0.1)'
};
