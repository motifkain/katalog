$js = @'
/**
 * MOTIFKAIN KATALOG - MAIN APP
 */

const CONFIG = window.MOTIFKAIN_CONFIG || {
    pocketbaseUrl: 'https://katalog-production-104e.up.railway.app',
    welcomeCollection: 'welcome_settings',
    produkCollection: 'produk',
    kategoriCollection: 'kategori',
    userCollection: 'users'
};

let welcomeSettings = {};
let products = [];
let filteredProducts = [];
let categories = [];
let users = [];
let productCarousels = {};
let currentImageIndex = 0;
let currentCategory = 'desain-motif';
let currentSubcategory = null;
let selectedProduct = null;

document.addEventListener('DOMContentLoaded', async () => {
    renderWelcomeScreen();
    await loadCategories();
    await loadProducts();
    await loadUsers();
    setupSearch();
});

// ===== SIMPLE WELCOME SCREEN (NEW - 2026) =====

function renderWelcomeScreen() {
    const welcomeScreen = document.getElementById("welcomeScreen");
    if (!welcomeScreen) return;
    welcomeScreen.innerHTML = '<div class="simple-welcome"><img src="assets/images/KATALOG.png" alt="MotifKain Catalog" class="simple-welcome-image"><button class="simple-welcome-btn" onclick="openKatalog()">Lihat Produk</button></div>';
}

// ===== NAVIGATION =====

function openKatalog() {
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.add('active');
}

function backToWelcome() {
    document.getElementById('appScreen').classList.remove('active');
    document.getElementById('welcomeScreen').classList.remove('hidden');
}

// ===== CATEGORIES =====

async function loadCategories() {
    categories = [
        { id: 'desain-motif', name: 'Desain Motif', slug: 'desain-motif' },
        { id: 'printing', name: 'Printing Kain', slug: 'printing' },
        { id: 'pakaian', name: 'Pakaian Jadi', slug: 'pakaian' },
        { id: 'asesoris', name: 'Asesoris', slug: 'asesoris' }
    ];
    renderCategoryTabs();
}

function renderCategoryTabs() {
    const tabs = document.getElementById('categoryTabs');
    if (!tabs) return;
    tabs.innerHTML = categories.map(cat =>
        '<button class="category-tab ' + (currentCategory === cat.slug ? 'active' : '') + '" data-category="' + cat.slug + '" onclick="selectCategory(\'' + cat.slug + '\')">' + cat.name + '</button>'
    ).join('');
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
    bar.innerHTML = subs.map(sub =>
        '<button class="subcategory-btn ' + (currentSubcategory === sub.id ? 'active' : '') + '" onclick="selectSubcategory(\'' + sub.id + '\')">' + sub.name + '</button>'
    ).join('');
}

async function loadProducts() {
    try {
        const res = await fetch(CONFIG.pocketbaseUrl + '/api/collections/' + (CONFIG.produkCollection || 'produk') + '/records?per-page=200&sort=-created');
        if (res.ok) {
            const data = await res.json();
            products = (data.items || []).map(item => ({
                ...item,
                image: item.image ? CONFIG.pocketbaseUrl + '/api/files/' + (CONFIG.produkCollection || 'produk') + '/' + item.id + '/' + item.image : '',
                images: (item.images || []).map(img => CONFIG.pocketbaseUrl + '/api/files/' + (CONFIG.produkCollection || 'produk') + '/' + item.id + '/' + img)
            }));
        }
    } catch (e) {
        console.error("Error loading products:", e);
    }
    if (products.length === 0) {
        products = getSampleProducts();
    }
    filterProducts();
}

function getSampleProducts() {
    return [
        { id: "1", nama: "Motif Bunga Melati", harga: 150000, kategori: "desain-motif", deskripsi: "Desain motif bunga melati klasik Indonesia", image: "https://picsum.photos/400/400?random=1", images: [], namatoko: "MotifKain", daerah: "Jakarta" },
        { id: "2", nama: "Motif Parang Classic", harga: 175000, kategori: "desain-motif", deskripsi: "Motif parang klasik Yogyakarta", image: "https://picsum.photos/400/400?random=2", images: [], namatoko: "MotifKain", daerah: "Solo" },
        { id: "3", nama: "Kain Printing Premium", harga: 200000, kategori: "printing", deskripsi: "Kain printing kualitas premium", image: "https://picsum.photos/400/400?random=3", images: [], namatoko: "MotifKain", daerah: "Bandung" },
        { id: "4", nama: "Blouse Batik Elegant", harga: 350000, kategori: "pakaian", deskripsi: "Blouse batik dengan motif eksklusif", image: "https://picsum.photos/400/400?random=4", images: [], namatoko: "MotifKain", daerah: "Yogyakarta" },
    ];
}

function getSubcategories(category) {
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
}

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// ===== SEARCH =====

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
}

function filterProducts() {
    const searchQuery = (document.getElementById('searchInput')?.value || '').toLowerCase();
    filteredProducts = products.filter(p => {
        if (p.kategori !== currentCategory) return false;
        if (currentSubcategory && p.subkategori !== currentSubcategory) return false;
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
        grid.innerHTML = '<div class="empty-state" style="grid-column: span 2;"><h3>Produk Tidak Ditemukan</h3></div>';
        return;
    }

    grid.innerHTML = filteredProducts.map(product => {
        const images = getProductImages(product);
        const mainImage = images[0] || product.image || 'https://via.placeholder.com/400x400?text=No+Image';
        const harga = product.harga ? formatRupiah(product.harga) : 'Hubungi Kami';

        return '<div class="product-card" onclick="openDetail(\'' + product.id + '\')">' +
            '<div class="product-image"><img src="' + mainImage + '" alt="' + (product.nama || '') + '"></div>' +
            '<div class="product-info">' +
            '<h3 class="product-name">' + (product.nama || '') + '</h3>' +
            '<p class="product-price">' + harga + '</p>' +
            '<div class="product-store"><span>' + (product.namatoko || 'MotifKain') + '</span></div>' +
            '<div class="product-location"><span>' + (product.daerah || '-') + '</span></div>' +
            '</div></div>';
    }).join('');
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

let productImages = [];

function openDetail(productId) {
    selectedProduct = filteredProducts.find(p => p.id === productId) || products.find(p => p.id === productId);
    if (!selectedProduct) return;

    const images = getProductImages(selectedProduct);
    currentImageIndex = 0;
    productImages = images;

    document.getElementById('detailImage').src = images[0] || 'https://via.placeholder.com/400x400?text=No+Image';
    document.getElementById('detailName').textContent = selectedProduct.nama || '';
    document.getElementById('detailPrice').textContent = selectedProduct.harga ? formatRupiah(selectedProduct.harga) : 'Hubungi Kami';
    document.getElementById('detailBadge').textContent = capitalize(selectedProduct.subkategori || selectedProduct.kategori || '');
    document.getElementById('detailDescription').textContent = selectedProduct.deskripsi || 'Tidak ada deskripsi';

    document.getElementById('detailModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDetail() {
    document.getElementById('detailModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== WHATSAPP =====

async function loadUsers() {
    try {
        const res = await fetch(CONFIG.pocketbaseUrl + '/api/collections/' + CONFIG.userCollection + '/records?sort=+role');
        if (res.ok) {
            const data = await res.json();
            users = data.items || [];
        }
    } catch (e) {
        users = [];
    }
}

function toggleWaMenu() {
    const dropdown = document.getElementById('waDropdown');
    const list = document.getElementById('waDropdownList');
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        return;
    }

    let html = '';
    users.forEach(u => {
        html += '<button class="wa-option" onclick="openWaChat(\'' + (u.whatsapp || '') + '\', \'' + (u.nama || '') + '\')">' +
            '<span>' + (u.nama || '-') + '</span></button>';
    });

    if (users.length === 0) {
        html = '<div class="wa-empty">Belum ada kontak WA</div>';
    }

    list.innerHTML = html;
    dropdown.classList.add('show');
}

function openWaChat(whatsapp, nama) {
    if (!whatsapp) {
        alert('Nomor WhatsApp belum diset');
        return;
    }
    let phone = whatsapp.replace(/[^0-9]/g, '');
    if (!phone.startsWith('62')) {
        phone = '62' + phone.substring(1);
    }
    const message = 'Halo, saya ingin info tentang ' + (selectedProduct?.nama || 'produk MotifKain');
    const waUrl = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
    window.open(waUrl, '_blank');
    document.getElementById('waDropdown').classList.remove('show');
}

document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('waDropdown');
    const btn = document.querySelector('.wa-button');
    if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});
'@

$js | Out-File -FilePath 'c:\motifkain\Katalog desain\assets\js\app.js' -Encoding UTF8
Write-Host "app.js rewritten successfully"
