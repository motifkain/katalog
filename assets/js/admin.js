/**
 * MOTIFKAIN ADMIN DASHBOARD
 * Earth Tone Theme
 */

class AdminDashboard {
    constructor() {
        this.produk = [];
        this.editingProductId = null;
        this.productImages = []; // Array of {file, url, warna, deskripsi}
        this.pocketbaseToken = '';
        this.pocketbaseUrl = '';
        this.init();
    }

    init() {
        const savedToken = sessionStorage.getItem('motifkain_admin_token');
        const savedUrl = sessionStorage.getItem('motifkain_admin_url');
        const savedEmail = sessionStorage.getItem('motifkain_admin_email');

        if (savedToken && savedUrl) {
            this.pocketbaseToken = savedToken;
            this.pocketbaseUrl = savedUrl;
            this.showDashboard();
            this.loadProduk();
        } else {
            this.showLogin();
        }

        this.setupForms();
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
            this.showNotification('PocketBase URL belum diset di config.js', 'error');
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
                sessionStorage.setItem('motifkain_admin_email', email);
                this.showDashboard();
                this.loadProduk();
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
        sessionStorage.removeItem('motifkain_admin_email');
        this.showLogin();
    }

    openCatalog() {
        window.open('https://katalog.motifkain.com', '_blank');
    }

    setupForms() {
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('emailInput').value;
            const password = document.getElementById('passwordInput').value;
            this.login(email, password);
        });
    }

    async loadProduk() {
        try {
            const res = await this.fetchAPI('/api/collections/produk/records?per-page=500&sort=-created');
            this.produk = res.items || [];
            this.renderProducts();
        } catch (e) {
            console.error('Error loading produk:', e);
            this.produk = [];
            this.renderProducts();
        }
    }

    renderProducts() {
        const container = document.getElementById('productsGrid');

        if (this.produk.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📦</div>
                    <p>Belum ada produk</p>
                    <button class="btn btn-primary btn-sm" onclick="admin.showAddProductModal()" style="margin-top: 12px;">+ Tambah Produk</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.produk.map(p => {
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
        document.getElementById('productHarga').value = product.harga || '';
        document.getElementById('productDeskripsi').value = product.deskripsi || '';
        document.getElementById('productWhatsapp').value = product.nowa || product.whatsapp || '';
        document.getElementById('deleteProductBtn').style.display = 'block';

        // Load existing images
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
        this.renderUploadedImages();

        document.getElementById('productModal').classList.add('show');
    }

    handleImageUpload(input) {
        const files = Array.from(input.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.productImages.push({
                    file: file,
                    url: e.target.result,
                    warna: '',
                    deskripsi: ''
                });
                this.renderUploadedImages();
            };
            reader.readAsDataURL(file);
        });
        input.value = '';
    }

    renderUploadedImages() {
        const container = document.getElementById('uploadedImagesList');
        container.innerHTML = this.productImages.map((img, index) => `
            <div class="uploaded-img">
                <img src="${img.url}" alt="Image ${index + 1}">
                <button class="delete-btn" onclick="admin.removeImage(${index})">&times;</button>
                <button class="edit-btn" onclick="admin.showImageDetail(${index})">✎</button>
            </div>
        `).join('');
    }

    removeImage(index) {
        this.productImages.splice(index, 1);
        this.renderUploadedImages();
    }

    showImageDetail(index) {
        this.editingImageIndex = index;
        const img = this.productImages[index];
        document.getElementById('imageDetailPreview').src = img.url;
        document.getElementById('imageWarna').value = img.warna || '';
        document.getElementById('imageDeskripsi').value = img.deskripsi || '';
        document.getElementById('imageDetailModal').classList.add('show');
    }

    closeImageDetailModal() {
        document.getElementById('imageDetailModal').classList.remove('show');
    }

    saveImageDetail() {
        const index = this.editingImageIndex;
        if (index === undefined) return;

        this.productImages[index].warna = document.getElementById('imageWarna').value;
        this.productImages[index].deskripsi = document.getElementById('imageDeskripsi').value;
        this.closeImageDetailModal();
        this.showNotification('Detail gambar disimpan', 'success');
    }

    deleteImage() {
        const index = this.editingImageIndex;
        if (index === undefined) return;
        this.productImages.splice(index, 1);
        this.renderUploadedImages();
        this.closeImageDetailModal();
    }

    async saveProduct() {
        const nama = document.getElementById('productName').value.trim();
        const layanan = document.getElementById('productLayanan').value;
        const kategori = document.getElementById('productKategori').value.trim();
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
            formData.append('harga', harga || 0);
            formData.append('deskripsi', deskripsi);
            formData.append('nowa', nowa);

            // Append images
            this.productImages.forEach((img, index) => {
                if (img.file) {
                    if (index === 0) {
                        formData.append('image', img.file);
                    } else {
                        formData.append('images', img.file);
                    }
                }
            });

            // Append warna & deskripsi for first image
            if (this.productImages.length > 0) {
                formData.append('warna', this.productImages[0].warna || '');
            }

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
            this.showNotification('Gagal menyimpan produk: ' + e.message, 'error');
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

// Initialize
const admin = new AdminDashboard();
