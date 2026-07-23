/**
 * MOTIFKAIN KATALOG
 * Earth Tone Theme
 * Struktur: Produk → Warna → Gambar
 */

const CONFIG = window.MOTIFKAIN_CONFIG || {
    pocketbaseUrl: 'https://katalog-production-104e.up.railway.app',
    produkCollection: 'produk',
    portfolioCollection: 'portofolio',
    kontakCollection: 'kontak'
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
let kontak = [];
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
    await Promise.all([loadProducts(), loadPortfolio(), loadKontak()]);
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
                <img src="assets/images/logo-motifkain.png" alt="MotifKain" class="header-logo">
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
        // Load all produk
        const res = await fetch(
            CONFIG.pocketbaseUrl + '/api/collections/' + CONFIG.produkCollection +
            '/records?per-page=500&sort=-created'
        );
        if (res.ok) {
            const data = await res.json();
            products = data.items.map(item => {
                const p = { ...item, type: 'produk' };

                // Load all warna for this produk
                return p;
            });

            // Load all warna
            const warnaRes = await fetch(
                CONFIG.pocketbaseUrl + '/api/collections/warna/records?per-page=500'
            );
            const allWarna = warnaRes.ok ? await warnaRes.json() : { items: [] };
            const produkIds = products.map(p => p.id);
            const filteredWarna = allWarna.items.filter(w => produkIds.includes(w.produk));

            // Load all gambar
            const gambarRes = await fetch(
                CONFIG.pocketbaseUrl + '/api/collections/gambar/records?per-page=1000'
            );
            const allGambar = gambarRes.ok ? await gambarRes.json() : { items: [] };

            // Match warna and gambar to produk
            for (const p of products) {
                const produkWarna = filteredWarna.filter(w => w.produk === p.id);
                p.warnaList = produkWarna.map(warna => {
                    const warnaGambar = allGambar.items.filter(g => g.warna === warna.id);
                    const images = warnaGambar.map(g => ({
                        id: g.id,
                        gambar: CONFIG.pocketbaseUrl + '/api/files/gambar/' + g.id + '/' + g.gambar,
                        deskripsi: g.deskripsi
                    }));
                    return {
                        id: warna.id,
                        nama: warna.nama,
                        image: images.length > 0 ? images[0].gambar : '',
                        images: images
                    };
                });

                // Set first image as produk image
                if (p.warnaList && p.warnaList.length > 0) {
                    for (const w of p.warnaList) {
                        if (w.image) {
                            p.image = w.image;
                            break;
                        }
                    }
                }
            }
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

async function loadKontak() {
    try {
        const res = await fetch(CONFIG.pocketbaseUrl + '/api/collections/' + CONFIG.kontakCollection + '/records?per-page=100');
        if (res.ok) {
            const data = await res.json();
            kontak = data.items || [];
        }
    } catch (e) { console.error(e); }
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

        // Build thumbnail images
        let thumbnailsHtml = '';
        if (!isPortfolio && item.warnaList?.length > 0) {
            const thumbImages = [];
            for (const warna of item.warnaList) {
                if (warna.image) thumbImages.push(warna.image);
                if (thumbImages.length >= 4) break;
            }
            if (thumbImages.length > 1) {
                thumbnailsHtml = `
                    <div class="card-thumbnails">
                        ${thumbImages.map((img, i) => `<div class="card-thumb ${i === 0 ? 'active' : ''}"><img src="${img}" alt=""></div>`).join('')}
                    </div>
                `;
            }
        }

        return `
            <div class="product-card" onclick="showDetail('${item.id}')">
                <div class="card-img">
                    <img src="${item.image || 'https://via.placeholder.com/400'}" alt="${name}">
                    ${isPortfolio ? '<span class="type-badge">Portfolio</span>' : ''}
                </div>
                ${thumbnailsHtml}
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
    const warnaSelectorHtml = buildWarnaDots(selectedItem);

    // Portfolio images
    const portfolioImages = [selectedItem.image, ...(selectedItem.images || [])].filter(Boolean);

    modal.innerHTML = `
        <div class="modal-bg" onclick="closeDetail()"></div>
        <div class="modal-sheet">
            <div class="modal-handle"></div>
            <button class="modal-close" onclick="closeDetail()">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>

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
                ` : ''}
            </div>

            ${!isPortfolio && selectedItem.warnaList?.length > 0 ? warnaSelectorHtml : ''}

            <div class="modal-body">
                <h2>${name}</h2>
                ${selectedItem.harga ? `<p class="harga">${formatRupiah(selectedItem.harga)}</p>` : ''}
                ${!isPortfolio && (selectedItem.kategori || selectedItem.subkategori) ? `
                <p class="kategori-info">
                    ${selectedItem.kategori || ''}${selectedItem.kategori && selectedItem.subkategori ? ' - ' : ''}${selectedItem.subkategori || ''}
                </p>
                ` : ''}

                ${selectedItem.deskripsi ? `
                <div class="desc">
                    <p>${selectedItem.deskripsi}</p>
                </div>
                ` : ''}

                ${!isPortfolio && firstWarna?.deskripsi ? `
                <div class="desc" id="gambarDescSection">
                    <p id="gambarDescText">${firstWarna.deskripsi}</p>
                </div>
                ` : ''}

                ${!isPortfolio ? `
                <div class="wa-section">
                    <button class="wa-btn-icon" onclick="toggleWaDropdown()">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </button>
                    <div class="wa-dropdown" id="waDropdown">
                        <button onclick="openWa('desainer')">Desainer</button>
                        <button onclick="openWa('pemasaran')">Pemasaran</button>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    initTouchSwipe();
}

function buildWarnaDots(item) {
    if (!item.warnaList || item.warnaList.length <= 1) return '';

    return `
        <div class="warna-bar">
            <span class="warna-label">Warna:</span>
            <div class="warna-dots">
                ${item.warnaList.map((warna, i) => `
                    <div class="warna-dot ${i === selectedWarnaIndex ? 'active' : ''}"
                         style="background: ${getColorCode(warna.nama)}"
                         onclick="selectWarna(${i}); showWarnaList();">
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function getColorCode(colorName) {
    const name = (colorName || '').toLowerCase();
    if (name.includes('merah') || name.includes('maroon') || name.includes('burgundy')) return '#800020';
    if (name.includes('biru') || name.includes('navy') || name.includes('blue')) return '#000080';
    if (name.includes('hijau') || name.includes('green')) return '#228B22';
    if (name.includes('kuning') || name.includes('yellow')) return '#FFD700';
    if (name.includes('oranye') || name.includes('orange')) return '#FF8C00';
    if (name.includes('ungu') || name.includes('purple')) return '#800080';
    if (name.includes('pink') || name.includes('magenta')) return '#FF69B4';
    if (name.includes('coklat') || name.includes('brown')) return '#8B4513';
    if (name.includes('abu') || name.includes('grey') || name.includes('gray')) return '#808080';
    if (name.includes('hitam') || name.includes('black')) return '#1a1a1a';
    if (name.includes('putih') || name.includes('white')) return '#f5f5f5';
    if (name.includes('emas') || name.includes('gold')) return '#FFD700';
    if (name.includes('silver')) return '#C0C0C0';
    return '#D4C4B0';
}

function showWarnaList() {
    if (!selectedItem || !selectedItem.warnaList) return;

    const options = selectedItem.warnaList.map((warna, i) =>
        `<button onclick="selectWarna(${i}); closeWarnaList();">${warna.nama}</button>`
    ).join('');

    const dropdown = document.createElement('div');
    dropdown.className = 'warna-dropdown show';
    dropdown.innerHTML = `<div class="warna-dropdown-content">${options}</div>`;
    dropdown.id = 'warnaDropdownTemp';
    dropdown.onclick = (e) => { if (e.target === dropdown) closeWarnaList(); };
    document.body.appendChild(dropdown);
}

function closeWarnaList() {
    const dropdown = document.getElementById('warnaDropdownTemp');
    if (dropdown) dropdown.remove();
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
        galleryContainer.classList.remove('zoomed');
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

    // Update gallery nav visibility
    const nav = document.querySelector('.gallery-nav');
    if (nav) nav.style.display = allImages.length > 1 ? 'flex' : 'none';

    // Update selected warna dots
    const dots = document.querySelectorAll('.warna-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

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
}

function initTouchSwipe() {
    const container = document.getElementById('galleryContainer');
    if (!container) return;

    let startX = 0;
    let startY = 0;
    let isZooming = false;

    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isZooming = container.classList.contains('zoomed');
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        if (isZooming) return; // Skip swipe when zoomed
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 50 && Math.abs(dy) < 30) {
            dx < 0 ? nextImg() : prevImg();
        }
    }, { passive: true });

    // Click to zoom
    container.addEventListener('click', (e) => {
        if (Math.abs(e.clientX - startX) > 10) return; // Ignore swipe end
        container.classList.toggle('zoomed');
        const imgs = container.querySelectorAll('.gallery-img');
        imgs.forEach(img => img.classList.toggle('zoomed'));
    });
}

function prevImg() {
    const container = document.getElementById('galleryContainer');
    if (container?.classList.contains('zoomed')) {
        container.classList.remove('zoomed');
        document.querySelectorAll('.gallery-img').forEach(img => img.classList.remove('zoomed'));
    }
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
    const container = document.getElementById('galleryContainer');
    if (container?.classList.contains('zoomed')) {
        container.classList.remove('zoomed');
        document.querySelectorAll('.gallery-img').forEach(img => img.classList.remove('zoomed'));
    }
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
    const container = document.getElementById('galleryContainer');
    if (container?.classList.contains('zoomed')) {
        container.classList.remove('zoomed');
        document.querySelectorAll('.gallery-img').forEach(img => img.classList.remove('zoomed'));
    }
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

function openWa(role) {
    const person = kontak.find(k => k.role === role && k.whatsapp);
    if (!person || !person.whatsapp) {
        alert('Nomor WhatsApp ' + role + ' belum tersedia');
        return;
    }

    let wa = person.whatsapp.replace(/\D/g, '');
    if (wa.startsWith('0')) wa = '62' + wa.slice(1);
    const produkName = selectedItem?.nama || 'produk ini';
    const msg = encodeURIComponent(`Assalamualaikum warahmah. saya tertarik dengan produk ini: *${produkName}*`);
    window.open('https://wa.me/' + wa + '?text=' + msg, '_blank');

    // Close dropdown
    const dropdown = document.getElementById('waDropdown');
    if (dropdown) dropdown.classList.remove('show');
}

function toggleWaDropdown() {
    const dropdown = document.getElementById('waDropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('waDropdown');
    const btn = document.querySelector('.wa-btn-icon');
    if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

function backToWelcome() {
    const ws = document.getElementById("welcomeScreen");
    const app = document.getElementById("appScreen");
    if (app) app.style.display = 'none';
    if (ws) {
        ws.style.display = 'flex';
        renderWelcomeScreen();
    }
}
