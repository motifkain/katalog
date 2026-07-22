/**
 * MOTIFKAIN ADMIN DASHBOARD
 */
class AdminDashboard {
    constructor() {
        this.kategori = [];
        this.produk = [];
        this.welcomeSettings = null;
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

    async fetchAPI(endpoint, options) {
        options = options || {};
        const headers = { 'Authorization': this.pocketbaseToken };
        if (options.headers) Object.assign(headers, options.headers);
        if (options.body && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        return fetch(this.pocketbaseUrl + endpoint, {
            method: options.method || 'GET',
            headers: headers,
            body: options.body
        });
    }

    async loadData() {
        await this.loadWelcomeSettings();
        await this.loadKategori();
        await this.loadProduk();
    }

    async loadWelcomeSettings() {
        const col = window.MOTIFKAIN_CONFIG?.welcomeCollection || 'welcome_settings';
        try {
            const res = await this.fetchAPI('/api/collections/' + col + '/records?per-page=1');
            if (res.ok) {
                const data = await res.json();
                if (data.items && data.items.length > 0) {
                    this.welcomeSettings = data.items[0];
                    this.renderWelcomeSettings();
                } else {
                    this.welcomeSettings = { title: 'CATALOG', subtitle: 'Company Profile', description: 'Koleksi produk eksklusif kami' };
                    this.renderWelcomeSettings();
                }
            }
        } catch (e) {
            this.welcomeSettings = { title: 'CATALOG', subtitle: 'Company Profile', description: 'Koleksi produk eksklusif kami' };
            this.renderWelcomeSettings();
        }
    }

    renderWelcomeSettings() {
        if (!this.welcomeSettings) return;
        const ws = this.welcomeSettings;
        const wsForm = document.getElementById('wsForm');
        if (wsForm) {
            wsForm.title.value = ws.title || '';
            wsForm.subtitle.value = ws.subtitle || '';
            wsForm.description.value = ws.description || '';
        }
    }

    async saveWelcomeSettings() {
        const form = document.getElementById('wsForm');
        if (!form) return;

        const data = {
            title: form.title.value,
            subtitle: form.subtitle.value,
            description: form.description.value
        };

        const col = window.MOTIFKAIN_CONFIG?.welcomeCollection || 'welcome_settings';
        const self = this;

        try {
            if (this.welcomeSettings && this.welcomeSettings.id) {
                await this.fetchAPI('/api/collections/' + col + '/records/' + this.welcomeSettings.id, {
                    method: 'PATCH',
                    body: JSON.stringify(data)
                });
                this.welcomeSettings = Object.assign(this.welcomeSettings, data);
            } else {
                const res = await this.fetchAPI('/api/collections/' + col + '/records', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                if (res.ok) {
                    const created = await res.json();
                    this.welcomeSettings = Object.assign(created, data);
                }
            }
            this.showNotification('Berhasil disimpan!', 'success');
        } catch (e) {
            this.showNotification('Gagal menyimpan: ' + e.message, 'error');
        }
    }

    async loadKategori() {
        const col = window.MOTIFKAIN_CONFIG?.kategoriCollection || 'kategori';
        try {
            const res = await this.fetchAPI('/api/collections/' + col + '/records?sort=order');
            if (res.ok) {
                const data = await res.json();
                this.kategori = data.items || [];
            }
        } catch (e) {
            this.kategori = [
                { id: 'desain-motif', name: 'Desain Motif', slug: 'desain-motif' },
                { id: 'printing', name: 'Printing Kain', slug: 'printing' },
                { id: 'pakaian', name: 'Pakaian Jadi', slug: 'pakaian' },
                { id: 'asesoris', name: 'Asesoris', slug: 'asesoris' }
            ];
        }
        this.renderKategori();
    }

    async loadProduk() {
        const col = window.MOTIFKAIN_CONFIG?.produkCollection || 'produk';
        try {
            const res = await this.fetchAPI('/api/collections/' + col + '/records?per-page=500&sort=-created');
            if (res.ok) {
                const data = await res.json();
                this.produk = data.items || [];
            }
        } catch (e) {
            this.produk = [];
        }
        this.renderProduk();
    }

    setupTabs() {
        var tabs = document.querySelectorAll('.tab-btn');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener('click', (function(tab) {
                for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove('active');
                tab.classList.add('active');
                var tabName = tab.dataset.tab;
                var contents = document.querySelectorAll('.tab-content');
                for (var k = 0; k < contents.length; k++) contents[k].classList.remove('active');
                var target = document.getElementById('tab-' + tabName);
                if (target) target.classList.add('active');
            }).bind(null, tabs[i]));
        }
    }

    setupForms() {
        var self = this;
        var form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                var email = document.getElementById('emailInput').value;
                var password = document.getElementById('passwordInput').value;
                self.login(email, password);
            });
        }

        var wsSave = document.getElementById('wsSaveBtn');
        if (wsSave) wsSave.addEventListener('click', function() { self.saveWelcomeSettings(); });
    }

    renderKategori() {
        var container = document.getElementById('kategoriList');
        if (!container) return;

        if (this.kategori.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Belum ada kategori</p>';
            return;
        }

        var html = '';
        for (var i = 0; i < this.kategori.length; i++) {
            var k = this.kategori[i];
            html += '<div class="kategori-item">';
            html += '<div class="kategori-icon">' + (k.name.charAt ? k.name.charAt(0).toUpperCase() : '?') + '</div>';
            html += '<div class="kategori-info">';
            html += '<div class="kategori-name">' + k.name + '</div>';
            html += '<div class="kategori-slug">' + k.slug + '</div>';
            html += '</div>';
            html += '<div class="kategori-actions">';
            html += '<button class="btn btn-sm" onclick="admin.editKategori(\'' + k.id + '\')">Edit</button> ';
            html += '<button class="btn btn-sm btn-danger" onclick="admin.deleteKategori(\'' + k.id + '\')">Hapus</button>';
            html += '</div></div>';
        }
        container.innerHTML = html;
    }

    showAddKategoriModal() {
        this.currentKategori = null;
        document.getElementById('katModalTitle').textContent = 'Tambah Kategori';
        document.getElementById('katName').value = '';
        document.getElementById('katSlug').value = '';
        document.getElementById('katOrder').value = this.kategori.length;
        document.getElementById('katModal').classList.add('active');
    }

    editKategori(id) {
        var k = null;
        for (var i = 0; i < this.kategori.length; i++) {
            if (this.kategori[i].id === id) { k = this.kategori[i]; break; }
        }
        if (!k) return;

        this.currentKategori = k;
        document.getElementById('katModalTitle').textContent = 'Edit Kategori';
        document.getElementById('katName').value = k.name || '';
        document.getElementById('katSlug').value = k.slug || '';
        document.getElementById('katOrder').value = k.order || 0;
        document.getElementById('katModal').classList.add('active');
    }

    async saveKategori() {
        var name = document.getElementById('katName').value.trim();
        var slug = document.getElementById('katSlug').value.trim().toLowerCase().replace(/\s+/g, '-');
        var order = parseInt(document.getElementById('katOrder').value) || 0;

        if (!name || !slug) {
            this.showNotification('Nama dan slug wajib diisi!', 'error');
            return;
        }

        var data = { name: name, slug: slug, order: order };

        var col = window.MOTIFKAIN_CONFIG?.kategoriCollection || 'kategori';
        var self = this;

        try {
            if (this.currentKategori) {
                await this.fetchAPI('/api/collections/' + col + '/records/' + this.currentKategori.id, { method: 'PATCH', body: JSON.stringify(data) });
            } else {
                await this.fetchAPI('/api/collections/' + col + '/records', { method: 'POST', body: JSON.stringify(data) });
            }
            this.showNotification('Berhasil disimpan!', 'success');
        } catch (e) {
            this.showNotification('Gagal menyimpan: ' + e.message, 'error');
        }

        this.closeModal('katModal');
        await this.loadKategori();
    }

    async deleteKategori(id) {
        if (!confirm('Yakin ingin menghapus?')) return;
        var col = window.MOTIFKAIN_CONFIG?.kategoriCollection || 'kategori';
        try {
            await this.fetchAPI('/api/collections/' + col + '/records/' + id, { method: 'DELETE' });
            this.showNotification('Berhasil dihapus!', 'success');
        } catch (e) {
            this.showNotification('Gagal menghapus: ' + e.message, 'error');
        }
        await this.loadKategori();
    }

    renderProduk() {
        var container = document.getElementById('produkGrid');
        if (!container) return;

        var filterKat = document.getElementById('filterKategori');
        var filterVal = filterKat ? filterKat.value : '';
        var searchVal = (document.getElementById('searchProduk') || { value: '' }).value.toLowerCase();

        var filtered = this.produk;
        if (filterVal) {
            filtered = [];
            for (var i = 0; i < this.produk.length; i++) {
                if (this.produk[i].kategori === filterVal) filtered.push(this.produk[i]);
            }
        }
        if (searchVal) {
            var filtered2 = [];
            for (var j = 0; j < filtered.length; j++) {
                var p = filtered[j];
                if ((p.nama && p.nama.toLowerCase().includes(searchVal)) || (p.deskripsi && p.deskripsi.toLowerCase().includes(searchVal))) {
                    filtered2.push(p);
                }
            }
            filtered = filtered2;
        }

        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Belum ada produk</p>';
            return;
        }

        var html = '';
        for (var k = 0; k < filtered.length; k++) {
            var prod = filtered[k];
            var imgUrl = prod.image ? this.pocketbaseUrl + '/api/files/' + (window.MOTIFKAIN_CONFIG?.produkCollection || 'produk') + '/' + prod.id + '/' + prod.image : 'https://via.placeholder.com/300x300?text=No+Image';
            var harga = prod.harga ? 'Rp ' + prod.harga.toLocaleString('id-ID') : 'Hubungi Kami';
            html += '<div class="produk-item">';
            html += '<div class="produk-image"><img src="' + imgUrl + '" alt="' + (prod.nama || '') + '"></div>';
            html += '<div class="produk-info">';
            html += '<div class="produk-name">' + (prod.nama || '-') + '</div>';
            html += '<div class="produk-price">' + harga + '</div>';
            html += '<div class="produk-meta">' + (prod.kategori || '-') + ' / ' + (prod.subkategori || '-') + '</div>';
            html += '<div class="produk-actions">';
            html += '<button class="edit-btn" onclick="admin.editProduk(\'' + prod.id + '\')">Edit</button> ';
            html += '<button class="delete-btn" onclick="admin.deleteProduk(\'' + prod.id + '\')">Hapus</button>';
            html += '</div></div></div>';
        }
        container.innerHTML = html;

        this.populateKategoriDropdown();
    }

    populateKategoriDropdown() {
        var selects = document.querySelectorAll('#productKategori, #filterKategori');
        for (var s = 0; s < selects.length; s++) {
            var sel = selects[s];
            var cur = sel.value;
            var html = '<option value="">Semua Kategori</option>';
            for (var i = 0; i < this.kategori.length; i++) {
                var k = this.kategori[i];
                html += '<option value="' + k.slug + '">' + k.name + '</option>';
            }
            sel.innerHTML = html;
            sel.value = cur;
        }
    }

    showAddProductModal() {
        this.currentProduk = null;
        document.getElementById('prodModalTitle').textContent = 'Tambah Produk';
        var fields = ['productName', 'productKategori', 'productSubkategori', 'productHarga', 'productDeskripsi', 'productToko', 'productDaerah'];
        for (var i = 0; i < fields.length; i++) {
            var f = document.getElementById(fields[i]);
            if (f) f.value = fields[i] === 'productToko' ? 'MotifKain' : '';
        }
        var upload = document.getElementById('productImageUpload');
        var preview = document.getElementById('productImagePreview');
        if (upload) upload.classList.remove('has-image');
        if (preview) { preview.src = ''; preview.style.display = 'none'; }
        document.getElementById('productModal').classList.add('active');
    }

    editProduk(id) {
        var p = null;
        for (var i = 0; i < this.produk.length; i++) {
            if (this.produk[i].id === id) { p = this.produk[i]; break; }
        }
        if (!p) return;

        this.currentProduk = p;
        document.getElementById('prodModalTitle').textContent = 'Edit Produk';
        document.getElementById('productName').value = p.nama || '';
        document.getElementById('productKategori').value = p.kategori || '';
        document.getElementById('productSubkategori').value = p.subkategori || '';
        document.getElementById('productHarga').value = p.harga || '';
        document.getElementById('productDeskripsi').value = p.deskripsi || '';
        document.getElementById('productToko').value = p.namatoko || 'MotifKain';
        document.getElementById('productDaerah').value = p.daerah || '';

        if (p.image) {
            var imgUrl = this.pocketbaseUrl + '/api/files/' + (window.MOTIFKAIN_CONFIG?.produkCollection || 'produk') + '/' + p.id + '/' + p.image;
            document.getElementById('productImagePreview').src = imgUrl;
            document.getElementById('productImagePreview').style.display = 'block';
            document.getElementById('productImageUpload').classList.add('has-image');
        }

        document.getElementById('productModal').classList.add('active');
    }

    handleImageUpload(input) {
        var file = input.files[0];
        if (!file) return;
        var reader = new FileReader();
        var preview = document.getElementById('productImagePreview');
        var upload = document.getElementById('productImageUpload');
        var self = this;
        reader.onload = function(e) {
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
                if (upload) upload.classList.add('has-image');
            }
        };
        reader.readAsDataURL(file);
    }

    async saveProduk() {
        var nama = document.getElementById('productName').value.trim();
        var kategori = document.getElementById('productKategori').value;
        var subkategori = document.getElementById('productSubkategori').value.trim();
        var harga = parseInt(document.getElementById('productHarga').value) || 0;
        var deskripsi = document.getElementById('productDeskripsi').value.trim();
        var namatoko = document.getElementById('productToko').value.trim() || 'MotifKain';
        var daerah = document.getElementById('productDaerah').value.trim();
        var imgEl = document.getElementById('productImagePreview');
        var imgData = imgEl && imgEl.src && imgEl.style.display !== 'none' ? imgEl.src : null;

        if (!nama) {
            this.showNotification('Nama produk wajib diisi!', 'error');
            return;
        }

        var formData = new FormData();
        formData.append('nama', nama);
        if (kategori) formData.append('kategori', kategori);
        if (subkategori) formData.append('subkategori', subkategori);
        if (harga) formData.append('harga', harga);
        if (deskripsi) formData.append('deskripsi', deskripsi);
        formData.append('namatoko', namatoko);
        if (daerah) formData.append('daerah', daerah);

        if (imgData && imgData.startsWith('data:')) {
            var blob = this.dataURLtoBlob(imgData);
            formData.append('image', blob, 'image.jpg');
        }

        var col = window.MOTIFKAIN_CONFIG?.produkCollection || 'produk';

        try {
            if (this.currentProduk) {
                await this.fetchAPI('/api/collections/' + col + '/records/' + this.currentProduk.id, { method: 'PATCH', body: formData });
                this.showNotification('Berhasil disimpan!', 'success');
            } else {
                await this.fetchAPI('/api/collections/' + col + '/records', { method: 'POST', body: formData });
                this.showNotification('Berhasil ditambahkan!', 'success');
            }
        } catch (e) {
            this.showNotification('Gagal menyimpan: ' + e.message, 'error');
        }
        this.closeModal('productModal');
        await this.loadProduk();
    }

    async deleteProduk(id) {
        if (!confirm('Yakin ingin menghapus produk ini?')) return;
        var col = window.MOTIFKAIN_CONFIG?.produkCollection || 'produk';
        try {
            await this.fetchAPI('/api/collections/' + col + '/records/' + id, { method: 'DELETE' });
            this.showNotification('Berhasil dihapus!', 'success');
        } catch (e) {
            this.showNotification('Gagal menghapus: ' + e.message, 'error');
        }
        await this.loadProduk();
    }

    closeModal(id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('active');
    }

    dataURLtoBlob(dataurl) {
        var arr = dataurl.split(',');
        var mime = arr[0].match(/:(.*?);/)[1];
        var bstr = atob(arr[1]);
        var n = bstr.length;
        var u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new Blob([u8arr], { type: mime });
    }

    showNotification(msg, type) {
        type = type || '';
        var notif = document.getElementById('notification');
        notif.textContent = msg;
        notif.className = 'notification show' + (type ? ' ' + type : '');
        var self = this;
        setTimeout(function() { notif.classList.remove('show'); }, 3000);
    }
}

var admin;
document.addEventListener('DOMContentLoaded', function() { admin = new AdminDashboard(); });
