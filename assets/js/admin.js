/**
 * MOTIFKAIN ADMIN DASHBOARD
 */

class AdminDashboard {
    constructor() {
        this.produk = [];
        this.portfolio = [];
        this.filteredProduk = [];
        this.filteredPortfolio = [];
        this.editingProductId = null;
        this.editingPortfolioId = null;
        this.productImages = [];
        this.portfolioImages = [];
        this.currentImageContext = 'product';
        this.pocketbaseToken = '';
        this.pocketbaseUrl = '';
        this.init();
    }

    init() {
        const savedToken = sessionStorage.getItem('motifkain_admin_token');
        const savedUrl = sessionStorage.getItem('motifkain_admin_url');

        if (savedToken && savedUrl) {
            this.pocketbaseToken = savedToken;
            this.pocketbaseUrl = savedUrl;
            this.showDashboard();
            this.loadAllData();
        } else {
            this.showLogin();
        }
    }

    showLogin() {
        document.getElementById('loginSection').style.display = 'flex';
        document.getElementById('dashboardSection').classList.remove('active');
    }

    showDashboard() {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').classList.add('active');
    }

    async login(email, password) {
        const url = window.MOTIFKAIN_CONFIG?.pocketbaseUrl;
        if (!url) {
            this.showNotification('PocketBase URL belum diset', 'error');
            return;
        }

        this.pocketbaseUrl = url.replace(/\/$/, '');

        try {
            const response = await fetch(this.pocketbaseUrl + '/api/admins/auth-with-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identity: email, password: password })
            });

            if (response.ok) {
                const data = await response.json();
                this.pocketbaseToken = data.token;
                sessionStorage.setItem('motifkain_admin_token', data.token);
                sessionStorage.setItem('motifkain_admin_url', this.pocketbaseUrl);
                this.showDashboard();
                this.loadAllData();
            } else {
                document.getElementById('loginError').style.display = 'block';
            }
        } catch (e) {
            this.showNotification('Tidak dapat terhubung ke server', 'error');
        }
    }

    logout() {
        sessionStorage.removeItem('motifkain_admin_token');
        sessionStorage.removeItem('motifkain_admin_url');
        location.reload();
    }

    openCatalog() {
        window.open('https://katalog.motifkain.com', '_blank');
    }

    switchTab(tabName) {
        document.querySelectorAll('.menu-tab').forEach(tab => {
            tab.classList.toggle('active', tab.textContent.toLowerCase() === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === 'tab-' + tabName);
        });
        // Update search filter
        document.getElementById('searchFilter').value = tabName;
        this.doSearch();
    }

    doSearch() {
        const query = document.getElementById('searchInput').value.toLowerCase().trim();
        const filter = document.getElementById('searchFilter').value;

        if (filter === 'all' || filter === 'produk') {
            this.filteredProduk = this.produk.filter(p => {
                if (!query) return true;
                return (
                    (p.nama && p.nama.toLowerCase().includes(query)) ||
                    (p.layanan && p.layanan.toLowerCase().includes(query)) ||
                    (p.kategori && p.kategori.toLowerCase().includes(query)) ||
                    (p.subkategori && p.subkategori.toLowerCase().includes(query)) ||
                    (p.warna && p.warna.toLowerCase().includes(query)) ||
                    (p.deskripsi && p.deskripsi.toLowerCase().includes(query))
                );
            });
            this.renderProdukGrid();
        }

        if (filter === 'all' || filter === 'portfolio') {
            this.filteredPortfolio = this.portfolio.filter(p => {
                if (!query) return true;
                return (
                    (p.judul && p.judul.toLowerCase().includes(query)) ||
                    (p.kategori && p.kategori.toLowerCase().includes(query)) ||
                    (p.deskripsi && p.deskripsi.toLowerCase().includes(query))
                );
            });
            this.renderPortfolioGrid();
        }
    }

    async loadAllData() {
        await Promise.all([
            this.loadProduk(),
            this.loadPortfolio()
        ]);
    }

    // ========== PRODUK ==========
    async loadProduk() {
        try {
            const res = await this.fetchAPI('/api/collections/produk/records?per-page=500&sort=-created');
            this.produk = res.items || [];
            this.filteredProduk = [...this.produk];
            this.renderProdukGrid();
        } catch (e) {
            console.error('Error loading produk:', e);
            this.produk = [];
            this.filteredProduk = [];
            this.renderProdukGrid();
        }
    }

    renderProdukGrid() {
        const container = document.getElementById('produkGrid');
        const countEl = document.getElementById('produkCount');
        countEl.textContent = `${this.filteredProduk.length} produk`;

        if (this.filteredProduk.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: span 2;">
                    <div class="icon">📦</div>
                    <p>Belum ada produk</p>
                    <button class="btn btn-primary btn-sm" onclick="admin.showAddProductModal()" style="margin-top:10px;">+ Tambah</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredProduk.map(p => {
            const imgUrl = p.image ? `${this.pocketbaseUrl}/api/files/produk/${p.id}/${p.image}` : '';
            const imgCount = p.images?.length || 0;
            return `
                <div class="product-card" onclick="admin.editProduct('${p.id}')">
                    <div class="product-img">
                        ${imgUrl ? `<img src="${imgUrl}" alt="${p.nama}">` : '📷'}
                        ${imgCount > 0 ? `<span class="product-img-count">+${imgCount}</span>` : ''}
                    </div>
                    <div class="product-info">
                        <h4>${p.nama || ''}</h4>
                        <p class="price">${p.harga ? this.formatRupiah(p.harga) : ''}</p>
                        <p class="category">${p.layanan || ''}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    showAddProductModal() {
        this.editingProductId = null;
        this.productImages = [];
        document.getElementById('productModalTitle').textContent = 'Tambah Produk';
        document.getElementById('productName').value = '';
        document.getElementById('productLayanan').value = 'Jasa Desain';
        document.getElementById('productKategori').value = '';
        document.getElementById('productSubkategori').value = '';
        document.getElementById('productWarna').value = '';
        document.getElementById('productHarga').value = '';
        document.getElementById('productDeskripsi').value = '';
        document.getElementById('productWhatsapp').value = '';
        document.getElementById('uploadedImagesList').innerHTML = '';
        document.getElementById('deleteProductBtn').style.display = 'none';
        document.getElementById('productModal').classList.add('show');
    }

    async editProduct(id) {
        const product = this.produk.find(p => p.id === id);
        if (!product) return;

        this.editingProductId = id;
        document.getElementById('productModalTitle').textContent = 'Edit Produk';
        document.getElementById('productName').value = product.nama || '';
        document.getElementById('productLayanan').value = product.layanan || 'Jasa Desain';
        document.getElementById('productKategori').value = product.kategori || '';
        document.getElementById('productSubkategori').value = product.subkategori || '';
        document.getElementById('productWarna').value = product.warna || '';
        document.getElementById('productHarga').value = product.harga || '';
        document.getElementById('productDeskripsi').value = product.deskripsi || '';
        document.getElementById('productWhatsapp').value = product.nowa || '';
        document.getElementById('deleteProductBtn').style.display = 'block';

        this.productImages = [];
        if (product.image) {
            this.productImages.push({
                url: `${this.pocketbaseUrl}/api/files/produk/${id}/${product.image}`,
                warna: product.warna || '',
                deskripsi: product.deskripsi || ''
            });
        }
        if (product.images && product.images.length) {
            for (const img of product.images) {
                this.productImages.push({
                    url: `${this.pocketbaseUrl}/api/files/produk/${id}/${img}`,
                    warna: '',
                    deskripsi: ''
                });
            }
        }
        this.renderUploadedImages('product');
        document.getElementById('productModal').classList.add('show');
    }

    handleProductImageUpload(input) {
        this.currentImageContext = 'product';
        this.handleImageUpload(input);
    }

    handleImageUpload(input) {
        const files = Array.from(input.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const images = this.currentImageContext === 'product' ? this.productImages : this.portfolioImages;
                images.push({ file: file, url: e.target.result, warna: '', deskripsi: '' });
                this.renderUploadedImages(this.currentImageContext);
            };
            reader.readAsDataURL(file);
        });
        input.value = '';
    }

    renderUploadedImages(context) {
        const containerId = context === 'product' ? 'uploadedImagesList' : 'portfolioImagesList';
        const container = document.getElementById(containerId);
        const images = context === 'product' ? this.productImages : this.portfolioImages;

        container.innerHTML = images.map((img, index) => `
            <div class="uploaded-img">
                <img src="${img.url}" alt="Image ${index + 1}">
                <button class="delete-btn" onclick="admin.removeImage(${index}, '${context}')">&times;</button>
                <button class="edit-btn" onclick="admin.showImageDetail(${index}, '${context}')">✎</button>
            </div>
        `).join('');
    }

    removeImage(index, context) {
        if (context === 'product') {
            this.productImages.splice(index, 1);
            this.renderUploadedImages('product');
        } else {
            this.portfolioImages.splice(index, 1);
            this.renderUploadedImages('portfolio');
        }
    }

    showImageDetail(index, context) {
        this.currentImageContext = context;
        this.editingImageIndex = index;
        const images = context === 'product' ? this.productImages : this.portfolioImages;
        const img = images[index];

        document.getElementById('imageDetailPreview').src = img.url;
        document.getElementById('imageWarna').value = img.warna || '';
        document.getElementById('imageDeskripsi').value = img.deskripsi || '';
        document.getElementById('imageDetailModal').classList.add('show');
    }

    closeImageDetailModal() {
        document.getElementById('imageDetailModal').classList.remove('show');
    }

    saveImageDetail() {
        const images = this.currentImageContext === 'product' ? this.productImages : this.portfolioImages;
        images[this.editingImageIndex].warna = document.getElementById('imageWarna').value;
        images[this.editingImageIndex].deskripsi = document.getElementById('imageDeskripsi').value;
        this.closeImageDetailModal();
        this.showNotification('Detail gambar disimpan', 'success');
    }

    deleteCurrentImage() {
        const images = this.currentImageContext === 'product' ? this.productImages : this.portfolioImages;
        images.splice(this.editingImageIndex, 1);
        this.renderUploadedImages(this.currentImageContext);
        this.closeImageDetailModal();
    }

    async saveProduct() {
        const nama = document.getElementById('productName').value.trim();
        const layanan = document.getElementById('productLayanan').value;
        const kategori = document.getElementById('productKategori').value.trim();
        const subkategori = document.getElementById('productSubkategori').value.trim();
        const warna = document.getElementById('productWarna').value.trim();
        const harga = document.getElementById('productHarga').value;
        const deskripsi = document.getElementById('productDeskripsi').value;
        const nowa = document.getElementById('productWhatsapp').value;

        if (!nama) {
            this.showNotification('Nama produk wajib diisi', 'error');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('nama', nama);
            formData.append('layanan', layanan);
            formData.append('kategori', kategori);
            formData.append('subkategori', subkategori);
            formData.append('warna', warna);
            formData.append('harga', harga || 0);
            formData.append('deskripsi', deskripsi);
            formData.append('nowa', nowa);

            this.productImages.forEach((img, index) => {
                if (img.file) {
                    if (index === 0) formData.append('image', img.file);
                    else formData.append('images', img.file);
                }
            });

            let method = 'POST';
            let url = '/api/collections/produk/records';
            if (this.editingProductId) {
                method = 'PATCH';
                url += '/' + this.editingProductId;
            }

            const res = await fetch(this.pocketbaseUrl + url, {
                method: method,
                headers: { 'Authorization': 'Admin ' + this.pocketbaseToken },
                body: formData
            });

            if (res.ok) {
                this.closeModal('productModal');
                await this.loadProduk();
                this.showNotification('Produk disimpan', 'success');
            } else {
                throw new Error('Save failed');
            }
        } catch (e) {
            this.showNotification('Gagal menyimpan produk', 'error');
        }
    }

    async deleteProduct() {
        if (!this.editingProductId) return;
        if (!confirm('Hapus produk ini?')) return;

        try {
            await this.fetchAPI(`/api/collections/produk/records/${this.editingProductId}`, 'DELETE');
            this.closeModal('productModal');
            await this.loadProduk();
            this.showNotification('Produk dihapus', 'success');
        } catch (e) {
            this.showNotification('Gagal menghapus produk', 'error');
        }
    }

    // ========== PORTFOLIO ==========
    async loadPortfolio() {
        try {
            const res = await this.fetchAPI('/api/collections/portfolio/records?per-page=500&sort=-created');
            this.portfolio = res.items || [];
            this.filteredPortfolio = [...this.portfolio];
            this.renderPortfolioGrid();
        } catch (e) {
            console.error('Error loading portfolio:', e);
            this.portfolio = [];
            this.filteredPortfolio = [];
            this.renderPortfolioGrid();
        }
    }

    renderPortfolioGrid() {
        const container = document.getElementById('portfolioGrid');
        const countEl = document.getElementById('portfolioCount');
        countEl.textContent = `${this.filteredPortfolio.length} portfolio`;

        if (this.filteredPortfolio.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: span 2;">
                    <div class="icon">🎨</div>
                    <p>Belum ada portfolio</p>
                    <button class="btn btn-primary btn-sm" onclick="admin.showAddPortfolioModal()" style="margin-top:10px;">+ Tambah</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredPortfolio.map(p => {
            const imgUrl = p.image ? `${this.pocketbaseUrl}/api/files/portfolio/${p.id}/${p.image}` : '';
            const imgCount = p.images?.length || 0;
            return `
                <div class="product-card" onclick="admin.editPortfolio('${p.id}')">
                    <div class="product-img">
                        ${imgUrl ? `<img src="${imgUrl}" alt="${p.judul}">` : '🎨'}
                        ${imgCount > 0 ? `<span class="product-img-count">+${imgCount}</span>` : ''}
                    </div>
                    <div class="product-info">
                        <h4>${p.judul || ''}</h4>
                        <p class="category">${p.kategori || ''}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    showAddPortfolioModal() {
        this.editingPortfolioId = null;
        this.portfolioImages = [];
        this.currentImageContext = 'portfolio';
        document.getElementById('portfolioModalTitle').textContent = 'Tambah Portfolio';
        document.getElementById('portfolioJudul').value = '';
        document.getElementById('portfolioKategori').value = '';
        document.getElementById('portfolioDeskripsi').value = '';
        document.getElementById('portfolioImagesList').innerHTML = '';
        document.getElementById('deletePortfolioBtn').style.display = 'none';
        document.getElementById('portfolioModal').classList.add('show');
    }

    async editPortfolio(id) {
        const portfolio = this.portfolio.find(p => p.id === id);
        if (!portfolio) return;

        this.editingPortfolioId = id;
        this.currentImageContext = 'portfolio';
        document.getElementById('portfolioModalTitle').textContent = 'Edit Portfolio';
        document.getElementById('portfolioJudul').value = portfolio.judul || '';
        document.getElementById('portfolioKategori').value = portfolio.kategori || '';
        document.getElementById('portfolioDeskripsi').value = portfolio.deskripsi || '';
        document.getElementById('deletePortfolioBtn').style.display = 'block';

        this.portfolioImages = [];
        if (portfolio.image) {
            this.portfolioImages.push({
                url: `${this.pocketbaseUrl}/api/files/portfolio/${id}/${portfolio.image}`,
                warna: '',
                deskripsi: ''
            });
        }
        if (portfolio.images && portfolio.images.length) {
            for (const img of portfolio.images) {
                this.portfolioImages.push({
                    url: `${this.pocketbaseUrl}/api/files/portfolio/${id}/${img}`,
                    warna: '',
                    deskripsi: ''
                });
            }
        }
        this.renderUploadedImages('portfolio');
        document.getElementById('portfolioModal').classList.add('show');
    }

    handlePortfolioImageUpload(input) {
        this.currentImageContext = 'portfolio';
        this.handleImageUpload(input);
    }

    async savePortfolio() {
        const judul = document.getElementById('portfolioJudul').value.trim();
        const kategori = document.getElementById('portfolioKategori').value.trim();
        const deskripsi = document.getElementById('portfolioDeskripsi').value;

        if (!judul) {
            this.showNotification('Judul portfolio wajib diisi', 'error');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('judul', judul);
            formData.append('kategori', kategori);
            formData.append('deskripsi', deskripsi);

            this.portfolioImages.forEach((img, index) => {
                if (img.file) {
                    if (index === 0) formData.append('image', img.file);
                    else formData.append('images', img.file);
                }
            });

            let method = 'POST';
            let url = '/api/collections/portfolio/records';
            if (this.editingPortfolioId) {
                method = 'PATCH';
                url += '/' + this.editingPortfolioId;
            }

            const res = await fetch(this.pocketbaseUrl + url, {
                method: method,
                headers: { 'Authorization': 'Admin ' + this.pocketbaseToken },
                body: formData
            });

            if (res.ok) {
                this.closeModal('portfolioModal');
                await this.loadPortfolio();
                this.showNotification('Portfolio disimpan', 'success');
            } else {
                throw new Error('Save failed');
            }
        } catch (e) {
            this.showNotification('Gagal menyimpan portfolio', 'error');
        }
    }

    async deletePortfolio() {
        if (!this.editingPortfolioId) return;
        if (!confirm('Hapus portfolio ini?')) return;

        try {
            await this.fetchAPI(`/api/collections/portfolio/records/${this.editingPortfolioId}`, 'DELETE');
            this.closeModal('portfolioModal');
            await this.loadPortfolio();
            this.showNotification('Portfolio dihapus', 'success');
        } catch (e) {
            this.showNotification('Gagal menghapus portfolio', 'error');
        }
    }

    // ========== HELPERS ==========
    async fetchAPI(endpoint, method = 'GET', body = null) {
        const options = {
            method: method,
            headers: {
                'Authorization': 'Admin ' + this.pocketbaseToken,
                'Content-Type': 'application/json'
            }
        };
        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }
        const res = await fetch(this.pocketbaseUrl + endpoint, options);
        if (!res.ok) throw new Error('API Error: ' + res.status);
        return res.json();
    }

    closeModal(id) {
        document.getElementById(id).classList.remove('show');
    }

    showNotification(message, type = 'success') {
        const el = document.getElementById('notification');
        el.textContent = message;
        el.className = 'notification ' + type;
        setTimeout(() => el.className = 'notification', 3000);
    }

    formatRupiah(n) {
        if (n >= 1000000) return 'Rp ' + (n/1000000).toFixed(1) + 'Jt';
        if (n >= 1000) return 'Rp ' + Math.round(n/1000) + 'Rb';
        return 'Rp ' + n.toLocaleString('id-ID');
    }
}

const admin = new AdminDashboard();
