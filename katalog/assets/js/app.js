/**
 * MOTIFKAIN KATALOG - ISWARA STYLE
 * With swipe carousel for multiple images
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
    accent: '#8BC34A',
    background: '#F5F5F5',
    success: '#4CAF50',
    textSecondary: '#757575',
    divider: '#E0E0E0'
};

let products = [];
let filteredProducts = [];
let currentCategory = null;
let currentDaerah = null;
let selectedProduct = null;
let currentImageIndex = 0;
let touchStartX = 0;

const kategoriList = ['Semua', 'Desain Motif', 'Printing Kain', 'Pakaian Jadi', 'Asesoris'];
const daerahList = ['Semua', 'Jakarta', 'Solo', 'Bandung', 'Yogyakarta', 'Surabaya'];

document.addEventListener('DOMContentLoaded', async () => {
    renderWelcomeScreen();
});

function renderWelcomeScreen() {
    const ws = document.getElementById("welcomeScreen");
    if (ws) {
        ws.innerHTML = '<div class="simple-welcome"><img src="assets/images/KATALOG.png" alt="MotifKain" class="simple-welcome-image" onclick="openKatalog()"></div><button class="simple-welcome-btn" onclick="openKatalog()">Lihat Produk</button>';
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

    const kategoriHtml = kategoriList.map(k => {
        const active = (k === 'Semua' && !currentCategory) || k === currentCategory ? 'active' : '';
        return `<button class="filter-chip ${active}" onclick="toggleKategori('${k}')">${k}</button>`;
    }).join('');

    const daerahHtml = daerahList.map(d => {
        const active = (d === 'Semua' && !currentDaerah) || d === currentDaerah ? 'active' : '';
        return `<button class="filter-chip daerah ${active}" onclick="toggleDaerah('${d}')">${d}</button>`;
    }).join('');

    app.innerHTML = `
        <header class="katalog-header">
            <div class="katalog-top">
                <h1>Katalog Produk</h1>
            </div>
            <div class="search-bar">
                <svg class="search-icon" viewBox="0 0 24 24" fill="white"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9 6.5 6.5 0 1 0 9 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9s2.01-5 5-5 5 3.01 5 5-2.01 5-5 5z"/></svg>
                <input type="text" id="searchInput" placeholder="Cari produk..." oninput="doSearch()">
                <button class="search-clear" onclick="clearSearch()" style="display:none">✕</button>
            </div>
            <div class="filter-section">
                <div class="filter-group">
                    <span class="filter-label">Kategori</span>
                    <div class="filter-chips" id="kategoriChips">${kategoriHtml}</div>
                </div>
                <div class="filter-group">
                    <span class="filter-label">Daerah</span>
                    <div class="filter-chips" id="daerahChips">${daerahHtml}</div>
                </div>
            </div>
            <div class="active-filters" id="activeFilters"></div>
        </header>
        <div class="products-container" id="productsContainer">
            <div class="products-grid" id="productsGrid"></div>
            <div class="loading" id="loading"><div class="spinner"></div></div>
        </div>
        <div class="product-modal" id="productModal"></div>
    `;
}

function toggleKategori(k) {
    currentCategory = k === 'Semua' ? null : k;
    renderKatalogHeader();
    doSearch();
    updateActiveFilters();
}

function toggleDaerah(d) {
    currentDaerah = d === 'Semua' ? null : d;
    renderKatalogHeader();
    doSearch();
    updateActiveFilters();
}

function updateActiveFilters() {
    const el = document.getElementById('activeFilters');
    if (!el) return;
    if (!currentCategory && !currentDaerah) { el.innerHTML = ''; return; }
    let html = '<span>🔍 Filter: </span>';
    if (currentCategory) html += `<span class="filter-tag">${currentCategory} ✕</span> `;
    if (currentDaerah) html += `<span class="filter-tag-daerah">${currentDaerah} ✕</span> `;
    html += '<button class="reset-btn" onclick="resetAll()">Reset</button>';
    el.innerHTML = html;
}

function resetAll() {
    currentCategory = null;
    currentDaerah = null;
    const inp = document.getElementById('searchInput');
    if (inp) inp.value = '';
    renderKatalogHeader();
    doSearch();
}

function clearSearch() {
    const inp = document.getElementById('searchInput');
    if (inp) inp.value = '';
    doSearch();
}

function doSearch() {
    const inp = document.getElementById('searchInput');
    const query = (inp?.value || '').toLowerCase();
    const clearBtn = document.querySelector('.search-clear');
    if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';
    filteredProducts = products.filter(p => {
        const matchQ = !query || p.nama?.toLowerCase().includes(query) || p.namatoko?.toLowerCase().includes(query);
        const matchK = !currentCategory || p.kategori === currentCategory;
        const matchD = !currentDaerah || p.daerah === currentDaerah;
        return matchQ && matchK && matchD;
    });
    renderProductCards();
}

async function loadProducts() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';
    try {
        // Load all produk
        const res = await fetch(CONFIG.pocketbaseUrl + '/api/collections/' + CONFIG.produkCollection + '/records?per-page=200&sort=-created');
        if (res.ok) {
            const data = await res.json();
            const produkList = data.items || [];

            // Load all warna dan gambar untuk setiap produk
            const warnaRes = await fetch(CONFIG.pocketbaseUrl + '/api/collections/warna/records?per-page=500');
            const gambarRes = await fetch(CONFIG.pocketbaseUrl + '/api/collections/gambar/records?per-page=500');

            let warnaMap = {};
            if (warnaRes.ok) {
                const warnaData = await warnaRes.json();
                (warnaData.items || []).forEach(w => {
                    warnaMap[w.produk] = warnaMap[w.produk] || [];
                    warnaMap[w.produk].push(w);
                });
            }

            let gambarMap = {};
            if (gambarRes.ok) {
                const gambarData = await gambarRes.json();
                (gambarData.items || []).forEach(g => {
                    if (g.gambar) {
                        (g.warna || []).forEach(warnaId => {
                            const produkId = Object.keys(warnaMap).find(pid =>
                                warnaMap[pid].some(w => w.id === warnaId)
                            );
                            if (produkId) {
                                gambarMap[produkId] = gambarMap[produkId] || [];
                                gambarMap[produkId].push(CONFIG.pocketbaseUrl + '/api/files/gambar/' + g.id + '/' + g.gambar);
                            }
                        });
                    }
                });
            }

            products = produkList.map(item => {
                const images = gambarMap[item.id] || [];
                return {
                    ...item,
                    image: images[0] || '',
                    images: images
                };
            });
        }
    } catch (e) { console.error(e); }
    if (!products.length) products = getSamples();
    doSearch();
    if (loading) loading.style.display = 'none';
}

function getSamples() {
    return [
        { id: "1", nama: "Motif Bunga Melati", harga: 150000, kategori: "Desain Motif", daerah: "Jakarta", namatoko: "MotifKain", image: "https://picsum.photos/800/800?random=1" },
        { id: "2", nama: "Motif Parang Classic", harga: 175000, kategori: "Desain Motif", daerah: "Solo", namatoko: "MotifKain", image: "https://picsum.photos/800/800?random=2" },
        { id: "3", nama: "Kain Printing Premium", harga: 200000, kategori: "Printing Kain", daerah: "Bandung", namatoko: "MotifKain", image: "https://picsum.photos/800/800?random=3" },
        { id: "4", nama: "Blouse Batik Elegant", harga: 350000, kategori: "Pakaian Jadi", daerah: "Yogyakarta", namatoko: "MotifKain", image: "https://picsum.photos/800/800?random=4" },
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
        grid.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="#BDBDBD"><path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 9 16 6.5 6.5 0 1 0 9 16zm6.5 3c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4-1.79 4-4z"/></svg><h3>Tidak ada produk</h3><p>Coba ubah filter</p></div>';
        return;
    }
    grid.innerHTML = filteredProducts.map((p, idx) => {
        const allImages = [p.image, ...(p.images || [])].filter(Boolean);
        return `
        <div class="product-card" onclick="showDetail('${p.id}')">
            <div class="card-img" onclick="event.stopPropagation(); openImageZoom('${p.image || ''}', ${JSON.stringify(allImages).replace(/"/g, '&quot;')}, 0)">
                <img src="${p.image || 'https://via.placeholder.com/400'}" alt="${p.nama}">
            </div>
            <div class="card-info">
                <h4>${p.nama || ''}</h4>
                <p class="price">${p.harga ? formatRupiah(p.harga) : ''}</p>
                <p class="toko">🏪 ${p.namatoko || 'MotifKain'}</p>
                <p class="lokasi">📍 ${p.daerah || '-'}</p>
            </div>
        </div>
    `;}).join('');
}

function renderProductCards() { renderProducts(); }

function showDetail(id) {
    selectedProduct = products.find(p => p.id === id);
    if (!selectedProduct) return;
    currentImageIndex = 0;
    const imgs = [selectedProduct.image, ...(selectedProduct.images || [])].filter(Boolean);
    const modal = document.getElementById('productModal');
    if (!modal) return;

    const dots = imgs.length > 1 ? `
        <div class="dots">
            ${imgs.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" onclick="goToImage(${i})"></span>`).join('')}
        </div>` : '';

    const prevBtn = imgs.length > 1 ? '<button class="nav-btn prev" onclick="prevImg()">‹</button>' : '';
    const nextBtn = imgs.length > 1 ? '<button class="nav-btn next" onclick="nextImg()">›</button>' : '';

    modal.innerHTML = `
        <div class="modal-bg" onclick="closeDetail()"></div>
        <div class="modal-sheet">
            <div class="modal-handle"></div>
            <button class="modal-close" onclick="closeDetail()">✕</button>
            <div class="gallery" id="gallery" ontouchstart="touchStart(event)" ontouchend="touchEnd(event)">
                ${imgs.map((img, i) => `<img src="${img}" alt="" class="gallery-img" data-index="${i}" style="display:${i === 0 ? 'block' : 'none'}" onclick="openImageZoom('${img}', ${JSON.stringify(imgs).replace(/"/g, '&quot;')}, ${i})">`).join('')}
                ${prevBtn}
                ${nextBtn}
                ${imgs.length > 1 ? `<div class="gallery-dots">${imgs.map((_, i) => `<span class="gdot ${i === 0 ? 'active' : ''}" onclick="goToImage(${i})"></span>`).join('')}</div>` : ''}
            </div>
            <div class="modal-body">
                <h2>${selectedProduct.nama || ''}</h2>
                ${selectedProduct.harga ? `<p class="harga">${formatRupiah(selectedProduct.harga)}</p>` : ''}
                ${selectedProduct.kategori ? `<span class="badge">${selectedProduct.kategori}</span>` : ''}
                <div class="store-card" onclick="openWa()">
                    <div class="store-icon">🏪</div>
                    <div><p class="store-name">${selectedProduct.namatoko || 'MotifKain'}</p><p class="store-loc">📍 ${selectedProduct.daerah || '-'} • Chat WA</p></div>
                    <svg class="store-arrow" viewBox="0 0 24 24" fill="#4CAF50"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                </div>
                <div class="desc"><h3>Deskripsi</h3><p>${selectedProduct.deskripsi || '-'}</p></div>
                <button class="wa-btn" onclick="openWa()">💬 Hubungi via WhatsApp</button>
            </div>
        </div>
    `;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeDetail() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('show');
    document.body.style.overflow = '';
}

function prevImg() {
    const imgs = document.querySelectorAll('.gallery-img');
    if (imgs.length <= 1) return;
    imgs[currentImageIndex].style.display = 'none';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.remove('active');
    currentImageIndex = (currentImageIndex - 1 + imgs.length) % imgs.length;
    imgs[currentImageIndex].style.display = 'block';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.add('active');
}

function nextImg() {
    const imgs = document.querySelectorAll('.gallery-img');
    if (imgs.length <= 1) return;
    imgs[currentImageIndex].style.display = 'none';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.remove('active');
    currentImageIndex = (currentImageIndex + 1) % imgs.length;
    imgs[currentImageIndex].style.display = 'block';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.add('active');
}

function goToImage(i) {
    const imgs = document.querySelectorAll('.gallery-img');
    if (!imgs.length) return;
    imgs[currentImageIndex].style.display = 'none';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.remove('active');
    currentImageIndex = i;
    imgs[currentImageIndex].style.display = 'block';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.add('active');
}

function touchStart(e) { touchStartX = e.touches[0].clientX; }
function touchEnd(e) {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? nextImg() : prevImg();
}

function openWa() {
    const wa = selectedProduct?.nowa || selectedProduct?.whatsapp || '';
    if (!wa) { alert('WA belum ada'); return; }
    let p = wa.replace(/\D/g, '');
    if (p.startsWith('0')) p = '62' + p.slice(1);
    const msg = encodeURIComponent(`Halo ${selectedProduct?.namatoko || 'Penjual'}, saya tertarik dengan produk *${selectedProduct?.nama || 'ini}*`);
    window.open('https://wa.me/' + p + '?text=' + msg, '_blank');
}

// === ZOOM IMAGE FUNCTIONS ===
let zoomImages = [];
let zoomCurrentIndex = 0;
let touchStartX = 0;
let touchStartY = 0;
let isZoomed = false;

function openImageZoom(src, images, index) {
    zoomImages = images || [src];
    zoomCurrentIndex = index || 0;

    const modal = document.getElementById('zoomModal');
    const img = document.getElementById('zoomImage');
    const counter = document.getElementById('zoomCounter');
    const prevBtn = document.querySelector('.zoom-prev');
    const nextBtn = document.querySelector('.zoom-next');

    if (modal && img) {
        img.src = zoomImages[zoomCurrentIndex];
        img.classList.remove('zoomed');
        isZoomed = false;

        if (counter) {
            counter.textContent = `${zoomCurrentIndex + 1} / ${zoomImages.length}`;
        }

        if (prevBtn) prevBtn.style.display = zoomImages.length > 1 ? 'flex' : 'none';
        if (nextBtn) nextBtn.style.display = zoomImages.length > 1 ? 'flex' : 'none';

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Setup touch events for zoom container
        setupZoomGestures();
    }
}

function closeImageZoom(event) {
    if (event && event.target !== event.currentTarget) return;

    const modal = document.getElementById('zoomModal');
    const img = document.getElementById('zoomImage');

    if (modal) modal.classList.remove('show');
    if (img) img.classList.remove('zoomed');
    document.body.style.overflow = '';
    isZoomed = false;
}

function zoomPrevImage() {
    zoomCurrentIndex = (zoomCurrentIndex - 1 + zoomImages.length) % zoomImages.length;
    updateZoomImage();
}

function zoomNextImage() {
    zoomCurrentIndex = (zoomCurrentIndex + 1) % zoomImages.length;
    updateZoomImage();
}

function updateZoomImage() {
    const img = document.getElementById('zoomImage');
    const counter = document.getElementById('zoomCounter');

    if (img) {
        img.src = zoomImages[zoomCurrentIndex];
        img.classList.remove('zoomed');
        isZoomed = false;
    }
    if (counter) {
        counter.textContent = `${zoomCurrentIndex + 1} / ${zoomImages.length}`;
    }
}

function setupZoomGestures() {
    const container = document.querySelector('.zoom-container');
    const img = document.getElementById('zoomImage');

    if (!container || !img) return;

    let scale = 1;
    let lastScale = 1;
    let pinchStartDistance = 0;

    container.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        // Handle pinch zoom
        if (e.touches.length === 2) {
            pinchStartDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        // Prevent default scrolling when zoomed
        if (isZoomed) {
            e.preventDefault();
        }
    }, { passive: false });

    container.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;

        // Handle pinch zoom
        if (e.touches.length === 0 && pinchStartDistance > 0) {
            const endDistance = Math.hypot(
                e.changedTouches[0].clientX - (e.changedTouches[1]?.clientX || 0),
                e.changedTouches[0].clientY - (e.changedTouches[1]?.clientY || 0)
            );
            // Pinch zoom detected, but simple tap/drag detection
            pinchStartDistance = 0;
            return;
        }

        // Swipe left/right for navigation
        if (Math.abs(dx) > 50 && Math.abs(dy) < 30) {
            if (dx < 0) {
                zoomNextImage();
            } else {
                zoomPrevImage();
            }
        }
    }, { passive: true });

    // Click to toggle zoom
    let clickTimer = null;
    container.addEventListener('click', (e) => {
        // Double tap to zoom
        if (clickTimer) {
            clearTimeout(clickTimer);
            clickTimer = null;

            // Double click - toggle zoom
            isZoomed = !isZoomed;
            img.classList.toggle('zoomed', isZoomed);
        } else {
            clickTimer = setTimeout(() => {
                clickTimer = null;
                // Single click - close if not zoomed
                if (!isZoomed) {
                    closeImageZoom(e);
                } else {
                    // Reset zoom
                    img.classList.remove('zoomed');
                    isZoomed = false;
                }
            }, 300);
        }
    });
}

// Override showDetail to support zoom on gallery images
const originalShowDetail = typeof showDetail === 'function' ? showDetail : null;
