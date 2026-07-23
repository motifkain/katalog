/**
 * MOTIFKAIN KATALOG - ISWARA STYLE
 */

const CONFIG = window.MOTIFKAIN_CONFIG || {
    pocketbaseUrl: 'https://katalog-production-104e.up.railway.app',
    produkCollection: 'produk',
    kategoriCollection: 'kategori',
    userCollection: 'users'
};

// Colors from Iswara theme
const COLORS = {
    primary: '#1B5E20',
    primaryLight: '#4CAF50',
    primaryDark: '#0D3D12',
    accent: '#8BC34A',
    background: '#F5F5F5',
    card: '#FFFFFF',
    textPrimary: '#212121',
    textSecondary: '#757575',
    textLight: '#BDBDBD',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    divider: '#E0E0E0'
};

let products = [];
let filteredProducts = [];

// ===== WELCOME SCREEN =====

function renderWelcomeScreen() {
    const welcomeScreen = document.getElementById("welcomeScreen");
    if (!welcomeScreen) return;
    welcomeScreen.innerHTML = '<div class="simple-welcome"><img src="assets/images/KATALOG.png" alt="MotifKain Catalog" class="simple-welcome-image"><button class="simple-welcome-btn" onclick="openKatalog()">Lihat Produk</button></div>';
}

function openKatalog() {
    const welcomeScreen = document.getElementById("welcomeScreen");
    const appScreen = document.getElementById("appScreen");
    if (welcomeScreen) welcomeScreen.classList.add("hidden");
    if (appScreen) appScreen.classList.add("active");
}
let currentCategory = null;
let currentDaerah = null;
let showFilters = false;
let selectedProduct = null;

// For MotifKain
const motifkainKategori = ['Semua', 'Desain Motif', 'Printing Kain', 'Pakaian Jadi', 'Asesoris'];
const motifkainDaerah = ['Semua', 'Jakarta', 'Solo', 'Bandung', 'Yogyakarta', 'Surabaya'];

document.addEventListener('DOMContentLoaded', async () => {
    renderWelcomeScreen();
    await loadProducts();
});

function renderHeader() {
    const appScreen = document.getElementById('appScreen');
    appScreen.innerHTML = `
        <header class="katalog-header">
            <div class="katalog-header-top">
                <span class="katalog-title">Katalog Produk</span>
                <button class="filter-toggle-btn" onclick="toggleFilters()">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>
                </button>
            </div>
            <div class="search-bar">
                <svg viewBox="0 0 24 24" fill="white" class="search-icon"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9 6.5 6.5 0 1 0 9 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9s2.01-5 5-5 5 3.01 5 5-2.01 5-5 5z"/></svg>
                <input type="text" id="searchInput" placeholder="Cari produk atau toko..." oninput="filterProducts()">
                <button class="search-clear" id="searchClear" onclick="clearSearch()" style="display:none;">
                    <svg viewBox="0 0 24 24" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
            </div>
        </header>
        <div class="filter-section" id="filterSection" style="display:none;">
            <div class="filter-group">
                <span class="filter-label">Kategori</span>
                <div class="filter-chips" id="kategoriChips"></div>
            </div>
            <div class="filter-group">
                <span class="filter-label">Daerah</span>
                <div class="filter-chips" id="daerahChips"></div>
            </div>
        </div>
        <div class="active-filters" id="activeFilters" style="display:none;"></div>
        <div class="products-container" id="productsContainer">
            <div class="products-grid" id="productsGrid"></div>
            <div class="loading" id="loadingIndicator"><div class="spinner"></div></div>
        </div>
        <div class="product-detail-modal" id="productModal"></div>
        <div class="wa-form-modal" id="waFormModal"></div>
    `;
    renderFilterChips();
}

function toggleFilters() {
    showFilters = !showFilters;
    const filterSection = document.getElementById('filterSection');
    filterSection.style.display = showFilters ? 'block' : 'none';
}

function renderFilterChips() {
    const kategoriChips = document.getElementById('kategoriChips');
    const daerahChips = document.getElementById('daerahChips');
    if (!kategoriChips || !daerahChips) return;

    kategoriChips.innerHTML = motifkainKategori.map(k => {
        const isActive = (currentCategory === k) || (k === 'Semua' && !currentCategory);
        return '<button class="filter-chip ' + (isActive ? 'active' : '') + '" onclick="selectKategori(\'' + k + '\')">' + k + '</button>';
    }).join('');

    daerahChips.innerHTML = motifkainDaerah.map(d => {
        const isActive = (currentDaerah === d) || (d === 'Semua' && !currentDaerah);
        return '<button class="filter-chip filter-chip-daerah ' + (isActive ? 'active' : '') + '" onclick="selectDaerah(\'' + d + '\')">' + d + '</button>';
    }).join('');
}

function selectKategori(kategori) {
    currentCategory = kategori === 'Semua' ? null : kategori;
    renderFilterChips();
    filterProducts();
    updateActiveFilters();
}

function selectDaerah(daerah) {
    currentDaerah = daerah === 'Semua' ? null : daerah;
    renderFilterChips();
    filterProducts();
    updateActiveFilters();
}

function updateActiveFilters() {
    const container = document.getElementById('activeFilters');
    if (!container) return;
    if (!currentCategory && !currentDaerah) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'flex';
    let html = '<span class="filter-icon">🔍 Filter aktif:</span>';
    if (currentCategory) {
        html += '<span class="filter-tag" onclick="selectKategori(\'' + currentCategory + '\')">' + currentCategory + ' ✕</span>';
    }
    if (currentDaerah) {
        html += '<span class="filter-tag filter-tag-daerah" onclick="selectDaerah(\'' + currentDaerah + '\')">' + currentDaerah + ' ✕</span>';
    }
    html += '<button class="reset-btn" onclick="resetFilters()">Reset</button>';
    container.innerHTML = html;
}

function resetFilters() {
    currentCategory = null;
    currentDaerah = null;
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    renderFilterChips();
    filterProducts();
    updateActiveFilters();
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    const searchClear = document.getElementById('searchClear');
    if (searchClear) searchClear.style.display = 'none';
    filterProducts();
}

async function loadProducts() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
    try {
        const res = await fetch(CONFIG.pocketbaseUrl + '/api/collections/' + CONFIG.produkCollection + '/records?per-page=200&sort=-created');
        if (res.ok) {
            const data = await res.json();
            products = data.items.map(item => ({
                ...item,
                image: item.image ? CONFIG.pocketbaseUrl + '/api/files/' + CONFIG.produkCollection + '/' + item.id + '/' + item.image : '',
                images: (item.images || []).map(img => CONFIG.pocketbaseUrl + '/api/files/' + CONFIG.produkCollection + '/' + item.id + '/' + img)
            }));
        }
    } catch (e) {
        console.error('Error loading products:', e);
    }
    if (products.length === 0) {
        products = getSampleProducts();
    }
    filterProducts();
    if (loadingIndicator) loadingIndicator.style.display = 'none';
}

function getSampleProducts() {
    return [
        { id: "1", nama: "Motif Bunga Melati", harga: 150000, kategori: "Desain Motif", daerah: "Jakarta", namatoko: "MotifKain", image: "https://picsum.photos/400/400?random=1", deskripsi: "Desain motif bunga melati klasik Indonesia" },
        { id: "2", nama: "Motif Parang Classic", harga: 175000, kategori: "Desain Motif", daerah: "Solo", namatoko: "MotifKain", image: "https://picsum.photos/400/400?random=2", deskripsi: "Motif parang klasik Yogyakarta" },
        { id: "3", nama: "Kain Printing Premium", harga: 200000, kategori: "Printing Kain", daerah: "Bandung", namatoko: "MotifKain", image: "https://picsum.photos/400/400?random=3", deskripsi: "Kain printing kualitas premium" },
        { id: "4", nama: "Blouse Batik Elegant", harga: 350000, kategori: "Pakaian Jadi", daerah: "Yogyakarta", namatoko: "MotifKain", image: "https://picsum.photos/400/400?random=4", deskripsi: "Blouse batik dengan motif eksklusif" },
        { id: "5", nama: "Gelang Batik Artisan", harga: 75000, kategori: "Asesoris", daerah: "Surabaya", namatoko: "MotifKain", image: "https://picsum.photos/400/400?random=5", deskripsi: "Gelang aksesoris dari kain batik" },
        { id: "6", nama: "Motif Kawung Geometris", harga: 160000, kategori: "Desain Motif", daerah: "Jakarta", namatoko: "MotifKain", image: "https://picsum.photos/400/400?random=6", deskripsi: "Desain motif kawung geometric modern" },
    ];
}

function filterProducts() {
    const searchQuery = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const searchClear = document.getElementById('searchClear');
    if (searchClear) searchClear.style.display = searchQuery ? 'block' : 'none';

    filteredProducts = products.filter(p => {
        const matchSearch = !searchQuery ||
            (p.nama || '').toLowerCase().includes(searchQuery) ||
            (p.namatoko || '').toLowerCase().includes(searchQuery) ||
            (p.deskripsi || '').toLowerCase().includes(searchQuery);
        const matchKategori = !currentCategory || p.kategori === currentCategory;
        const matchDaerah = !currentDaerah || p.daerah === currentDaerah;
        return matchSearch && matchKategori && matchDaerah;
    });
    renderProducts();
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="#BDBDBD"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.57-4.23 6.5 6.5 0 1 0-9.57 4.23l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9s2.01-5 5-5 5 3.01 5 5-2.01 5-5 5z"/></svg>
                <h3>Produk Tidak Ditemukan</h3>
                <p>Coba ubah kata kunci atau filter Anda</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredProducts.map(p => `
        <div class="product-card" onclick="showProductDetail('${p.id}')">
            <div class="product-card-image">
                <img src="${p.image || 'https://via.placeholder.com/400x400?text=No+Image'}" alt="${p.nama || ''}" loading="lazy">
            </div>
            <div class="product-card-info">
                <h4 class="product-card-name">${p.nama || ''}</h4>
                <p class="product-card-price">${p.harga ? formatRupiah(p.harga) : ''}</p>
                <div class="product-card-store">
                    <span>🏪 ${p.namatoko || 'MotifKain'}</span>
                </div>
                <div class="product-card-location">
                    <span>📍 ${p.daerah || '-'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function formatRupiah(num) {
    if (num >= 1000000) {
        return 'Rp ' + (num / 1000000).toFixed(1) + 'Jt';
    } else if (num >= 1000) {
        return 'Rp ' + Math.round(num / 1000) + 'Rb';
    }
    return 'Rp ' + num.toLocaleString('id-ID');
}

function showProductDetail(productId) {
    selectedProduct = products.find(p => p.id === productId);
    if (!selectedProduct) return;

    const images = [selectedProduct.image, ...(selectedProduct.images || [])].filter(Boolean);
    const modal = document.getElementById('productModal');
    if (!modal) return;

    let galleryHtml = '';
    if (images.length > 0) {
        galleryHtml = '<img src="' + images[0] + '" alt="' + (selectedProduct.nama || '') + '" class="detail-image">';
    }

    let badgeHtml = '';
    if (selectedProduct.kategori) {
        badgeHtml = '<span class="detail-badge">' + selectedProduct.kategori + '</span>';
    }

    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeProductDetail()"></div>
        <div class="modal-content">
            <div class="modal-handle"></div>
            <button class="modal-close" onclick="closeProductDetail()">
                <svg viewBox="0 0 24 24" fill="#757575"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
            <div class="detail-gallery">${galleryHtml}</div>
            <div class="detail-body">
                <h2 class="detail-name">${selectedProduct.nama || ''}</h2>
                ${selectedProduct.harga ? '<p class="detail-price">' + formatRupiah(selectedProduct.harga) + '</p>' : ''}
                ${badgeHtml}
                <div class="store-card" onclick="showWaForm()">
                    <div class="store-icon">🏪</div>
                    <div class="store-info">
                        <p class="store-name">${selectedProduct.namatoko || 'MotifKain'}</p>
                        <p class="store-location">📍 ${selectedProduct.daerah || '-'} • 💬 Chat WA</p>
                    </div>
                    <svg class="store-arrow" viewBox="0 0 24 24" fill="#4CAF50"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                </div>
                <div class="detail-section">
                    <h3>Deskripsi</h3>
                    <p>${selectedProduct.deskripsi || 'Tidak ada deskripsi'}</p>
                </div>
                <button class="wa-button-full" onclick="showWaForm()">
                    💬 Hubungi via WhatsApp
                </button>
            </div>
        </div>
    `;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductDetail() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

function showWaForm() {
    const modal = document.getElementById('waFormModal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeWaForm()"></div>
        <div class="wa-form-content">
            <div class="wa-form-header">
                <div class="wa-form-icon">💬</div>
                <h3>Hubungi Penjual</h3>
                <p>Isi data di bawah untuk melanjutkan via WhatsApp</p>
            </div>
            <form class="wa-form" onsubmit="submitWaForm(event)">
                <div class="form-group">
                    <label>Nama Lengkap</label>
                    <input type="text" id="waNama" placeholder="Masukkan nama Anda" required>
                </div>
                <div class="form-group">
                    <label>No. HP / WhatsApp</label>
                    <input type="tel" id="waHp" placeholder="08123456789">
                    <small>Format: 08123456789</small>
                </div>
                <div class="info-box">
                    <span>ℹ️</span> No. HP opsional, bisa langsung diisi nanti via WA
                </div>
                <button type="submit" class="btn-wa-continue">LANJUT KE WHATSAPP</button>
                <button type="button" class="btn-skip" onclick="openWaDirect()">LEWATI - Chat Langsung</button>
            </form>
        </div>
    `;
    modal.classList.add('active');
}

function closeWaForm() {
    const modal = document.getElementById('waFormModal');
    if (modal) modal.classList.remove('active');
}

function submitWaForm(e) {
    e.preventDefault();
    const nama = document.getElementById('waNama')?.value || '';
    closeWaForm();
    closeProductDetail();
    openWa(nama);
}

function openWaDirect() {
    closeWaForm();
    closeProductDetail();
    openWa(null);
}

function openWa(namaPengirim) {
    const noWa = selectedProduct?.nowa || selectedProduct?.noWa || selectedProduct?.whatsapp || '';
    if (!noWa) {
        alert('Nomor WhatsApp tidak tersedia');
        return;
    }

    let phone = noWa.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
    }

    let message = namaPengirim
        ? 'Assalamualaikum warahmatullahi wabarakatuh\n\nIbu ' + (selectedProduct?.namatoko || 'Penjual') + ',\n\nSaya ' + namaPengirim + ' tertarik dengan produk ini:\n*' + (selectedProduct?.nama || 'produk') + '*\n\nMohon informasinya ya Bu.\n\nTerima kasih.'
        : 'Halo, saya tertarik dengan produk *' + (selectedProduct?.nama || 'ini') + '* dari ' + (selectedProduct?.namatoko || 'toko ini') + ',\nMohon informasinya ya.';

    const waUrl = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
    window.open(waUrl, '_blank');
}
