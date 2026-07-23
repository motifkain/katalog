/**
 * MOTIFKAIN KATALOG
 * Earth Tone Theme
 * Struktur: Produk → Warna → Gambar
 */

const CONFIG = window.MOTIFKAIN_CONFIG || {
    pocketbaseUrl: 'https://katalog-production-104e.up.railway.app',
    produkCollection: 'produk',
    portfolioCollection: 'portfolio'
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
let portfolio = [];
let filteredItems = [];
let currentFilter = null;
let selectedItem = null;
let selectedWarnaIndex = 0;
let currentImageIndex = 0;

const filterList = ['Semua', 'Jasa Desain', 'Kain Printing', 'Pakaian Jadi', 'Asesoris', 'Portfolio'];

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
    await Promise.all([loadProducts(), loadPortfolio()]);
    renderItems();
}

function renderKatalogHeader() {
    const app = document.getElementById("appScreen");
    if (!app) return;

    const filterHtml = filterList.map(f => {
        const active = (f === 'Semua' && !currentFilter) || f === currentFilter ? 'active' : '';
        return `<button class="filter-chip ${active}" onclick="toggleFilter('${f}')">${f}</button>`;
    }).join('');

    app.innerHTML = `
        <header class="katalog-header">
            <div class="katalog-top">
                <button class="back-btn" onclick="backToWelcome()">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                </button>
                <img src="assets/images/logo-motifkain.svg" alt="MotifKain" class="header-logo">
            </div>
            <div class="filter-section">
                <div class="filter-chips">${filterHtml}</div>
            </div>
        </header>
        <div class="products-container" id="productsContainer">
            <div class="products-grid" id="productsGrid"></div>
            <div class="loading" id="loading"><div class="spinner"></div></div>
        </div>
        <div class="detail-modal" id="detailModal"></div>
    `;
}

function toggleFilter(f) {
    currentFilter = f === 'Semua' ? null : f;
    renderKatalogHeader();
    renderItems();
}

async function loadProducts() {
    try {
        // Load produk with expanded warna
        const res = await fetch(
            CONFIG.pocketbaseUrl + '/api/collections/' + CONFIG.produkCollection +
            '/records?per-page=500&sort=-created&expand=warna'
        );
        if (res.ok) {
            const data = await res.json();
            products = data.items.map(item => {
                const p = { ...item, type: 'produk' };

                // Process warna list with gambar
                if (p.expand && p.expand.warna) {
                    const warnaList = Array.isArray(p.expand.warna)
                        ? p.expand.warna
                        : [p.expand.warna];

                    p.warnaList = warnaList.map(warna => {
                        const w = { ...warna };
                        // Get image URL
                        if (w.gambar) {
                            w.image = CONFIG.pocketbaseUrl + '/api/files/warna/' + w.id + '/' + w.gambar;
                        }
                        // Images array (for additional images from 'images' field)
                        w.images = (w.images || []).map(img =>
                            CONFIG.pocketbaseUrl + '/api/files/warna/' + w.id + '/' + img
                        );
                        return w;
                    });
                } else {
                    p.warnaList = [];
                }

                // Fallback: get first image from first warna
                if (p.warnaList && p.warnaList.length > 0) {
                    for (const w of p.warnaList) {
                        if (w.image) {
                            p.image = w.image;
                            break;
                        }
                    }
                }

                return p;
            });
        }
    } catch (e) { console.error(e); }
    if (!products.length) products = getSampleProducts();
}

async function loadPortfolio() {
    try {
        const res = await fetch(CONFIG.pocketbaseUrl + '/api/collections/' + CONFIG.portfolioCollection + '/records?per-page=500&sort=-created');
        if (res.ok) {
            const data = await res.json();
            portfolio = data.items.map(item => ({
                ...item,
                type: 'portfolio',
                image: item.image ? CONFIG.pocketbaseUrl + '/api/files/' + CONFIG.portfolioCollection + '/' + item.id + '/' + item.image : '',
                images: (item.images || []).map(img => CONFIG.pocketbaseUrl + '/api/files/' + CONFIG.portfolioCollection + '/' + item.id + '/' + img)
            }));
        }
    } catch (e) { console.error(e); }
    if (!portfolio.length) portfolio = getSamplePortfolio();
}

function getSampleProducts() {
    return [
        {
            id: "p1", nama: "Motif Bunga Melati", harga: 150000, layanan: "Jasa Desain", type: "produk",
            image: "https://picsum.photos/400/400?random=1",
            deskripsi: "Desain motif bunga melati untuk kain batik",
            warnaList: [
                { id: "w1", nama: "Merah Maroon", image: "https://picsum.photos/400/400?random=1", images: ["https://picsum.photos/400/400?random=2"], deskripsi: "Detail motif bunga" },
                { id: "w2", nama: "Biru Navy", image: "https://picsum.photos/400/400?random=3", images: ["https://picsum.photos/400/400?random=4"], deskripsi: "Motif garis" }
            ]
        },
        {
            id: "p2", nama: "Motif Parang Classic", harga: 175000, layanan: "Jasa Desain", type: "produk",
            image: "https://picsum.photos/400/400?random=5",
            deskripsi: "Motif parang klasik pilihan",
            warnaList: [
                { id: "w3", nama: "Hitam Gold", image: "https://picsum.photos/400/400?random=5", images: ["https://picsum.photos/400/400?random=6"], deskripsi: "Parang emas" }
            ]
        },
        { id: "p3", nama: "Kain Printing Premium", harga: 200000, layanan: "Kain Printing", type: "produk", image: "https://picsum.photos/400/400?random=7", deskripsi: "Kain printing berkualitas premium", warnaList: [] },
        { id: "p4", nama: "Blouse Batik Elegant", harga: 350000, layanan: "Pakaian Jadi", type: "produk", image: "https://picsum.photos/400/400?random=8", deskripsi: "Blouse batik elegan", warnaList: [] },
    ];
}

function getSamplePortfolio() {
    return [
        { id: "pf1", judul: "Koleksi Batik Nusantara", kategori: "Batik", type: "portfolio", image: "https://picsum.photos/400/400?random=10", deskripsi: "Koleksi batik dari berbagai daerah", images: [] },
        { id: "pf2", judul: "Tenun Ikat Lombok", kategori: "Tenun", type: "portfolio", image: "https://picsum.photos/400/400?random=11", deskripsi: "Tenun ikat dari Lombok", images: [] },
    ];
}

function formatRupiah(n) {
    if (n >= 1000000) return 'Rp ' + (n/1000000).toFixed(1) + 'Jt';
    if (n >= 1000) return 'Rp ' + Math.round(n/1000) + 'Rb';
    return 'Rp ' + (n || 0).toLocaleString('id-ID');
}

function renderItems() {
    const grid = document.getElementById('productsGrid');
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
    if (!grid) return;

    const allItems = [...products, ...portfolio];

    if (currentFilter === 'Portfolio') {
        filteredItems = portfolio;
    } else if (currentFilter) {
        filteredItems = products.filter(p => p.layanan === currentFilter);
    } else {
        filteredItems = allItems;
    }

    if (filteredItems.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h3>Tidak ada item</h3><p>Coba pilih filter lain</p></div>';
        return;
    }

    grid.innerHTML = filteredItems.map(item => {
        const isPortfolio = item.type === 'portfolio';
        const name = isPortfolio ? (item.judul || '') : (item.nama || '');
        const imgCount = item.warnaList?.length || item.images?.length || 0;

        return `
            <div class="product-card" onclick="showDetail('${item.id}')">
                <div class="card-img">
                    <img src="${item.image || 'https://via.placeholder.com/400'}" alt="${name}">
                    ${imgCount > 0 ? `<span class="img-count">${imgCount} warna</span>` : ''}
                    ${isPortfolio ? '<span class="type-badge">Portfolio</span>' : ''}
                </div>
                <div class="card-info">
                    <h4>${name}</h4>
                    ${item.harga ? `<p class="price">${formatRupiah(item.harga)}</p>` : ''}
                    <p class="layanan">${isPortfolio ? (item.kategori || 'Portfolio') : (item.layanan || '')}</p>
                </div>
            </div>
        `;
    }).join('');
}

function showDetail(id) {
    const allItems = [...products, ...portfolio];
    selectedItem = allItems.find(item => item.id === id);
    if (!selectedItem) return;

    selectedWarnaIndex = 0;
    currentImageIndex = 0;
    const isPortfolio = selectedItem.type === 'portfolio';
    const name = isPortfolio ? (selectedItem.judul || '') : (selectedItem.nama || '');

    const modal = document.getElementById('detailModal');
    if (!modal) return;

    // Build gallery from first warna
    const firstWarna = selectedItem.warnaList?.[0];
    const allImages = firstWarna
        ? [firstWarna.image, ...(firstWarna.images || [])].filter(Boolean)
        : [];

    // Build warna selector HTML
    const warnaSelectorHtml = buildWarnaSelector(selectedItem);

    // Portfolio images
    const portfolioImages = [selectedItem.image, ...(selectedItem.images || [])].filter(Boolean);

    modal.innerHTML = `
        <div class="modal-bg" onclick="closeDetail()"></div>
        <div class="modal-sheet">
            <div class="modal-handle"></div>
            <button class="modal-close" onclick="closeDetail()">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>

            ${!isPortfolio ? warnaSelectorHtml : ''}

            <div class="detail-gallery">
                <div class="gallery-container" id="galleryContainer">
                    ${isPortfolio
                        ? portfolioImages.map((img, i) => `<img src="${img}" alt="" class="gallery-img" data-index="${i}" style="display:${i === 0 ? 'block' : 'none'}">`).join('')
                        : allImages.map((img, i) => `<img src="${img}" alt="" class="gallery-img" data-index="${i}" style="display:${i === 0 ? 'block' : 'none'}">`).join('')
                    }
                </div>
                ${(isPortfolio ? portfolioImages : allImages).length > 1 ? `
                    <div class="gallery-nav">
                        <button class="gallery-btn prev" onclick="prevImg()">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                        </button>
                        <div class="gallery-dots">
                            ${(isPortfolio ? portfolioImages : allImages).map((_, i) => `<span class="gdot ${i === 0 ? 'active' : ''}" onclick="goToImage(${i})"></span>`).join('')}
                        </div>
                        <button class="gallery-btn next" onclick="nextImg()">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                        </button>
                    </div>
                    <div class="gallery-counter">${currentImageIndex + 1} / ${(isPortfolio ? portfolioImages : allImages).length}</div>
                ` : ''}
            </div>

            <div class="modal-body">
                <h2>${name}</h2>
                ${selectedItem.harga ? `<p class="harga">${formatRupiah(selectedItem.harga)}</p>` : ''}
                <span class="badge">${isPortfolio ? (selectedItem.kategori || 'Portfolio') : (selectedItem.layanan || '')}</span>

                ${selectedItem.deskripsi ? `
                <div class="desc">
                    <h3>Deskripsi</h3>
                    <p>${selectedItem.deskripsi}</p>
                </div>
                ` : ''}

                ${!isPortfolio && firstWarna?.deskripsi ? `
                <div class="desc" id="gambarDescSection">
                    <h3>Detail Gambar</h3>
                    <p id="gambarDescText">${firstWarna.deskripsi}</p>
                </div>
                ` : ''}

                ${!isPortfolio ? `
                <div class="store-card">
                    <div class="store-icon">🏪</div>
                    <div>
                        <p class="store-name">MotifKain</p>
                        <p class="store-loc">Chat WA</p>
                    </div>
                </div>

                <button class="wa-btn" onclick="openWa()">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Hubungi via WhatsApp
                </button>
                ` : ''}
            </div>
        </div>
    `;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    initTouchSwipe();
}

function buildWarnaSelector(item) {
    if (!item.warnaList || item.warnaList.length === 0) return '';

    return `
        <div class="warna-selector">
            ${item.warnaList.map((warna, i) => `
                <button class="warna-chip ${i === selectedWarnaIndex ? 'active' : ''}"
                        onclick="selectWarna(${i})">
                    <span class="warna-dot" style="background-color: ${getColorFromName(warna.nama)}"></span>
                    ${warna.nama}
                </button>
            `).join('')}
        </div>
    `;
}

function getColorFromName(nama) {
    const colorMap = {
        'merah': '#C62828',
        'maroon': '#800000',
        'biru': '#1565C0',
        'navy': '#0D1B4C',
        'hijau': '#2E7D32',
        'tosca': '#00695C',
        'kuning': '#F9A825',
        'gold': '#FFD700',
        'emas': '#FFD700',
        'hitam': '#212121',
        'putih': '#EEEEEE',
        'coklat': '#5D4037',
        'ungu': '#7B1FA2',
        'pink': '#E91E63',
        'orange': '#EF6C00',
        'abu': '#607D8B',
        'cream': '#FFF8E1',
        'sage': '#8FBC8F'
    };

    const lower = (nama || '').toLowerCase();
    for (const [key, color] of Object.entries(colorMap)) {
        if (lower.includes(key)) return color;
    }
    return '#8B5A2B';
}

function selectWarna(index) {
    selectedWarnaIndex = index;
    const warna = selectedItem.warnaList[index];
    if (!warna) return;

    currentImageIndex = 0;

    // Update gallery
    const allImages = [warna.image, ...(warna.images || [])].filter(Boolean);
    const galleryContainer = document.getElementById('galleryContainer');
    if (galleryContainer) {
        galleryContainer.innerHTML = allImages.map((img, i) =>
            `<img src="${img}" alt="" class="gallery-img" data-index="${i}" style="display:${i === 0 ? 'block' : 'none'}">`
        ).join('');
    }

    // Update dots
    const dotsHtml = allImages.map((_, i) =>
        `<span class="gdot ${i === 0 ? 'active' : ''}" onclick="goToImage(${i})"></span>`
    ).join('');
    const dotsContainer = document.querySelector('.gallery-dots');
    if (dotsContainer) dotsContainer.innerHTML = dotsHtml;

    // Update counter
    const counter = document.querySelector('.gallery-counter');
    if (counter) counter.textContent = `1 / ${allImages.length}`;

    // Update gallery nav visibility
    const nav = document.querySelector('.gallery-nav');
    const newCounter = document.querySelector('.gallery-counter');
    if (nav) nav.style.display = allImages.length > 1 ? 'flex' : 'none';
    if (newCounter) newCounter.style.display = allImages.length > 1 ? 'block' : 'none';

    // Update deskripsi
    const descSection = document.getElementById('gambarDescSection');
    const descText = document.getElementById('gambarDescText');
    if (descSection && descText) {
        if (warna.deskripsi) {
            descText.textContent = warna.deskripsi;
            descSection.style.display = 'block';
        } else {
            descSection.style.display = 'none';
        }
    }

    // Update warna selector active state
    document.querySelectorAll('.warna-chip').forEach((chip, i) => {
        chip.classList.toggle('active', i === index);
    });
}

function initTouchSwipe() {
    const container = document.getElementById('galleryContainer');
    if (!container) return;

    let startX = 0;
    container.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    container.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) { dx < 0 ? nextImg() : prevImg(); }
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
    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.remove('show');
    document.body.style.overflow = '';
}

function openWa() {
    const wa = selectedItem?.nowa || selectedItem?.whatsapp || '';
    if (!wa) { alert('Nomor WhatsApp belum tersedia'); return; }
    let p = wa.replace(/\D/g, '');
    if (p.startsWith('0')) p = '62' + p.slice(1);
    const msg = encodeURIComponent(`Assalamualaikum, saya tertarik dengan produk *${selectedItem?.nama || 'ini'}* dari MotifKain`);
    window.open('https://wa.me/' + p + '?text=' + msg, '_blank');
}

function backToWelcome() {
    const ws = document.getElementById("welcomeScreen");
    const app = document.getElementById("appScreen");
    if (app) app.style.display = 'none';
    if (ws) {
        ws.style.display = 'flex';
        renderWelcomeScreen();
    }
}
