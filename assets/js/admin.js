/**
 * MOTIFKAIN ADMIN DASHBOARD
 * Struktur: Produk → Warna → Gambar
 */

class AdminDashboard {
    constructor() {
        this.produk = [];
        this.portfolio = [];
        this.filteredProduk = [];
        this.filteredPortfolio = [];

        // State untuk produk editing
        this.editingProdukId = null;
        this.warnaItems = []; // Array of { id: null, nama: '', images: [{id: null, file: null, url: '', deskripsi: ''}] }
        this.editingImageWarnaIndex = null;
        this.editingImageIndex = null;

        // State untuk portfolio
        this.editingPortfolioId = null;
        this.portfolioImages = [];

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
                    (p.kategori && p.kategori.toLowerCase().includes(query)) ||
                    (p.subkategori && p.subkategori.toLowerCase().includes(query)) ||
                    (p.layanan && p.layanan.toLowerCase().includes(query)) ||
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
            // Load all produk
            const res = await this.fetchAPI(
                '/api/collections/produk/records?per-page=500&sort=-created'
            );
            this.produk = res.items || [];

            // Load all warna
            const warnaRes = await this.fetchAPI(
                '/api/collections/warna/records?per-page=500'
            );
            const allWarna = warnaRes.items || [];

            // Load all gambar
            const gambarRes = await this.fetchAPI(
                '/api/collections/gambar/records?per-page=1000'
            );
            const allGambar = gambarRes.items || [];

            // Match warna to produk
            for (const p of this.produk) {
                // Find all warna for this produk
                const produkWarna = allWarna.filter(w => w.produk === p.id);

                // For each warna, find its gambar
                p.warnaList = produkWarna.map(warna => {
                    const warnaGambar = allGambar.filter(g => g.warna === warna.id);
                    return {
                        ...warna,
                        images: warnaGambar.map(g => ({
                            id: g.id,
                            gambar: g.gambar,
                            deskripsi: g.deskripsi
                        }))
                    };
                });
            }

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
            // Get first image from first warna
            let imgUrl = '';
            let totalImages = 0;
            if (p.warnaList && p.warnaList.length > 0) {
                for (const warna of p.warnaList) {
                    if (warna.images && warna.images.length > 0) {
                        imgUrl = `${this.pocketbaseUrl}/api/files/gambar/${warna.images[0].id}/${warna.images[0].gambar}`;
                        break;
                    }
                }
                for (const warna of p.warnaList) {
                    totalImages += warna.images?.length || 0;
                }
            }
            const warnaCount = p.warnaList?.length || 0;

            return `
                <div class="product-card" onclick="admin.editProduct('${p.id}')">
                    <div class="product-img">
                        ${imgUrl ? `<img src="${imgUrl}" alt="${p.nama}">` : '📷'}
                        ${totalImages > 0 ? `<span class="product-img-count">${warnaCount} warna</span>` : ''}
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

    // ===== PRODUK MODAL =====
    showAddProductModal() {
        this.editingProdukId = null;
        this.warnaItems = [];
        document.getElementById('productModalTitle').textContent = 'Tambah Produk';
        document.getElementById('productName').value = '';
        document.getElementById('productKategori').value = '';
        document.getElementById('productSubkategori').value = '';
        document.getElementById('productLayanan').value = 'Jasa Desain';
        document.getElementById('productHarga').value = '';
        document.getElementById('productDeskripsi').value = '';
        document.getElementById('deleteProductBtn').style.display = 'none';
        document.getElementById('warnaList').innerHTML = '';
        document.getElementById('warnaEmptyHint').style.display = 'block';
        document.getElementById('productModal').classList.add('show');
    }

    async editProduct(id) {
        const produk = this.produk.find(p => p.id === id);
        if (!produk) return;

        this.editingProdukId = id;
        document.getElementById('productModalTitle').textContent = 'Edit Produk';
        document.getElementById('productName').value = produk.nama || '';
        document.getElementById('productKategori').value = produk.kategori || '';
        document.getElementById('productSubkategori').value = produk.subkategori || '';
        document.getElementById('productLayanan').value = produk.layanan || 'Jasa Desain';
        document.getElementById('productHarga').value = produk.harga || '';
        document.getElementById('productDeskripsi').value = produk.deskripsi || '';
        document.getElementById('deleteProductBtn').style.display = 'block';

        // Load warna with gambar
        this.warnaItems = [];
        if (produk.warnaList && produk.warnaList.length > 0) {
            for (const warna of produk.warnaList) {
                const warnaData = {
                    id: warna.id,
                    nama: warna.nama || '',
                    images: []
                };

                // Load gambar for this warna
                try {
                    const gambarRes = await this.fetchAPI(
                        `/api/collections/gambar/records?filter=warna="${warna.id}"&sort=created`
                    );
                    if (gambarRes.items) {
                        for (const img of gambarRes.items) {
                            warnaData.images.push({
                                id: img.id,
                                file: null,
                                url: `${this.pocketbaseUrl}/api/files/gambar/${img.id}/${img.gambar}`,
                                deskripsi: img.deskripsi || ''
                            });
                        }
                    }
                } catch (e) {
                    console.error('Error loading gambar:', e);
                }

                this.warnaItems.push(warnaData);
            }
        }

        this.renderWarnaList();
        document.getElementById('productModal').classList.add('show');
    }

    // ===== WARNA MANAGEMENT =====
    addWarnaItem() {
        this.warnaItems.push({
            id: null,
            nama: '',
            images: []
        });
        this.renderWarnaList();
    }

    removeWarnaItem(btn) {
        const item = btn.closest('.warna-item');
        const index = Array.from(document.querySelectorAll('.warna-item')).indexOf(item);
        if (index > -1) {
            this.warnaItems.splice(index, 1);
            this.renderWarnaList();
        }
    }

    renderWarnaList() {
        const container = document.getElementById('warnaList');
        const hint = document.getElementById('warnaEmptyHint');

        if (this.warnaItems.length === 0) {
            container.innerHTML = '';
            hint.style.display = 'block';
            return;
        }

        hint.style.display = 'none';
        container.innerHTML = this.warnaItems.map((warna, warnaIndex) => `
            <div class="warna-item" data-warna-id="${warna.id || ''}">
                <div class="warna-item-header">
                    <input type="text" class="form-input warna-name-input"
                           placeholder="Nama Warna (cth: Merah Maroon)"
                           value="${warna.nama}"
                           onchange="admin.updateWarnaName(${warnaIndex}, this.value)"
                           style="flex:1;margin-bottom:0;">
                    <button class="btn btn-danger btn-sm"
                            onclick="admin.removeWarnaItem(this)"
                            title="Hapus Warna">&times;</button>
                </div>
                <div class="gambar-list">
                    ${warna.images.map((img, imgIndex) => `
                        <div class="gambar-thumb"
                             onclick="admin.showImageDetail(${warnaIndex}, ${imgIndex})">
                            <img src="${img.url}" alt="Gambar">
                            ${img.file ? '<span style="position:absolute;top:0;left:0;background:#6B8E23;color:white;font-size:8px;padding:1px 4px;">baru</span>' : ''}
                            <button class="gambar-delete"
                                    onclick="event.stopPropagation(); admin.removeGambar(${warnaIndex}, ${imgIndex})">&times;</button>
                        </div>
                    `).join('')}
                </div>
                <div class="image-upload-area-sm"
                     onclick="admin.triggerImageUpload(this, ${warnaIndex})">
                    <span>+ Tambah Gambar</span>
                </div>
                <input type="file" class="warna-image-input-${warnaIndex}"
                       accept="image/*" multiple
                       style="display:none"
                       onchange="admin.handleWarnaImageUpload(this, ${warnaIndex})">
            </div>
        `).join('');
    }

    updateWarnaName(index, value) {
        if (this.warnaItems[index]) {
            this.warnaItems[index].nama = value;
        }
    }

    triggerImageUpload(el, warnaIndex) {
        const input = el.parentElement.querySelector(`input[type="file"]`);
        if (input) input.click();
    }

    handleWarnaImageUpload(input, warnaIndex) {
        const files = Array.from(input.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.warnaItems[warnaIndex].images.push({
                    id: null,
                    file: file,
                    url: e.target.result,
                    deskripsi: ''
                });
                this.renderWarnaList();
            };
            reader.readAsDataURL(file);
        });
        input.value = '';
    }

    removeGambar(warnaIndex, imgIndex) {
        this.warnaItems[warnaIndex].images.splice(imgIndex, 1);
        this.renderWarnaList();
    }

    // ===== IMAGE DETAIL MODAL =====
    showImageDetail(warnaIndex, imgIndex) {
        this.editingImageWarnaIndex = warnaIndex;
        this.editingImageIndex = imgIndex;
        const img = this.warnaItems[warnaIndex].images[imgIndex];

        document.getElementById('imageDetailPreview').src = img.url;
        document.getElementById('imageDeskripsi').value = img.deskripsi || '';
        document.getElementById('imageDetailModal').classList.add('show');
    }

    closeImageDetailModal() {
        document.getElementById('imageDetailModal').classList.remove('show');
    }

    saveImageDetail() {
        const deskripsi = document.getElementById('imageDeskripsi').value;
        this.warnaItems[this.editingImageWarnaIndex].images[this.editingImageIndex].deskripsi = deskripsi;
        this.closeImageDetailModal();
        this.showNotification('Deskripsi gambar disimpan', 'success');
    }

    deleteCurrentImage() {
        this.warnaItems[this.editingImageWarnaIndex].images.splice(this.editingImageIndex, 1);
        this.renderWarnaList();
        this.closeImageDetailModal();
    }

    // ===== SAVE PRODUK =====
    async saveProduct() {
        const nama = document.getElementById('productName').value.trim();
        const kategori = document.getElementById('productKategori').value.trim();
        const subkategori = document.getElementById('productSubkategori').value.trim();
        const layanan = document.getElementById('productLayanan').value;
        const harga = document.getElementById('productHarga').value;
        const deskripsi = document.getElementById('productDeskripsi').value;

        if (!nama) {
            this.showNotification('Nama produk wajib diisi', 'error');
            return;
        }

        try {
            // 1. Save/update produk
            const formDataProduk = new FormData();
            formDataProduk.append('nama', nama);
            formDataProduk.append('kategori', kategori);
            formDataProduk.append('subkategori', subkategori);
            formDataProduk.append('layanan', layanan);
            formDataProduk.append('harga', harga || 0);
            formDataProduk.append('deskripsi', deskripsi);

            let produkId = this.editingProdukId;
            let method = 'POST';
            let url = '/api/collections/produk/records';

            if (produkId) {
                method = 'PATCH';
                url += '/' + produkId;
            }

            const produkRes = await fetch(this.pocketbaseUrl + url, {
                method: method,
                headers: { 'Authorization': 'Admin ' + this.pocketbaseToken },
                body: formDataProduk
            });

            if (!produkRes.ok) throw new Error('Gagal menyimpan produk');

            if (!produkId) {
                const produkData = await produkRes.json();
                produkId = produkData.id;
            }

            // 2. Get existing warna IDs for this produk (to track deletions)
            const existingWarnaRes = await this.fetchAPI(
                `/api/collections/warna/records?filter=produk="${produkId}"`
            );
            const existingWarnaIds = (existingWarnaRes.items || []).map(w => w.id);

            // 3. Process each warna
            const newWarnaIds = [];
            for (const warna of this.warnaItems) {
                // Skip empty warna
                if (!warna.nama.trim() && warna.images.length === 0) continue;

                const formDataWarna = new FormData();
                formDataWarna.append('nama', warna.nama);
                // PocketBase relation: Single use ID, Multiple use comma-separated IDs
                formDataWarna.append('produk', produkId);

                let warnaId = warna.id;
                let warnaMethod = 'POST';
                let warnaUrl = '/api/collections/warna/records';

                if (warnaId) {
                    warnaMethod = 'PATCH';
                    warnaUrl += '/' + warnaId;
                    newWarnaIds.push(warnaId);
                }

                const warnaRes = await fetch(this.pocketbaseUrl + warnaUrl, {
                    method: warnaMethod,
                    headers: { 'Authorization': 'Admin ' + this.pocketbaseToken },
                    body: formDataWarna
                });

                if (!warnaRes.ok) {
                    const errorData = await warnaRes.json();
                    console.error('Warna save error:', errorData);
                    throw new Error('Gagal menyimpan warna: ' + JSON.stringify(errorData));
                }

                if (!warnaId) {
                    const warnaData = await warnaRes.json();
                    warnaId = warnaData.id;
                    newWarnaIds.push(warnaId);
                }

                // 4. Process gambar for this warna
                const existingGambarRes = await this.fetchAPI(
                    `/api/collections/gambar/records?filter=warna="${warnaId}"`
                );
                const existingGambarIds = (existingGambarRes.items || []).map(g => g.id);
                const newGambarIds = [];

                for (const img of warna.images) {
                    // Only upload new images (no id)
                    if (img.file) {
                        const formDataGambar = new FormData();
                        formDataGambar.append('gambar', img.file);
                        formDataGambar.append('deskripsi', img.deskripsi || '');
                        formDataGambar.append('warna', warnaId);

                        const gambarRes = await fetch(this.pocketbaseUrl + '/api/collections/gambar/records', {
                            method: 'POST',
                            headers: { 'Authorization': 'Admin ' + this.pocketbaseToken },
                            body: formDataGambar
                        });

                        if (!gambarRes.ok) throw new Error('Gagal menyimpan gambar');
                        const gambarData = await gambarRes.json();
                        newGambarIds.push(gambarData.id);
                    } else if (img.id) {
                        // Update deskripsi for existing image
                        newGambarIds.push(img.id);
                        if (img.deskripsi !== undefined) {
                            await this.fetchAPI(`/api/collections/gambar/records/${img.id}`, 'PATCH', {
                                deskripsi: img.deskripsi
                            });
                        }
                    }
                }

                // Delete removed gambar
                for (const oldGambarId of existingGambarIds) {
                    if (!newGambarIds.includes(oldGambarId)) {
                        await this.fetchAPI(`/api/collections/gambar/records/${oldGambarId}`, 'DELETE');
                    }
                }

                // Update gambar relation in warna record
                if (newGambarIds.length > 0) {
                    await this.fetchAPI(`/api/collections/warna/records/${warnaId}`, 'PATCH', {
                        gambar: newGambarIds.join(',')
                    });
                }
            }

            // Delete removed warna
            for (const oldWarnaId of existingWarnaIds) {
                if (!newWarnaIds.includes(oldWarnaId)) {
                    // Delete all gambar in this warna first
                    const oldGambarRes = await this.fetchAPI(
                        `/api/collections/gambar/records?filter=warna="${oldWarnaId}"`
                    );
                    for (const g of (oldGambarRes.items || [])) {
                        await this.fetchAPI(`/api/collections/gambar/records/${g.id}`, 'DELETE');
                    }
                    // Delete warna
                    await this.fetchAPI(`/api/collections/warna/records/${oldWarnaId}`, 'DELETE');
                }
            }

            this.closeModal('productModal');
            await this.loadProduk();
            this.showNotification('Produk disimpan', 'success');

        } catch (e) {
            console.error('Error saving produk:', e);
            this.showNotification('Gagal menyimpan produk: ' + e.message, 'error');
        }
    }

    async deleteProduct() {
        if (!this.editingProdukId) return;
        if (!confirm('Hapus produk ini beserta semua warnanya?')) return;

        try {
            // Delete all warna and their gambar
            const warnaRes = await this.fetchAPI(
                `/api/collections/warna/records?filter=produk="${this.editingProdukId}"`
            );

            for (const warna of (warnaRes.items || [])) {
                const gambarRes = await this.fetchAPI(
                    `/api/collections/gambar/records?filter=warna="${warna.id}"`
                );
                for (const g of (gambarRes.items || [])) {
                    await this.fetchAPI(`/api/collections/gambar/records/${g.id}`, 'DELETE');
                }
                await this.fetchAPI(`/api/collections/warna/records/${warna.id}`, 'DELETE');
            }

            // Delete produk
            await this.fetchAPI(`/api/collections/produk/records/${this.editingProdukId}`, 'DELETE');

            this.closeModal('productModal');
            await this.loadProduk();
            this.showNotification('Produk dihapus', 'success');
        } catch (e) {
            console.error('Error deleting produk:', e);
            this.showNotification('Gagal menghapus produk', 'error');
        }
    }

    // ========== PORTFOLIO ==========
    async loadPortfolio() {
        try {
            const res = await this.fetchAPI('/api/collections/portofolio/records?per-page=500&sort=-created');
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
            const imgUrl = p.image ? `${this.pocketbaseUrl}/api/files/portofolio/${p.id}/${p.image}` : '';
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
        document.getElementById('portfolioModalTitle').textContent = 'Tambah Portfolio';
        document.getElementById('portfolioJudul').value = '';
        document.getElementById('portfolioKategori').value = '';
        document.getElementById('portfolioDeskripsi').value = '';
        document.getElementById('portfolioImagesList').innerHTML = '';
        document.getElementById('deletePortfolioBtn').style.display = 'none';
        document.getElementById('portfolioModal').classList.add('show');
    }

    editPortfolio(id) {
        const portfolio = this.portfolio.find(p => p.id === id);
        if (!portfolio) return;

        this.editingPortfolioId = id;
        document.getElementById('portfolioModalTitle').textContent = 'Edit Portfolio';
        document.getElementById('portfolioJudul').value = portfolio.judul || '';
        document.getElementById('portfolioKategori').value = portfolio.kategori || '';
        document.getElementById('portfolioDeskripsi').value = portfolio.deskripsi || '';
        document.getElementById('deletePortfolioBtn').style.display = 'block';

        this.portfolioImages = [];
        if (portfolio.image) {
            this.portfolioImages.push({
                id: null,
                file: null,
                url: `${this.pocketbaseUrl}/api/files/portofolio/${id}/${portfolio.image}`,
                deskripsi: ''
            });
        }
        if (portfolio.images && portfolio.images.length) {
            for (const img of portfolio.images) {
                this.portfolioImages.push({
                    id: null,
                    file: null,
                    url: `${this.pocketbaseUrl}/api/files/portofolio/${id}/${img}`,
                    deskripsi: ''
                });
            }
        }
        this.renderPortfolioImages();
        document.getElementById('portfolioModal').classList.add('show');
    }

    renderPortfolioImages() {
        const container = document.getElementById('portfolioImagesList');
        container.innerHTML = this.portfolioImages.map((img, index) => `
            <div class="uploaded-img">
                <img src="${img.url}" alt="Image ${index + 1}">
                <button class="delete-btn" onclick="admin.removePortfolioImage(${index})">&times;</button>
            </div>
        `).join('');
    }

    removePortfolioImage(index) {
        this.portfolioImages.splice(index, 1);
        this.renderPortfolioImages();
    }

    handlePortfolioImageUpload(input) {
        const files = Array.from(input.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.portfolioImages.push({
                    id: null,
                    file: file,
                    url: e.target.result,
                    deskripsi: ''
                });
                this.renderPortfolioImages();
            };
            reader.readAsDataURL(file);
        });
        input.value = '';
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

            // Append new images
            this.portfolioImages.forEach((img, index) => {
                if (img.file) {
                    if (index === 0) formData.append('image', img.file);
                    else formData.append('images', img.file);
                }
            });

            let method = 'POST';
            let url = '/api/collections/portofolio/records';
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
            console.error('Error saving portfolio:', e);
            this.showNotification('Gagal menyimpan portfolio', 'error');
        }
    }

    async deletePortfolio() {
        if (!this.editingPortfolioId) return;
        if (!confirm('Hapus portfolio ini?')) return;

        try {
            await this.fetchAPI(`/api/collections/portofolio/records/${this.editingPortfolioId}`, 'DELETE');
            this.closeModal('portfolioModal');
            await this.loadPortfolio();
            this.showNotification('Portfolio dihapus', 'success');
        } catch (e) {
            console.error('Error deleting portfolio:', e);
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
        // Handle empty response (DELETE requests return empty body)
        const text = await res.text();
        return text ? JSON.parse(text) : {};
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
        return 'Rp ' + (n || 0).toLocaleString('id-ID');
    }
}

const admin = new AdminDashboard();
