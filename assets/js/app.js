/**
 * MOTIFKAIN KATALOG
 * Earth Tone Theme
 *
 * Struktur Data Hirarkis:
 * layanan > kategori > subkategori > produk > warna > gambar
 */

const CONFIG = window.MOTIFKAIN_CONFIG || {
    pocketbaseUrl: 'https://katalog-production-104e.up.railway.app',
    layananCollection: 'layanan',
    kategoriCollection: 'kategori',
    subkategoriCollection: 'subkategori',
    produkCollection: 'produk',
    warnaCollection: 'warna',
    gambarCollection: 'gambar',
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

// Data state
let dataLayanan = [];
let dataKategori = [];
let dataSubkategori = [];
let dataProduk = [];
let dataWarna = [];
let dataGambar = [];
let portfolio = [];
let kontak = [];

// Filter state
let selectedLayanan = null;
let selectedKategori = null;
let selectedSubkategori = null;

// Detail state
let selectedItem = null;
let selectedWarnaIndex = 0;
let currentImageIndex = 0;

// Sample data fallback
const SAMPLE_LAYANAN = [
    { id: 'l1', nama: 'Jasa Desain', order: 1 },
    { id: 'l2', nama: 'Kain Printing', order: 2 },
    { id: 'l3', nama: 'Pakaian Jadi', order: 3 },
    { id: 'l4', nama: 'Asesoris', order: 4 }
];

const SAMPLE_KATEGORI = [
    { id: 'k1', nama: 'Batik', layanan: 'l1', order: 1 },
    { id: 'k2', nama: 'Tenun', layanan: 'l1', order: 2 },
    { id: 'k3', nama: 'Songket', layanan: 'l1', order: 3 },
    { id: 'k4', nama: 'Kain Polos', layanan: 'l2', order: 1 },
    { id: 'k5', nama: 'Kain Motif', layanan: 'l2', order: 2 },
    { id: 'k6', nama: 'Blouse', layanan: 'l3', order: 1 },
    { id: 'k7', nama: 'Dress', layanan: 'l3', order: 2 },
    { id: 'k8', nama: 'Gelang', layanan: 'l4', order: 1 },
    { id: 'k9', nama: 'Cincin', layanan: 'l4', order: 2 }
];

const SAMPLE_SUBKATEGORI = [
    { id: 'sk1', nama: 'Motif Parang', kategori: 'k1', order: 1 },
    { id: 'sk2', nama: 'Motif Bunga', kategori: 'k1', order: 2 },
    { id: 'sk3', nama: 'Motif Geometris', kategori: 'k1', order: 3 },
    { id: 'sk4', nama: 'Motif Kawung', kategori: 'k1', order: 4 },
    { id: 'sk5', nama: 'Tenun Ikat', kategori: 'k2', order: 1 },
    { id: 'sk6', nama: 'Tenun Sutera', kategori: 'k2', order: 2 },
    { id: 'sk7', nama: 'Songket Emas', kategori: 'k3', order: 1 },
    { id: 'sk8', nama: 'Songket Perak', kategori: 'k3', order: 2 }
];

const SAMPLE_PRODUK = [
    { id: 'p1', nama: 'Motif Parang Klasik', subkategori: 'sk1', harga: 150000, deskripsi: 'Desain motif parang klasik' },
    { id: 'p2', nama: 'Motif Bunga Melati', subkategori: 'sk2', harga: 175000, deskripsi: 'Motif bunga melati' },
    { id: 'p3', nama: 'Tenun Ikat Premium', subkategori: 'sk5', harga: 250000, deskripsi: 'Tenun ikat kualitas premium' }
];

const SAMPLE_WARNA = [
    { id: 'w1', nama: 'Merah Maroon', produk: 'p1' },
    { id: 'w2', nama: 'Biru Navy', produk: 'p1' },
    { id: 'w3', nama: 'Putih Coklat', produk: 'p2' },
    { id: 'w4', nama: 'Kuning Gold', produk: 'p2' }
];

const SAMPLE_GAMBAR = [
    { id: 'g1', gambar: 'https://picsum.photos/400/400?random=1', deskripsi: 'Tampak depan', warna: 'w1' },
    { id: 'g2', gambar: 'https://picsum.photos/400/400?random=2', deskripsi: 'Detail motif', warna: 'w1' },
    { id: 'g3', gambar: 'https://picsum.photos/400/400?random=3', deskripsi: 'Tampak depan', warna: 'w2' },
    { id: 'g4', gambar: 'https://picsum.photos/400/400?random=4', deskripsi: 'Detail motif', warna: 'w3' }
];

const SAMPLE_PORTFOLIO = [
    { id: 'pf1', judul: 'Koleksi Batik Nusantara', kategori: 'Batik', image: 'https://picsum.photos/400/400?random=10', deskripsi: 'Koleksi batik' },
    { id: 'pf2', judul: 'Tenun Ikat Lombok', kategori: 'Tenun', image: 'https://picsum.photos/400/400?random=11', deskripsi: 'Tenun ikat Lombok' }
];

document.addEventListener('DOMContentLoaded', async () => {
    renderWelcomeScreen();
});

function renderWelcomeScreen() {
    const ws = document.getElementById('welcomeScreen');
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
    const ws = document.getElementById('welcomeScreen');
    const app = document.getElementById('appScreen');
    if (ws) ws.style.display = 'none';
    if (app) {
        app.style.display = 'flex';
        loadKatalog();
    }
}

async function loadKatalog() {
    renderKatalogHeader();
    await Promise.all([
        loadLayanan(),
        loadKategori(),
        loadSubkategori(),
        loadProduk(),
        loadWarna(),
        loadGambar(),
        loadPortfolio(),
        loadKontak()
    ]);
    buildHierarchicalData();
    renderItems();
}

async function loadLayanan() {
    try {
        const res = await fetch(CONFIG.pocketbaseUrl + '/api/collections/' + CONFIG.layananCollection + '/records?per-page=500&sort=order');
        if (res.ok) {
            const data = await res.json();
            dataLayanan = data.items || [];
        }
    } catch (e) { console.error('Error loading layanan:', e); }
    if (!dataLayanan.length) dataLayanan = SAMPLE_LAYANAN;
}

async function loadKategori() {
    try {
        const res = await fetch(CONFIG.pocketbaseUrl + '/api/collections/' + CONFIG.kategoriCollection + '/records?per-page=500&sort=order');
        if (res.ok) {
            const data = await res.json();
            dataKategori = data.items || [];
        }
    } catch (e) { console.error('Error loading kategori:', e); }
    if (!dataKategori.length) dataKategori = SAMPLE_KATEGORI;
}

async function loadSubkategori() {
    try {
        const res = await fetch(CONFIG.pocketbaseUrl + '/api/collections/' + CONFIG.subkategoriCollection + '/records?per-page=500&sort=order');
        if (res.ok) {
            const data = await res.json();
            dataSubkategori = data.items || [];
        }
    } catch (e) { console.error('Error loading subkategori:', e); }
    if (!dataSubkategori.length) dataSubkategori = SAMPLE_SUBKATEGORI;
}

async function loadProduk() {
    try {
        const res = await fetch(CONFIG.pocketbaseUrl + '/api/collections/' + CONFIG.produkCollection + '/records?per-page=500&sort=-created');
        if (res.ok) {
            const data = await res.json();
            dataProduk = data.items || [];
        }
    } catch (e) { console.error('Error loading produk:', e); }
    if (!dataProduk.length) dataProduk = SAMPLE_PRODUK;
}

async function loadWarna() {
    try {
        const res = await fetch(CONFIG.pocketbaseUrl + '/api/collections/' + CONFIG.warnaCollection + '/records?per-page=500');
        if (res.ok) {
            const data = await res.json();
            dataWarna = data.items || [];
        }
    } catch (e) { console.error('Error loading warna:', e); }
    if (!dataWarna.length) dataWarna = SAMPLE_WARNA;
}

async function loadGambar() {
    try {
        const res = await fetch(CONFIG.pocketbaseUrl + '/api/collections/' + CONFIG.gambarCollection + '/records?per-page=1000');
        if (res.ok) {
            const data = await res.json();
            dataGambar = data.items || [];
        }
    } catch (e) { console.error('Error loading gambar:', e); }
    if (!dataGambar.length) dataGambar = SAMPLE_GAMBAR;
}

async function loadPortfolio() {
    try {
        const res = await fetch(CONFIG.pocketbaseUrl + '/api/collections/' + CONFIG.portfolioCollection + '/records?per-page=500&sort=-created');
        if (res.ok) {
            const data = await res.json();
            portfolio = (data.items || []).map(item => ({
                ...item,
                type: 'portfolio',
                image: item.image ? CONFIG.pocketbaseUrl + '/api/files/' + CONFIG.portfolioCollection + '/' + item.id + '/' + item.image : ''
            }));
        }
    } catch (e) { console.error('Error loading portfolio:', e); }
    if (!portfolio.length) portfolio = SAMPLE_PORTFOLIO;
}

async function loadKontak() {
    try {
        const res = await fetch(CONFIG.pocketbaseUrl + '/api/collections/' + CONFIG.kontakCollection + '/records?per-page=100');
        if (res.ok) {
            const data = await res.json();
            kontak = data.items || [];
        }
    } catch (e) { console.error('Error loading kontak:', e); }
}

function buildHierarchicalData() {
    for (const layanan of dataLayanan) {
        layanan.kategoriList = dataKategori.filter(k => {
            const kid = typeof k.layanan === 'string' ? k.layanan : k.layanan?.id;
            return kid === layanan.id;
        }).sort((a, b) => (a.order || 0) - (b.order || 0));

        for (const kategori of layanan.kategoriList) {
            kategori.subkategoriList = dataSubkategori.filter(sk => {
                const skid = typeof sk.kategori === 'string' ? sk.kategori : sk.kategori?.id;
                return skid === kategori.id;
            }).sort((a, b) => (a.order || 0) - (b.order || 0));

            for (const subkategori of kategori.subkategoriList) {
                subkategori.produkList = dataProduk.filter(p => {
                    const pid = typeof p.subkategori === 'string' ? p.subkategori : p.subkategori?.id;
                    return pid === subkategori.id;
                });

                for (const produk of subkategori.produkList) {
                    produk.warnaList = dataWarna.filter(w => {
                        const wid = typeof w.produk === 'string' ? w.produk : w.produk?.id;
                        return wid === produk.id;
                    }).map(warna => {
                        const warnaGambar = dataGambar.filter(g => {
                            const gid = typeof g.warna === 'string' ? g.warna : g.warna?.id;
                            return gid === warna.id;
                        }).map(g => ({
                            id: g.id,
                            gambar: CONFIG.pocketbaseUrl + '/api/files/' + CONFIG.gambarCollection + '/' + g.id + '/' + g.gambar,
                            deskripsi: g.deskripsi || ''
                        }));
                        return {
                            id: warna.id,
                            nama: warna.nama,
                            image: warnaGambar.length > 0 ? warnaGambar[0].gambar : '',
                            images: warnaGambar
                        };
                    });
                    produk.image = produk.warnaList.length > 0 ? produk.warnaList[0].image : '';
                }
            }
        }
    }
}

function renderKatalogHeader() {
    const app = document.getElementById('appScreen');
    if (!app) return;

    const layananFilters = dataLayanan.map(l => {
        const active = selectedLayanan === l.id ? 'active' : '';
        return `<button class="filter-chip ${active}" onclick="selectLayanan('${l.id}')">${l.nama}</button>`;
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
                <div class="filter-chips">
                    <button class="filter-chip ${!selectedLayanan ? 'active' : ''}" onclick="selectLayanan(null)">Semua</button>
                    ${layananFilters}
                    <button class="filter-chip ${selectedLayanan === 'portfolio' ? 'active' : ''}" onclick="selectLayanan('portfolio')">Portfolio</button>
                </div>
            </div>
        </header>
        <div class="breadcrumb" id="breadcrumb"></div>
        <div class="products-container" id="productsContainer">
            <div class="products-grid" id="productsGrid"></div>
            <div class="loading" id="loading"><div class="spinner"></div></div>
        </div>
        <div class="detail-modal" id="detailModal"></div>
    `;
}

function selectLayanan(id) {
    selectedLayanan = id;
    selectedKategori = null;
    selectedSubkategori = null;
    renderKatalogHeader();
    renderItems();
}

function selectKategori(id) {
    selectedKategori = id;
    selectedSubkategori = null;
    renderItems();
}

function selectSubkategori(id) {
    selectedSubkategori = id;
    renderItems();
}

function clearKategori() {
    selectedKategori = null;
    selectedSubkategori = null;
    renderKatalogHeader();
    renderItems();
}

function clearSubkategori() {
    selectedSubkategori = null;
    renderItems();
}

function renderItems() {
    const grid = document.getElementById('productsGrid');
    const loading = document.getElementById('loading');
    const breadcrumb = document.getElementById('breadcrumb');
    if (loading) loading.style.display = 'none';
    if (!grid) return;

    if (selectedLayanan === 'portfolio') {
        if (breadcrumb) breadcrumb.innerHTML = '<span>Portfolio</span>';
        renderPortfolio(grid);
        return;
    }

    if (!selectedLayanan) {
        if (breadcrumb) breadcrumb.innerHTML = '';
        renderLayananList(grid);
        return;
    }

    const layanan = dataLayanan.find(l => l.id === selectedLayanan);
    if (!layanan) return;

    if (!selectedKategori) {
        if (breadcrumb) breadcrumb.innerHTML = `<span onclick="clearKategori()">${layanan.nama}</span>`;
        renderKategoriList(grid, layanan);
        return;
    }

    const kategori = layanan.kategoriList.find(k => k.id === selectedKategori);
    if (!kategori) return;

    if (!selectedSubkategori) {
        if (breadcrumb) breadcrumb.innerHTML = `<span onclick="clearKategori()">${layanan.nama}</span> &gt; <span>${kategori.nama}</span>`;
        renderSubkategoriList(grid, kategori);
        return;
    }

    const subkategori = kategori.subkategoriList.find(s => s.id === selectedSubkategori);
    if (!subkategori) return;

    if (breadcrumb) breadcrumb.innerHTML = `<span onclick="clearKategori()">${layanan.nama}</span> &gt; <span onclick="clearSubkategori()">${kategori.nama}</span> &gt; <span>${subkategori.nama}</span>`;
    renderProdukList(grid, subkategori);
}

function renderLayananList(grid) {
    grid.innerHTML = dataLayanan.map(layanan => `
        <div class="category-card" onclick="selectLayanan('${layanan.id}')">
            <h3>${layanan.nama}</h3>
            <p>${layanan.kategoriList?.length || 0} kategori</p>
        </div>
    `).join('');
}

function renderKategoriList(grid, layanan) {
    grid.innerHTML = layanan.kategoriList.map(kategori => `
        <div class="category-card" onclick="selectKategori('${kategori.id}')">
            <h3>${kategori.nama}</h3>
            <p>${kategori.subkategoriList?.length || 0} subkategori</p>
        </div>
    `).join('');
}

function renderSubkategoriList(grid, kategori) {
    grid.innerHTML = kategori.subkategoriList.map(subkategori => `
        <div class="category-card" onclick="selectSubkategori('${subkategori.id}')">
            <h3>${subkategori.nama}</h3>
            <p>${subkategori.produkList?.length || 0} produk</p>
        </div>
    `).join('');
}

function renderProdukList(grid, subkategori) {
    const produkList = subkategori.produkList || [];
    if (produkList.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h3>Belum ada produk</h3><p>Subkategori ini belum memiliki produk.</p></div>';
        return;
    }

    grid.innerHTML = produkList.map(produk => {
        const thumbImages = [];
        for (const warna of produk.warnaList || []) {
            if (warna.image) thumbImages.push(warna.image);
            if (thumbImages.length >= 4) break;
        }

        const thumbnailsHtml = thumbImages.length > 1 ? `
            <div class="card-thumbnails">
                ${thumbImages.map((img, i) => `<div class="card-thumb ${i === 0 ? 'active' : ''}"><img src="${img}" alt=""></div>`).join('')}
            </div>
        ` : '';

        return `
            <div class="product-card" onclick="showDetail('${produk.id}', '${subkategori.id}')">
                <div class="card-img">
                    <img src="${produk.image || 'https://via.placeholder.com/400'}" alt="${produk.nama}">
                </div>
                ${thumbnailsHtml}
                <div class="card-info">
                    <h4>${produk.nama}</h4>
                    ${produk.harga ? `<p class="price">${formatRupiah(produk.harga)}</p>` : ''}
                    ${produk.deskripsi ? `<p class="desc">${produk.deskripsi}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function renderPortfolio(grid) {
    if (portfolio.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h3>Belum ada portfolio</h3></div>';
        return;
    }

    grid.innerHTML = portfolio.map(item => `
        <div class="product-card" onclick="showDetail('${item.id}', 'portfolio')">
            <div class="card-img">
                <img src="${item.image || 'https://via.placeholder.com/400'}" alt="${item.judul}">
                <span class="type-badge">Portfolio</span>
            </div>
            <div class="card-info">
                <h4>${item.judul}</h4>
                <p class="layanan">${item.kategori || 'Portfolio'}</p>
            </div>
        </div>
    `).join('');
}

function formatRupiah(n) {
    if (n >= 1000000) return 'Rp ' + (n/1000000).toFixed(1) + 'Jt';
    if (n >= 1000) return 'Rp ' + Math.round(n/1000) + 'Rb';
    return 'Rp ' + (n || 0).toLocaleString('id-ID');
}

function showDetail(id, context) {
    if (context === 'portfolio') {
        selectedItem = portfolio.find(p => p.id === id);
        selectedItem.type = 'portfolio';
    } else {
        const subkategori = findSubkategoriByProduk(id);
        if (subkategori) {
            selectedItem = subkategori.produkList.find(p => p.id === id);
            selectedItem.subkategori = subkategori;
        }
    }

    if (!selectedItem) return;

    selectedWarnaIndex = 0;
    currentImageIndex = 0;
    const isPortfolio = selectedItem.type === 'portfolio';
    const name = isPortfolio ? (selectedItem.judul || '') : (selectedItem.nama || '');

    const modal = document.getElementById('detailModal');
    if (!modal) return;

    const firstWarna = selectedItem.warnaList?.[0];
    const allImages = firstWarna
        ? [firstWarna.image, ...(firstWarna.images || [])].filter(Boolean)
        : [];

    const warnaSelectorHtml = buildWarnaDots(selectedItem);
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

                ${!isPortfolio && selectedItem.subkategori ? `
                <p class="breadcrumb-info">
                    ${selectedItem.subkategori.nama}
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

function findSubkategoriByProduk(produkId) {
    for (const layanan of dataLayanan) {
        for (const kategori of layanan.kategoriList || []) {
            for (const subkategori of kategori.subkategoriList || []) {
                if (subkategori.produkList?.some(p => p.id === produkId)) {
                    return subkategori;
                }
            }
        }
    }
    return null;
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

function selectWarna(index) {
    selectedWarnaIndex = index;
    const warna = selectedItem.warnaList[index];
    if (!warna) return;

    currentImageIndex = 0;

    const allImages = [warna.image, ...(warna.images || [])].filter(Boolean);
    const galleryContainer = document.getElementById('galleryContainer');
    if (galleryContainer) {
        galleryContainer.classList.remove('zoomed');
        galleryContainer.innerHTML = allImages.map((img, i) =>
            `<img src="${img}" alt="" class="gallery-img" data-index="${i}" style="display:${i === 0 ? 'block' : 'none'}">`
        ).join('');
    }

    const dotsHtml = allImages.map((_, i) =>
        `<span class="gdot ${i === 0 ? 'active' : ''}" onclick="goToImage(${i})"></span>`
    ).join('');
    const dotsContainer = document.querySelector('.gallery-dots');
    if (dotsContainer) dotsContainer.innerHTML = dotsHtml;

    const nav = document.querySelector('.gallery-nav');
    if (nav) nav.style.display = allImages.length > 1 ? 'flex' : 'none';

    const dots = document.querySelectorAll('.warna-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

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
    let isZooming = false;

    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isZooming = container.classList.contains('zoomed');
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        if (isZooming) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) {
            dx < 0 ? nextImg() : prevImg();
        }
    }, { passive: true });

    container.addEventListener('click', (e) => {
        if (Math.abs(e.clientX - startX) > 10) return;
        container.classList.toggle('zoomed');
        container.querySelectorAll('.gallery-img').forEach(img => img.classList.toggle('zoomed'));
    });
}

function prevImg() {
    const container = document.getElementById('galleryContainer');
    if (container?.classList.contains('zoomed')) {
        container.classList.remove('zoomed');
        container.querySelectorAll('.gallery-img').forEach(img => img.classList.remove('zoomed'));
    }
    const imgs = document.querySelectorAll('.gallery-img');
    if (imgs.length <= 1) return;
    imgs[currentImageIndex].style.display = 'none';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.remove('active');
    currentImageIndex = (currentImageIndex - 1 + imgs.length) % imgs.length;
    imgs[currentImageIndex].style.display = 'block';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.add('active');
}

function nextImg() {
    const container = document.getElementById('galleryContainer');
    if (container?.classList.contains('zoomed')) {
        container.classList.remove('zoomed');
        container.querySelectorAll('.gallery-img').forEach(img => img.classList.remove('zoomed'));
    }
    const imgs = document.querySelectorAll('.gallery-img');
    if (imgs.length <= 1) return;
    imgs[currentImageIndex].style.display = 'none';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.remove('active');
    currentImageIndex = (currentImageIndex + 1) % imgs.length;
    imgs[currentImageIndex].style.display = 'block';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.add('active');
}

function goToImage(i) {
    const container = document.getElementById('galleryContainer');
    if (container?.classList.contains('zoomed')) {
        container.classList.remove('zoomed');
        container.querySelectorAll('.gallery-img').forEach(img => img.classList.remove('zoomed'));
    }
    const imgs = document.querySelectorAll('.gallery-img');
    if (!imgs.length) return;
    imgs[currentImageIndex].style.display = 'none';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.remove('active');
    currentImageIndex = i;
    imgs[currentImageIndex].style.display = 'block';
    document.querySelectorAll('.gdot')[currentImageIndex]?.classList.add('active');
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
    const msg = encodeURIComponent(`Assalamualaikum warahmatullahi wabarakatuh. Saya tertarik dengan produk ini: *${produkName}*`);
    window.open('https://wa.me/' + wa + '?text=' + msg, '_blank');

    const dropdown = document.getElementById('waDropdown');
    if (dropdown) dropdown.classList.remove('show');
}

function toggleWaDropdown() {
    const dropdown = document.getElementById('waDropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('waDropdown');
    const btn = document.querySelector('.wa-btn-icon');
    if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

function backToWelcome() {
    const ws = document.getElementById('welcomeScreen');
    const app = document.getElementById('appScreen');
    if (app) app.style.display = 'none';
    if (ws) {
        ws.style.display = 'flex';
        renderWelcomeScreen();
    }
}