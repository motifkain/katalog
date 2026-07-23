/**
 * MOTIFKAIN KATALOG
 * Earth Tone Theme
 */

const CONFIG = window.MOTIFKAIN_CONFIG || {
    pocketbaseUrl: 'https://katalog-production-104e.up.railway.app',
    produkCollection: 'produk'
};

// Earth Tone Colors
const COLORS = {
    primary: '#8B5A2B',
    primaryLight: '#A67C52',
    accent: '#CD853F',
    background: '#FAF0E6',
    textPrimary: '#3E2723',
    textSecondary: '#8B7355',
    divider: '#D4C4B0'
};

let products = [];
let filteredProducts = [];
let currentLayanan = null;
let selectedProduct = null;
let currentImageIndex = 0;
let pageController = null;

const layananList = ['Semua', 'Jasa Desain', 'Kain Printing', 'Pakaian Jadi', 'Asesoris'];

document.addEventListener('DOMContentLoaded', async () => {
    renderWelcomeScreen();
});

function renderWelcomeScreen() {
    const ws = document.getElementById("welcomeScreen");
    if (ws) {
        ws.innerHTML = `
            <div class="simple-welcome">
                <img src="assets/images/KATALOG.png" alt="MotifKain" class="simple-welcome-image" onclick="openKatalog()">
            </div>
            <button class="simple-welcome-btn" onclick="openKatalog()">Lihat Produk</button>
        `;
    }
}

function openKatalog() {
    const ws = document.getElementById("welcomeScreen");
    const app = document.getElementById("appScreen");
    if (ws) ws.style.display = 'none';
    if (app) {
        app.style.display = 'flex';
        loadKatalog();
    }
}

async function loadKatalog() {
    renderKatalogHeader();
    await loadProducts();
    renderProducts();
}

function renderKatalogHeader() {
    const app = document.getElementById("appScreen");
    if (!app) return;

    const layananHtml = layananList.map(l => {
        const active = (l === 'Semua' && !currentLayanan) || l === currentLayanan ? 'active' : '';
        return `<button class="filter-chip ${active}" onclick="toggleLayanan('${l}')">${l}</button>`;
    }).join('');

    app.innerHTML = `
        <header class="katalog-header">
            <div class="katalog-top">
                <button class="back-btn" onclick="backToWelcome()">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                </button>
                <h1>MotifKain</h1>
            </div>
            <div class="filter-section">
                <div class="filter-chips">${layananHtml}</div>
            </div>
        </header>
        <div class="products-container" id="productsContainer">
            <div class="products-grid" id="productsGrid"></div>
            <div class="loading" id="loading"><div class="spinner"></div></div>
        </div>
        <div class="product-modal" id="productModal"></div>
    `;
}

function toggleLayanan(l) {
    currentLayanan = l === 'Semua' ? null : l;
    doFilter();
}

function doFilter() {
    filteredProducts = products.filter(p => {
        const matchL = !currentLayanan || p.layanan === currentLayanan;
        return matchL;
    });
    renderProductCards();
}

async function loadProducts() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';
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
    } catch (e) { console.error(e); }
    if (!products.length) products = getSamples();
    doFilter();
    if (loading) loading.style.display = 'none';
}

function getSamples() {
    return [
        { id: "1", nama: "Motif Bunga Melati", harga: 150000, layanan: "Jasa Desain", namatoko: "MotifKain", image: "https://picsum.photos/800/800?random=1", deskripsi: "Desain motif bunga melati untuk kain batik" },
        { id: "2", nama: "Motif Parang Classic", harga: 175000, layanan: "Jasa Desain", namatoko: "MotifKain", image: "https://picsum.photos/800/800?random=2", deskripsi: "Motif parang klasik pilihan" },
        { id: "3", nama: "Kain Printing Premium", harga: 200000, layanan: "Kain Printing", namatoko: "MotifKain", image: "https://picsum.photos/800/800?random=3", deskripsi: "Kain printing berkualitas premium" },
        { id: "4", nama: "Blouse Batik Elegant", harga: 350000, layanan: "Pakaian Jadi", namatoko: "MotifKain", image: "https://picsum.photos/800/800?random=4", deskripsi: "Blouse batik elegan untuk berbagai acara" },
        { id: "5", nama: "Canting Batik", harga: 75000, layanan: "Asesoris", namatoko: "MotifKain", image: "https://picsum.photos/800/800?random=5", deskripsi: "Canting batik berkualitas" },
        { id: "6", nama: "Lilin Batik", harga: 50000, layanan: "Asesoris", namatoko: "MotifKain", image: "https://picsum.photos/800/800?random=6", deskripsi: "Lilin batik untuk malam batik" },
    ];
}

function formatRupiah(n) {
    if (n >= 1000000) return 'Rp ' + (n/1000000).toFixed(1) + 'Jt';
    if (n >= 1000) return 'Rp ' + Math.round(n/1000) + 'Rb';
    return 'Rp ' + n.toLocaleString('id-ID');
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    if (!filteredProducts.length) {
        grid.innerHTML = '<div class="empty-state"><h3>Tidak ada produk</h3><p>Coba pilih layanan lain</p></div>';
        return;
    }
    grid.innerHTML = filteredProducts.map(p => `
        <div class="product-card" onclick="showDetail('${p.id}')">
            <div class="card-img">
                <img src="${p.image || 'https://via.placeholder.com/400'}" alt="${p.nama}">
                ${p.images?.length > 1 ? `<span class="img-count">${p.images.length + 1}</span>` : ''}
            </div>
            <div class="card-info">
                <h4>${p.nama || ''}</h4>
                <p class="price">${p.harga ? formatRupiah(p.harga) : ''}</p>
                <p class="layanan">${p.layanan || ''}</p>
            </div>
        </div>
    `).join('');
}

function renderProductCards() { renderProducts(); }

function showDetail(id) {
    selectedProduct = products.find(p => p.id === id);
    if (!selectedProduct) return;
    currentImageIndex = 0;
    const imgs = [selectedProduct.image, ...(selectedProduct.images || [])].filter(Boolean);
    const modal = document.getElementById('productModal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="modal-bg" onclick="closeDetail()"></div>
        <div class="modal-sheet">
            <div class="modal-handle"></div>
            <button class="modal-close" onclick="closeDetail()">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>

            <div class="detail-gallery" id="detailGallery">
                <div class="gallery-container" id="galleryContainer">
                    ${imgs.map((img, i) => `<img src="${img}" alt="" class="gallery-img" data-index="${i}" style="display:${i === 0 ? 'block' : 'none'}">`).join('')}
                </div>
                ${imgs.length > 1 ? `
                    <div class="gallery-nav">
                        <button class="gallery-btn prev" onclick="prevImg()">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                        </button>
                        <div class="gallery-dots" id="galleryDots">
                            ${imgs.map((_, i) => `<span class="gdot ${i === 0 ? 'active' : ''}" onclick="goToImage(${i})"></span>`).join('')}
                        </div>
                        <button class="gallery-btn next" onclick="nextImg()">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                        </button>
                    </div>
                    <div class="gallery-counter">${currentImageIndex + 1} / ${imgs.length}</div>
                ` : ''}
            </div>

            <div class="modal-body">
                <h2>${selectedProduct.nama || ''}</h2>
                ${selectedProduct.harga ? `<p class="harga">${formatRupiah(selectedProduct.harga)}</p>` : ''}
                ${selectedProduct.layanan ? `<span class="badge">${selectedProduct.layanan}</span>` : ''}

                <div class="store-card">
                    <div class="store-icon">🏪</div>
                    <div>
                        <p class="store-name">${selectedProduct.namatoko || 'MotifKain'}</p>
                        <p class="store-loc">Chat WA</p>
                    </div>
                </div>

                <div class="desc">
                    <h3>Deskripsi</h3>
                    <p>${selectedProduct.deskripsi || '-'}</p>
                </div>

                <button class="wa-btn" onclick="openWa()">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Hubungi via WhatsApp
                </button>
            </div>
        </div>
    `;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Init touch swipe
    initTouchSwipe();
}

function initTouchSwipe() {
    const container = document.getElementById('galleryContainer');
    if (!container) return;

    let startX = 0;
    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const dx = endX - startX;
        if (Math.abs(dx) > 50) {
            if (dx < 0) nextImg();
            else prevImg();
        }
    }, { passive: true });
}

function prevImg() {
    const imgs = document.querySelectorAll('.gallery-img');
    if (imgs.length <= 1) return;
    imgs[currentImageIndex].style.display = 'none';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.remove('active');
    currentImageIndex = (currentImageIndex - 1 + imgs.length) % imgs.length;
    imgs[currentImageIndex].style.display = 'block';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.add('active');
    updateCounter();
}

function nextImg() {
    const imgs = document.querySelectorAll('.gallery-img');
    if (imgs.length <= 1) return;
    imgs[currentImageIndex].style.display = 'none';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.remove('active');
    currentImageIndex = (currentImageIndex + 1) % imgs.length;
    imgs[currentImageIndex].style.display = 'block';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.add('active');
    updateCounter();
}

function goToImage(i) {
    const imgs = document.querySelectorAll('.gallery-img');
    if (!imgs.length) return;
    imgs[currentImageIndex].style.display = 'none';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.remove('active');
    currentImageIndex = i;
    imgs[currentImageIndex].style.display = 'block';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.add('active');
    updateCounter();
}

function updateCounter() {
    const counter = document.querySelector('.gallery-counter');
    const imgs = document.querySelectorAll('.gallery-img');
    if (counter) counter.textContent = `${currentImageIndex + 1} / ${imgs.length}`;
}

function closeDetail() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('show');
    document.body.style.overflow = '';
}

function openWa() {
    const wa = selectedProduct?.nowa || selectedProduct?.whatsapp || '';
    if (!wa) { alert('Nomor WhatsApp belum tersedia'); return; }
    let p = wa.replace(/\D/g, '');
    if (p.startsWith('0')) p = '62' + p.slice(1);
    const msg = encodeURIComponent(`Assalamualaikum, saya tertarik dengan produk *${selectedProduct?.nama || 'ini}* dari MotifKain`);
    window.open('https://wa.me/' + p + '?text=' + msg, '_blank');
}
