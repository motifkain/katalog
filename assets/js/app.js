/**
 * MOTIFKAIN KATALOG - MAIN APP
 * Tiruan tampilan iswaraapp
 */

// ===== CONFIG =====
const CONFIG = window.MOTIFKAIN_CONFIG || {
    pocketbaseUrl: 'https://katalog-production-104e.up.railway.app',
    welcomeCollection: 'welcome_settings',
    produkCollection: 'produk',
    kategoriCollection: 'kategori'
};

// ===== STATE =====
let welcomeSettings = window.WELCOME_SETTINGS || {
    logoUrl: '',
    leftText: 'Deskripsi singkat tentang\nkoleksi atau perusahaan Anda.',
    title: 'CATALOG',
    subtitle: 'Company Profile',
    description: 'Koleksi produk eksklusif kami'
};

let products = [];
let filteredProducts = [];
let categories = [];
let productCarousels = {};
let currentImageIndex = 0;
let currentCategory = 'desain-motif';
let currentSubcategory = null;

let selectedProduct = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadWelcomeSettings();
    await loadCategories();
    await loadProducts();
    setupSearch();
    renderWelcomeScreen();
});

// ===== WELCOME SCREEN =====
async function loadWelcomeSettings() {
    try {
        const res = await fetch(`${CONFIG.pocketbaseUrl}/api/collections/${CONFIG.welcomeCollection}/records?per-page=1`);
        if (res.ok) {
            const data = await res.json();
            if (data.items && data.items.length > 0) {
                const item = data.items[0];
                welcomeSettings = {
                    id: item.id,
                    template: item.template || 'cover-dark',
                    colorTheme: item.colorTheme || 'elegant-gold',
                    fontFamily: item.fontFamily || 'Playfair Display',
                    logoUrl: item.logo ? `${CONFIG.pocketbaseUrl}/api/files/${CONFIG.welcomeCollection}/${item.id}/${item.logo}` : '',
                    leftText: item.leftText || item.left_text || 'Deskripsi singkat tentang\nkoleksi atau perusahaan Anda.',
                    title: item.title || 'CATALOG',
                    subtitle: item.subtitle || 'Company Profile',
                    description: item.description || 'Koleksi produk eksklusif kami'
                };
            }
        }
    } catch (e) {
        console.log('Welcome settings from config file');
    }
}

function getThemeColors(themeId) {
    const themes = {
        'elegant-gold': {
            primary: '#5D4037',
            secondary: '#8D6E63',
            accent: '#C9A66B',
            accentAlt: '#008B8B',
            textDark: '#1a1a1a',
            textLight: '#6D4C41',
            textMuted: '#A1887F',
            bgLight: '#FFF8F0',
            bgDark: '#1a2a3a',
            bgCard: '#FFFFFF'
        },
        'ocean-blue': {
            primary: '#1E3A5F',
            secondary: '#4A90A4',
            accent: '#E8F4F8',
            accentAlt: '#26C6DA',
            textDark: '#0D2137',
            textLight: '#3D5A73',
            textMuted: '#6B8BA4',
            bgLight: '#F0F8FF',
            bgDark: '#0D2137',
            bgCard: '#FFFFFF'
        },
        'forest-green': {
            primary: '#2D4739',
            secondary: '#4CAF50',
            accent: '#A5D6A7',
            accentAlt: '#8BC34A',
            textDark: '#1B3324',
            textLight: '#3D5C4A',
            textMuted: '#6B8B7A',
            bgLight: '#F1F8E9',
            bgDark: '#1B3324',
            bgCard: '#FFFFFF'
        },
        'monochrome': {
            primary: '#212121',
            secondary: '#616161',
            accent: '#BDBDBD',
            accentAlt: '#9E9E9E',
            textDark: '#000000',
            textLight: '#424242',
            textMuted: '#757575',
            bgLight: '#FAFAFA',
            bgDark: '#000000',
            bgCard: '#FFFFFF'
        }
    };
    return themes[themeId] || themes['elegant-gold'];
}

function renderWelcomeScreen() {
    const ws = welcomeSettings;
    const theme = getThemeColors(ws.colorTheme || 'elegant-gold');
    const template = ws.template || 'cover-dark';

    // Hide static elements
    document.getElementById('welcomeTitle').style.display = 'none';
    document.getElementById('welcomeSubtitle').style.display = 'none';
    document.getElementById('welcomeDesc').style.display = 'none';
    document.getElementById('welcomeLeftText').style.display = 'none';
    document.getElementById('welcomeLogoImg').style.display = 'none';
    document.getElementById('welcomeLogoPlaceholder').style.display = 'none';

    // Render based on template
    const welcomeScreen = document.getElementById('welcomeScreen');

    let html = '';
    switch(template) {
        case 'cover-dark':
            html = renderWelcomeDark(ws, theme);
            break;
        case 'cover-light':
            html = renderWelcomeLight(ws, theme);
            break;
        case 'cover-split':
            html = renderWelcomeSplit(ws, theme);
            break;
        case 'cover-numbered':
            html = renderWelcomeNumbered(ws, theme);
            break;
        case 'cover-minimal':
            html = renderWelcomeMinimal(ws, theme);
            break;
        default:
            html = renderWelcomeDark(ws, theme);
    }

    welcomeScreen.innerHTML = html;
}

function renderWelcomeDark(ws, theme) {
    const logoHtml = ws.logoUrl
        ? `<img src="${ws.logoUrl}" style="height:60px;margin-bottom:20px;object-fit:contain;">`
        : `<div style="width:60px;height:60px;border:2px dashed ${theme.accent};border-radius:8px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;opacity:0.5;"><span style="font-size:1.5rem;">📷</span></div>`;

    return `
    <div style="width:100%;height:100%;background:linear-gradient(180deg,${theme.bgDark} 0%,${theme.primary} 100%);padding:8%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
        <div style="position:absolute;top:5%;left:5%;width:40px;height:40px;border-top:2px solid ${theme.accent};border-left:2px solid ${theme.accent};opacity:0.4;"></div>
        <div style="position:absolute;bottom:5%;right:5%;width:40px;height:40px;border-bottom:2px solid ${theme.accent};border-right:2px solid ${theme.accent};opacity:0.4;"></div>
        <div style="text-align:center;margin-bottom:auto;">
            ${logoHtml}
        </div>
        <div style="text-align:center;flex:1;display:flex;flex-direction:column;justify-content:center;">
            <h1 style="font-family:'${ws.fontFamily}',serif;font-size:2.5rem;color:#fff;margin-bottom:10px;letter-spacing:0.05em;">${ws.title}</h1>
            <p style="color:${theme.accent};font-size:0.9rem;letter-spacing:0.3em;margin-bottom:20px;">${ws.subtitle}</p>
            <div style="width:50px;height:2px;background:linear-gradient(90deg,transparent,${theme.accent},transparent);margin:0 auto;"></div>
            ${ws.description ? `<p style="color:rgba(255,255,255,0.5);font-size:0.9rem;margin-top:20px;line-height:1.6;">${ws.description}</p>` : ''}
        </div>
        <div style="background:rgba(255,255,255,0.95);border-radius:12px;padding:24px;text-align:center;margin-top:auto;">
            <p style="font-size:0.85rem;color:${theme.textMuted};line-height:1.6;">${ws.leftText.replace(/\n/g, '<br>')}</p>
        </div>
        <button class="welcome-btn" onclick="openKatalog()" style="margin-top:20px;align-self:center;">Lihat Katalog</button>
    </div>`;
}

function renderWelcomeLight(ws, theme) {
    const logoHtml = ws.logoUrl
        ? `<img src="${ws.logoUrl}" style="height:60px;margin-bottom:20px;object-fit:contain;">`
        : `<div style="width:60px;height:60px;border:2px dashed ${theme.accentAlt};border-radius:8px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;opacity:0.5;"><span style="font-size:1.5rem;">📷</span></div>`;

    return `
    <div style="width:100%;height:100%;background:${theme.bgLight};padding:8%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
        <div style="position:absolute;top:5%;right:5%;width:30px;height:30px;border-top:2px solid ${theme.accentAlt};border-right:2px solid ${theme.accentAlt};opacity:0.3;"></div>
        <div style="text-align:center;margin-bottom:auto;">
            ${logoHtml}
        </div>
        <div style="text-align:center;flex:1;display:flex;flex-direction:column;justify-content:center;">
            <h1 style="font-family:'${ws.fontFamily}',serif;font-size:2.5rem;color:${theme.textDark};margin-bottom:10px;">${ws.title}</h1>
            <p style="color:${theme.accentAlt};font-size:0.9rem;letter-spacing:0.3em;margin-bottom:20px;">${ws.subtitle}</p>
            <div style="width:50px;height:2px;background:${theme.accent};margin:0 auto;"></div>
            ${ws.description ? `<p style="color:${theme.textMuted};font-size:0.9rem;margin-top:20px;line-height:1.6;">${ws.description}</p>` : ''}
        </div>
        <div style="background:${theme.bgDark};border-radius:12px;padding:24px;text-align:center;margin-top:auto;">
            <p style="font-size:0.85rem;color:rgba(255,255,255,0.8);line-height:1.6;">${ws.leftText.replace(/\n/g, '<br>')}</p>
        </div>
        <button class="welcome-btn" onclick="openKatalog()" style="margin-top:20px;align-self:center;">Lihat Katalog</button>
    </div>`;
}

function renderWelcomeSplit(ws, theme) {
    const logoHtml = ws.logoUrl
        ? `<img src="${ws.logoUrl}" style="height:50px;margin-bottom:30px;object-fit:contain;">`
        : '';

    return `
    <div style="width:100%;height:100%;display:flex;">
        <div style="width:40%;height:100%;background:${theme.bgDark};padding:6%;display:flex;flex-direction:column;justify-content:center;">
            ${logoHtml}
            <div style="width:25px;height:1px;background:${theme.accent};margin-bottom:20px;"></div>
            <p style="color:rgba(255,255,255,0.4);font-size:0.85rem;line-height:1.6;">${ws.leftText.replace(/\n/g, '<br>')}</p>
        </div>
        <div style="width:60%;height:100%;background:${theme.bgCard};padding:8%;display:flex;flex-direction:column;justify-content:center;">
            <h1 style="font-family:'${ws.fontFamily}',serif;font-size:2.2rem;color:${theme.textDark};margin-bottom:15px;">${ws.title}</h1>
            <p style="color:${theme.accentAlt};font-size:0.85rem;letter-spacing:0.2em;margin-bottom:20px;">${ws.subtitle}</p>
            <div style="width:40px;height:2px;background:${theme.textDark};margin-bottom:30px;"></div>
            ${ws.description ? `<p style="color:${theme.textMuted};font-size:0.9rem;line-height:1.8;">${ws.description}</p>` : ''}
            <button class="welcome-btn" onclick="openKatalog()" style="margin-top:40px;align-self:flex-start;">Lihat Katalog</button>
        </div>
    </div>`;
}

function renderWelcomeNumbered(ws, theme) {
    const logoHtml = ws.logoUrl
        ? `<img src="${ws.logoUrl}" style="height:40px;margin-bottom:auto;opacity:0.9;object-fit:contain;">`
        : '';

    return `
    <div style="width:100%;height:100%;background:${theme.bgDark};padding:8%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
        ${logoHtml}
        <div style="display:flex;align-items:flex-start;gap:5%;flex:1;margin-top:20px;">
            <div style="width:30%;display:flex;flex-direction:column;justify-content:center;">
                <h2 style="font-family:'${ws.fontFamily}',serif;font-size:3rem;color:#fff;font-weight:700;line-height:1;margin-bottom:15px;">01</h2>
                <div style="width:40px;height:1px;background:${theme.accent};"></div>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
                <p style="color:${theme.accent};font-size:0.8rem;letter-spacing:0.3em;margin-bottom:10px;">${ws.title}</p>
                <h1 style="font-family:'${ws.fontFamily}',serif;font-size:1.8rem;color:#fff;margin-bottom:15px;">${ws.subtitle}</h1>
                <div style="width:30px;height:1px;background:${theme.accent};margin-bottom:15px;"></div>
                ${ws.description ? `<p style="color:rgba(255,255,255,0.4);font-size:0.85rem;line-height:1.8;">${ws.description}</p>` : ''}
            </div>
        </div>
        <button class="welcome-btn" onclick="openKatalog()" style="align-self:center;margin-top:auto;">Lihat Katalog</button>
    </div>`;
}

function renderWelcomeMinimal(ws, theme) {
    const logoHtml = ws.logoUrl
        ? `<img src="${ws.logoUrl}" style="height:50px;margin-bottom:20px;object-fit:contain;">`
        : '';

    return `
    <div style="width:100%;height:100%;background:${theme.bgLight};padding:10%;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;">
        <div style="position:absolute;top:8%;right:8%;width:40px;height:40px;border-top:1px solid ${theme.textMuted};border-right:1px solid ${theme.textMuted};"></div>
        <div style="position:absolute;bottom:8%;left:8%;width:40px;height:40px;border-bottom:1px solid ${theme.textMuted};border-left:1px solid ${theme.textMuted};"></div>
        ${logoHtml}
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
            <p style="color:${theme.textMuted};font-size:0.85rem;letter-spacing:0.3em;margin-bottom:15px;text-transform:uppercase;">${ws.subtitle}</p>
            <h1 style="font-family:'${ws.fontFamily}',serif;font-size:2.5rem;color:${theme.textDark};margin-bottom:30px;font-weight:300;">${ws.title}</h1>
            <div style="width:50px;height:1px;background:${theme.accentAlt};margin-bottom:30px;"></div>
            ${ws.description ? `<p style="color:${theme.textMuted};font-size:0.9rem;line-height:1.8;font-style:italic;">${ws.description}</p>` : ''}
        </div>
        <button class="welcome-btn" onclick="openKatalog()" style="align-self:center;">Lihat Katalog</button>
    </div>`;
}

// ===== NAVIGATION =====
function openKatalog() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('appScreen').classList.add('active');
}

function backToWelcome() {
    document.getElementById('appScreen').classList.remove('active');
    document.getElementById('welcomeScreen').style.display = 'flex';
}

// ===== CATEGORIES & SUBCATEGORIES =====
async function loadCategories() {
    try {
        const res = await fetch(`${CONFIG.pocketbaseUrl}/api/collections/${CONFIG.kategoriCollection || 'kategori'}/records?sort=order`);
        if (res.ok) {
            const data = await res.json();
            categories = data.items || [];
        }
    } catch (e) {
        console.log('Categories collection not found');
    }

    // Default categories if none loaded
    if (!categories || categories.length === 0) {
        categories = [
            { id: 'desain-motif', name: 'Desain Motif', slug: 'desain-motif' },
            { id: 'printing', name: 'Printing Kain', slug: 'printing' },
            { id: 'pakaian', name: 'Pakaian Jadi', slug: 'pakaian' },
            { id: 'asesoris', name: 'Asesoris', slug: 'asesoris' }
        ];
    }

    // Render category tabs
    renderCategoryTabs();
}

function renderCategoryTabs() {
    const tabs = document.getElementById('categoryTabs');
    if (!tabs) return;

    tabs.innerHTML = categories.map(cat => `
        <button class="category-tab ${currentCategory === cat.slug ? 'active' : ''}"
                data-category="${cat.slug}"
                onclick="selectCategory('${cat.slug}')">
            ${cat.name}
        </button>
    `).join('');
}

function selectCategory(slug) {
    currentCategory = slug;
    currentSubcategory = null;
    renderCategoryTabs();
    renderSubcategories();
    filterProducts();
}

function renderSubcategories() {
    const bar = document.getElementById('subcategoryBar');
    if (!bar) return;

    const subs = getSubcategories(currentCategory);

    if (subs.length === 0) {
        bar.style.display = 'none';
        return;
    }

    bar.style.display = 'flex';
    bar.innerHTML = subs.map(sub => `
        <button class="subcategory-btn ${currentSubcategory === sub.id ? 'active' : ''}"
                onclick="selectSubcategory('${sub.id}')">
            ${sub.name}
        </button>
    `).join('');
}

async function loadProducts() {
    try {
        const res = await fetch(`${CONFIG.pocketbaseUrl}/api/collections/${CONFIG.produkCollection || 'produk'}/records?per-page=200&sort=-created`);
        if (res.ok) {
            const data = await res.json();
            products = (data.items || []).map(item => ({
                ...item,
                image: item.image ? `${CONFIG.pocketbaseUrl}/api/files/${CONFIG.produkCollection || 'produk'}/${item.id}/${item.image}` : '',
                images: (item.images || []).map(img => `${CONFIG.pocketbaseUrl}/api/files/${CONFIG.produkCollection || 'produk'}/${item.id}/${img}`)
            }));
        }
    } catch (e) {
        console.error("Error loading products:", e);
        products = [];
    }

    // If no products, use sample
    if (products.length === 0) {
        products = getSampleProducts();
    }

    filterProducts();
}

function getSampleProducts() {
    return [
        { id: "1", nama: "Motif Bunga Melati", harga: 150000, kategori: "desain-motif", subkategori: "batik", deskripsi: "Desain motif bunga melati klasik Indonesia", image: "https://picsum.photos/400/400?random=1", images: [], namatoko: "MotifKain", daerah: "Jakarta" },
        { id: "2", nama: "Motif Parang Classic", harga: 175000, kategori: "desain-motif", subkategori: "batik", deskripsi: "Motif parang klasik Yogyakarta", image: "https://picsum.photos/400/400?random=2", images: [], namatoko: "MotifKain", daerah: "Solo" },
        { id: "3", nama: "Kain Printing Premium", harga: 200000, kategori: "printing", subkategori: "sutra", deskripsi: "Kain printing kualitas premium", image: "https://picsum.photos/400/400?random=3", images: [], namatoko: "MotifKain", daerah: "Bandung" },
        { id: "4", nama: "Blouse Batik Elegant", harga: 350000, kategori: "pakaian", subkategori: "atasan", deskripsi: "Blouse batik dengan motif eksklusif", image: "https://picsum.photos/400/400?random=4", images: [], namatoko: "MotifKain", daerah: "Yogyakarta" },
        { id: "5", nama: "Gelang Batik Artisan", harga: 75000, kategori: "asesoris", subkategori: "gelang", deskripsi: "Gelang aksesoris dari kain batik", image: "https://picsum.photos/400/400?random=5", images: [], namatoko: "MotifKain", daerah: "Surabaya" },
        { id: "6", nama: "Motif Kawung Geometris", harga: 160000, kategori: "desain-motif", subkategori: "modern", deskripsi: "Desain motif kawung geometric modern", image: "https://picsum.photos/400/400?random=6", images: [], namatoko: "MotifKain", daerah: "Jakarta" },
        { id: "7", nama: "Kain Batik Tulis", harga: 450000, kategori: "printing", subkategori: "katun", deskripsi: "Kain batik tulis handmade", image: "https://picsum.photos/400/400?random=7", images: [], namatoko: "MotifKain", daerah: "Solo" },
        { id: "8", nama: "Rok Batik Femine", harga: 285000, kategori: "pakaian", subkategori: "bawahan", deskripsi: "Rok batik elegant untuk acara formal", image: "https://picsum.photos/400/400?random=8", images: [], namatoko: "MotifKain", daerah: "Yogyakarta" },
    ];
}

function getSubcategories(category) {
    // Get unique subcategories from products
    const subMap = {};
    products.forEach(p => {
        if (p.kategori === category && p.subkategori) {
            subMap[p.subkategori] = { id: p.subkategori, name: capitalize(p.subkategori) };
        }
    });
    return Object.values(subMap);
}

function selectSubcategory(id) {
    currentSubcategory = currentSubcategory === id ? null : id;
    renderSubcategories();
    filterProducts();
    updateActiveFilters();
}

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// ===== FILTERING =====
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
}

function toggleFilters() {
    const section = document.getElementById('filterSection');
    section.classList.toggle('active');

    if (section.classList.contains('active')) {
        renderFilterChips();
    }
}

function renderFilterChips() {
    const container = document.getElementById('filterChips');
    if (!container) return;

    const subs = getSubcategories(currentCategory);
    container.innerHTML = subs.map(sub => `
        <button class="filter-chip ${currentSubcategory === sub.id ? 'active' : ''}"
                onclick="selectSubcategory('${sub.id}')">
            ${sub.name}
        </button>
    `).join('');
}

function updateActiveFilters() {
    const container = document.getElementById('activeFilters');
    const tagsContainer = document.getElementById('activeFilterTags');

    if (!container || !tagsContainer) return;

    if (currentSubcategory) {
        container.style.display = 'flex';
        tagsContainer.innerHTML = `
            <span class="active-filter-tag">
                ${capitalize(currentSubcategory)}
                <button onclick="selectSubcategory('${currentSubcategory}')">&times;</button>
            </span>
        `;
    } else {
        container.style.display = 'none';
    }
}

function resetFilters() {
    currentSubcategory = null;
    document.getElementById('searchInput').value = '';
    renderSubcategories();
    filterProducts();
    updateActiveFilters();
}

function filterProducts() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    filteredProducts = products.filter(p => {
        // Category filter
        if (p.kategori !== currentCategory) return false;

        // Subcategory filter
        if (currentSubcategory && p.subkategori !== currentSubcategory) return false;

        // Search filter
        if (searchQuery) {
            const matchName = (p.nama || '').toLowerCase().includes(searchQuery);
            const matchStore = (p.namatoko || '').toLowerCase().includes(searchQuery);
            const matchDesc = (p.deskripsi || '').toLowerCase().includes(searchQuery);
            if (!matchName && !matchStore && !matchDesc) return false;
        }

        return true;
    });

    renderProductsGrid();
}

// ===== PRODUCTS GRID =====
function renderProductsGrid() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: span 2;">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
                </svg>
                <h3>Produk Tidak Ditemukan</h3>
                <p>Coba ubah filter atau kata kunci pencarian</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredProducts.map(product => {
        const images = getProductImages(product);
        const mainImage = images[0] || product.image || 'https://via.placeholder.com/400x400?text=No+Image';
        const harga = product.harga ? formatRupiah(product.harga) : 'Hubungi Kami';

        return `
            <div class="product-card" onclick="openDetail('${product.id}')">
                <div class="product-image">
                    ${images.length > 1
                        ? renderMiniCarousel(product.id, images)
                        : `<img src="${mainImage}" alt="${product.nama}">`
                    }
                    ${images.length > 1 ? `<span class="carousel-badge">${images.length} foto</span>` : ''}
                    <div class="wa-badge">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.nama || ''}</h3>
                    <p class="product-price">${harga}</p>
                    <div class="product-store">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.36 9l.6 3H5.04l.6-3h12.72M20 4H4v2h16V4zm0 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zM6 18v-4h6v4H6z"/>
                        </svg>
                        <span>${product.namatoko || 'MotifKain'}</span>
                    </div>
                    <div class="product-location">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <span>${product.daerah || '-'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Setup mini carousels
    setupMiniCarousels();
}

function renderMiniCarousel(id, images) {
    return `
        <div class="product-carousel" id="carousel-${id}">
            ${images.map((img, i) => `<img src="${img}" alt="" class="${i === 0 ? 'active' : ''}" data-index="${i}">`).join('')}
            <div class="carousel-dots">
                ${images.map((_, i) => `<div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}
            </div>
        </div>
    `;
}

function setupMiniCarousels() {
    filteredProducts.forEach(product => {
        const images = getProductImages(product);
        if (images.length <= 1) return;

        const carousel = document.getElementById(`carousel-${product.id}`);
        if (!carousel) return;

        if (!productCarousels[product.id]) {
            productCarousels[product.id] = { current: 0, images: images };
        }

        setInterval(() => {
            const state = productCarousels[product.id];
            if (!state) return;

            const imgs = carousel.querySelectorAll('img');
            const dots = carousel.querySelectorAll('.carousel-dot');

            imgs[state.current].classList.remove('active');
            dots[state.current].classList.remove('active');

            state.current = (state.current + 1) % state.images.length;

            imgs[state.current].classList.add('active');
            dots[state.current].classList.add('active');
        }, 3000);
    });
}

function getProductImages(product) {
    const images = [];
    if (product.image) images.push(product.image);
    if (product.images && Array.isArray(product.images)) images.push(...product.images.filter(Boolean));
    return images;
}

function formatRupiah(num) {
    return 'Rp ' + num.toLocaleString('id-ID');
}

// ===== PRODUCT DETAIL =====
function openDetail(productId) {
    selectedProduct = filteredProducts.find(p => p.id === productId) || products.find(p => p.id === productId);
    if (!selectedProduct) return;

    const images = getProductImages(selectedProduct);
    currentImageIndex = 0;

    // Gallery
    document.getElementById('detailImage').src = images[0] || 'https://via.placeholder.com/400x400?text=No+Image';

    // Badge
    const badge = document.getElementById('galleryBadge');
    if (images.length > 1) {
        badge.style.display = 'block';
        badge.textContent = `1/${images.length}`;
    } else {
        badge.style.display = 'none';
    }

    // Dots
    renderGalleryDots(images.length);

    // Thumbnails
    renderThumbnails(images);

    // Info
    document.getElementById('detailName').textContent = selectedProduct.nama || '';
    document.getElementById('detailPrice').textContent = selectedProduct.harga ? formatRupiah(selectedProduct.harga) : 'Hubungi Kami';
    document.getElementById('detailBadge').textContent = capitalize(selectedProduct.subkategori || selectedProduct.kategori || '');
    document.getElementById('detailDescription').textContent = selectedProduct.deskripsi || 'Tidak ada deskripsi';

    // Store
    const storeName = selectedProduct.namatoko || 'MotifKain';
    document.getElementById('storeAvatar').textContent = storeName.charAt(0).toUpperCase();
    document.getElementById('storeName').textContent = storeName;
    document.getElementById('storeLocation').innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span>${selectedProduct.daerah || '-'}</span>
    `;

    // Show modal
    document.getElementById('detailModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function renderGalleryDots(count) {
    const container = document.getElementById('galleryDots');
    if (!container) return;

    container.innerHTML = Array.from({length: count}, (_, i) =>
        `<div class="gallery-dot ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="selectGalleryImage(${i})"></div>`
    ).join('');
}

function renderThumbnails(images) {
    const container = document.getElementById('thumbnailGallery');
    if (!container) return;

    if (images.length <= 1) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    container.innerHTML = images.map((img, i) =>
        `<div class="thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="selectGalleryImage(${i})">
            <img src="${img}" alt="Thumbnail ${i + 1}">
        </div>`
    ).join('');
}

function selectGalleryImage(index) {
    if (!selectedProduct) return;

    const images = getProductImages(selectedProduct);
    currentImageIndex = index;

    document.getElementById('detailImage').src = images[index] || '';
    document.getElementById('galleryBadge').textContent = `${index + 1}/${images.length}`;

    // Update dots
    document.querySelectorAll('.gallery-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    // Update thumbnails
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

function closeDetail() {
    document.getElementById('detailModal').classList.remove('active');
    document.body.style.overflow = '';
}

function openWhatsApp() {
    if (!selectedProduct) return;

    let message = `Halo, saya tertarik dengan produk berikut dari Katalog MotifKain:\n\n`;
    message += `Nama: ${selectedProduct.nama || '-'}\n`;
    if (selectedProduct.harga) message += `Harga: ${formatRupiah(selectedProduct.harga)}\n`;
    message += `\nMohon info lebih lanjut. Terima kasih!`;

    const waNumber = CONFIG.whatsappNumber || '6281234567890';
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${waNumber}?text=${encodedMsg}`, '_blank');
}

// Close modal on backdrop
document.getElementById('detailModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeDetail();
});

// Close on Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeDetail();
});

// ===== ZOOM =====
function openZoom(src) {
    document.getElementById('zoomImage').src = src;
    document.getElementById('zoomModal').classList.add('active');
}

function closeZoom() {
    document.getElementById('zoomModal').classList.remove('active');
}
