/**
 * MOTIFKAIN ADMIN DASHBOARD
 * Logic untuk Dashboard Admin
 */

class AdminDashboard {
    constructor() {
        this.kategori = [];
        this.produk = [];
        this.pages = [];
        this.currentKategori = null;
        this.currentProduk = null;
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
            if (savedEmail) {
                document.getElementById('userEmail').textContent = savedEmail;
            }
            this.loadData();
        } else {
            this.showLogin();
        }

        this.setupTabs();
        this.setupForms();
    }

    showLogin() {
        document.getElementById('loginSection').style.display = 'flex';
        document.getElementById('dashboardSection').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
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
                document.getElementById('userEmail').textContent = email;
                this.showDashboard();
                this.loadData();
            } else {
                this.showNotification('Email atau password salah!', 'error');
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
        window.open('index.html', '_blank');
    }

    async fetchAPI(endpoint, options = {}) {
        const headers = { 'Authorization': this.pocketbaseToken, ...options.headers };
        if (options.body && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        return fetch(this.pocketbaseUrl + endpoint, { ...options, headers });
    }

    async loadData() {
        await this.loadKategori();
        await this.loadProduk();
        await this.loadPages();
    }

    async loadKategori() {
        try {
            const res = await this.fetchAPI('/api/collections/kategori/records?sort=order');
            if (res.ok) {
                const data = await res.json();
                this.kategori = data.items || [];
            }
        } catch (e) {
            this.kategori = [
                { id: 'desain-motif', name: 'Desain Motif', slug: 'desain-motif', order: 0 },
                { id: 'printing', name: 'Printing Kain', slug: 'printing', order: 1 },
                { id: 'pakaian', name: 'Pakaian Jadi', slug: 'pakaian', order: 2 },
                { id: 'asesoris', name: 'Asesoris', slug: 'asesoris', order: 3 }
            ];
        }
        this.renderKategori();
    }

    async loadProduk() {
        try {
            const res = await this.fetchAPI('/api/collections/produk/records?per-page=500&sort=-created');
            if (res.ok) {
                const data = await res.json();
                this.produk = data.items || [];
            }
        } catch (e) {
            this.produk = [];
        }
        this.renderProduk();
        this.updateKategoriDropdown();
    }

    async loadPages() {
        try {
            const res = await this.fetchAPI('/api/collections/catalog_pages/records?sort=order');
            if (res.ok) {
                const data = await res.json();
                this.pages = data.items || [];
            }
        } catch (e) {
            this.pages = [];
        }
        this.renderPages();
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        const self = this;
        tabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                tabs.forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
                document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
                document.getElementById('tab-' + this.dataset.tab).classList.add('active');
            });
        });
    }

    setupForms() {
        const self = this;
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('emailInput').value;
            const password = document.getElementById('passwordInput').value;
            self.login(email, password);
        });
    }

    renderKategori() {
        const container = document.getElementById('kategoriList');
        if (!container) return;

        if (this.kategori.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Belum ada kategori</p>';
            return;
        }

        const self = this;
        container.innerHTML = this.kategori.map(function(k) {
            return '<div class="kategori-item">' +
                '<div class="kategori-icon">' + k.name.charAt(0) + '</div>' +
                '<div class="kategori-info">' +
                    '<div class="kategori-name">' + k.name + '</div>' +
                    '<div class="kategori-slug">' + k.slug + '</div>' +
                '</div>' +
                '<div class="kategori-actions">' +
                    '<button onclick="admin.editKategori(\'' + k.id + '\')" title="Edit">Edit</button>' +
                    '<button onclick="admin.deleteKategori(\'' + k.id + '\')" title="Hapus">Hapus</button>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    showAddKategoriModal() {
        this.currentKategori = null;
        document.getElementById('kategoriModalTitle').textContent = 'Tambah Kategori';
        document.getElementById('kategoriName').value = '';
        document.getElementById('kategoriSlug').value = '';
        document.getElementById('kategoriOrder').value = this.kategori.length;
        document.getElementById('kategoriModal').classList.add('active');
    }

    editKategori(id) {
        const k = this.kategori.find(function(item) { return item.id === id; });
        if (!k) return;
        this.currentKategori = k;
        document.getElementById('kategoriModalTitle').textContent = 'Edit Kategori';
        document.getElementById('kategoriName').value = k.name;
        document.getElementById('kategoriSlug').value = k.slug;
        document.getElementById('kategoriOrder').value = k.order || 0;
        document.getElementById('kategoriModal').classList.add('active');
    }

    async saveKategori() {
        const name = document.getElementById('kategoriName').value.trim();
        const slug = document.getElementById('kategoriSlug').value.trim().toLowerCase().replace(/\s+/g, '-');
        const order = parseInt(document.getElementById('kategoriOrder').value) || 0;

        if (!name || !slug) {
            this.showNotification('Nama dan slug wajib diisi!', 'error');
            return;
        }

        const data = { name: name, slug: slug, order: order };
        const self = this;

        try {
            if (this.currentKategori) {
                await this.fetchAPI('/api/collections/kategori/records/' + this.currentKategori.id, {
                    method: 'PATCH',
                    body: JSON.stringify(data)
                });
            } else {
                await this.fetchAPI('/api/collections/kategori/records', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
            }
            this.showNotification('Berhasil disimpan!', 'success');
        } catch (e) {
            this.showNotification('Gagal menyimpan', 'error');
        }

        this.closeModal('kategoriModal');
        await this.loadKategori();
    }

    async deleteKategori(id) {
        if (!confirm('Yakin ingin menghapus?')) return;
        try {
            await this.fetchAPI('/api/collections/kategori/records/' + id, { method: 'DELETE' });
            this.showNotification('Berhasil dihapus!', 'success');
        } catch (e) {
            this.showNotification('Gagal menghapus', 'error');
        }
        await this.loadKategori();
    }

    renderProduk() {
        const container = document.getElementById('produkGrid');
        if (!container) return;

        const filterKategori = (document.getElementById('filterKategori') || { value: '' }).value;
        const searchQuery = ((document.getElementById('searchProduct') || { value: '' }).value || '').toLowerCase();

        let filtered = this.produk;

        if (filterKategori) {
            filtered = filtered.filter(function(p) { return p.kategori === filterKategori; });
        }

        if (searchQuery) {
            filtered = filtered.filter(function(p) {
                return (p.nama || '').toLowerCase().includes(searchQuery) ||
                       (p.deskripsi || '').toLowerCase().includes(searchQuery);
            });
        }

        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Belum ada produk</p>';
            return;
        }

        const self = this;
        container.innerHTML = filtered.map(function(p) {
            const imageUrl = p.image
                ? self.pocketbaseUrl + '/api/files/produk/' + p.id + '/' + p.image
                : 'https://via.placeholder.com/400x300?text=No+Image';
            const harga = p.harga ? 'Rp ' + p.harga.toLocaleString('id-ID') : 'Hubungi Kami';

            return '<div class="produk-item">' +
                '<div class="produk-image"><img src="' + imageUrl + '" alt="' + (p.nama || '') + '"></div>' +
                '<div class="produk-info">' +
                    '<div class="produk-name">' + (p.nama || '-') + '</div>' +
                    '<div class="produk-price">' + harga + '</div>' +
                    '<div class="produk-meta">' + (p.kategori || '-') + ' / ' + (p.subkategori || '-') + '</div>' +
                    '<div class="produk-actions">' +
                        '<button class="edit-btn" onclick="admin.editProduk(\'' + p.id + '\')">Edit</button>' +
                        '<button class="delete-btn" onclick="admin.deleteProduk(\'' + p.id + '\')">Hapus</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    filterProducts() { this.renderProduk(); }

    updateKategoriDropdown() {
        const selects = document.querySelectorAll('#productKategori, #filterKategori');
        const self = this;
        selects.forEach(function(select) {
            const currentVal = select.value;
            select.innerHTML = '<option value="">Semua Kategori</option>' +
                self.kategori.map(function(k) {
                    return '<option value="' + k.slug + '">' + k.name + '</option>';
                }).join('');
            select.value = currentVal;
        });
    }

    showAddProductModal() {
        this.currentProduk = null;
        document.getElementById('productModalTitle').textContent = 'Tambah Produk';
        document.getElementById('productName').value = '';
        document.getElementById('productKategori').value = '';
        document.getElementById('productSubkategori').value = '';
        document.getElementById('productHarga').value = '';
        document.getElementById('productDeskripsi').value = '';
        document.getElementById('productToko').value = 'MotifKain';
        document.getElementById('productDaerah').value = '';
        document.getElementById('productImageUpload').classList.remove('has-image');
        document.getElementById('productImagePreview').style.display = 'none';
        document.getElementById('productModal').classList.add('active');
    }

    editProduk(id) {
        const p = this.produk.find(function(item) { return item.id === id; });
        if (!p) return;

        this.currentProduk = p;
        document.getElementById('productModalTitle').textContent = 'Edit Produk';
        document.getElementById('productName').value = p.nama || '';
        document.getElementById('productKategori').value = p.kategori || '';
        document.getElementById('productSubkategori').value = p.subkategori || '';
        document.getElementById('productHarga').value = p.harga || '';
        document.getElementById('productDeskripsi').value = p.deskripsi || '';
        document.getElementById('productToko').value = p.namatoko || 'MotifKain';
        document.getElementById('productDaerah').value = p.daerah || '';

        if (p.image) {
            const imageUrl = this.pocketbaseUrl + '/api/files/produk/' + p.id + '/' + p.image;
            document.getElementById('productImagePreview').src = imageUrl;
            document.getElementById('productImagePreview').style.display = 'block';
            document.getElementById('productImageUpload').classList.add('has-image');
        }

        document.getElementById('productModal').classList.add('active');
    }

    handleImageUpload(input) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        const preview = document.getElementById('productImagePreview');
        const upload = document.getElementById('productImageUpload');
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            upload.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }

    async saveProduct() {
        const nama = document.getElementById('productName').value.trim();
        const kategori = document.getElementById('productKategori').value;
        const subkategori = document.getElementById('productSubkategori').value.trim();
        const harga = parseInt(document.getElementById('productHarga').value) || 0;
        const deskripsi = document.getElementById('productDeskripsi').value.trim();
        const namatoko = document.getElementById('productToko').value.trim() || 'MotifKain';
        const daerah = document.getElementById('productDaerah').value.trim();
        const imagePreview = document.getElementById('productImagePreview');
        const imageData = imagePreview.src && imagePreview.style.display !== 'none' ? imagePreview.src : null;

        if (!nama) {
            this.showNotification('Nama produk wajib diisi!', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('nama', nama);
        if (kategori) formData.append('kategori', kategori);
        if (subkategori) formData.append('subkategori', subkategori);
        if (harga) formData.append('harga', harga);
        if (deskripsi) formData.append('deskripsi', deskripsi);
        formData.append('namatoko', namatoko);
        if (daerah) formData.append('daerah', daerah);

        if (imageData && imageData.startsWith('data:')) {
            const blob = this.dataURLtoBlob(imageData);
            formData.append('image', blob, 'image.jpg');
        }

        try {
            if (this.currentProduk) {
                await this.fetchAPI('/api/collections/produk/records/' + this.currentProduk.id, {
                    method: 'PATCH',
                    body: formData
                });
            } else {
                await this.fetchAPI('/api/collections/produk/records', {
                    method: 'POST',
                    body: formData
                });
            }
            this.showNotification('Berhasil disimpan!', 'success');
        } catch (e) {
            this.showNotification('Gagal menyimpan', 'error');
        }

        this.closeModal('productModal');
        await this.loadProduk();
    }

    async deleteProduk(id) {
        if (!confirm('Yakin ingin menghapus produk ini?')) return;
        try {
            await this.fetchAPI('/api/collections/produk/records/' + id, { method: 'DELETE' });
            this.showNotification('Berhasil dihapus!', 'success');
        } catch (e) {
            this.showNotification('Gagal menghapus', 'error');
        }
        await this.loadProduk();
    }

    renderPages() {
        const container = document.getElementById('pagesList');
        if (!container) return;

        if (this.pages.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Belum ada halaman</p>';
            return;
        }

        const self = this;
        container.innerHTML = this.pages.map(function(p, i) {
            return '<div class="page-item' + (i === 0 ? ' active' : '') + '" onclick="admin.selectPage(' + i + ')">' +
                '<strong>' + (i + 1) + '.</strong> ' + (p.mainTitle || p.title || 'Halaman ' + (i + 1)) +
            '</div>';
        }).join('');
    }

    selectPage(index) {
        document.querySelectorAll('.page-item').forEach(function(el, i) {
            el.classList.toggle('active', i === index);
        });

        const preview = document.getElementById('pagePreview');
        if (this.pages[index]) {
            const page = this.pages[index];
            const pageData = {
                ...page,
                image: page.image ? this.pocketbaseUrl + '/api/files/catalog_pages/' + page.id + '/' + page.image : '',
                logo: page.logo ? this.pocketbaseUrl + '/api/files/catalog_pages/' + page.id + '/' + page.logo : ''
            };
            preview.innerHTML = '<div style="width:300px;height:400px;">' + PageTemplates.renderPage(pageData, index + 1) + '</div>';
        }
    }.bind(this);

    async addPage() {
        const newPage = { ...PageTemplates.createEmptyPage('cover-dark'), order: this.pages.length };
        try {
            const formData = new FormData();
            formData.append('template', newPage.template);
            formData.append('order', newPage.order);
            formData.append('mainTitle', newPage.mainTitle || '');
            formData.append('subtitle', newPage.subtitle || '');
            formData.append('description', newPage.description || '');

            const res = await this.fetchAPI('/api/collections/catalog_pages/records', {
                method: 'POST',
                body: formData
            });
            if (res.ok) this.showNotification('Halaman baru ditambahkan!', 'success');
        } catch (e) {
            this.showNotification('Gagal menambahkan halaman', 'error');
        }
        await this.loadPages();
    }

    closeModal(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    }

    dataURLtoBlob(dataurl) {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new Blob([u8arr], { type: mime });
    }

    showNotification(message, type) {
        type = type || '';
        const notif = document.getElementById('notification');
        notif.textContent = message;
        notif.className = 'notification show' + (type ? ' ' + type : '');
        setTimeout(function() { notif.classList.remove('show'); }, 3000);
    }
}

let admin;
document.addEventListener('DOMContentLoaded', function() {
    admin = new AdminDashboard();
});
