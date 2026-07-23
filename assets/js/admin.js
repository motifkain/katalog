/**
 * MOTIFKAIN ADMIN DASHBOARD
 */
class AdminDashboard {
    constructor() {
        this.layanan = [];
        this.kategori = [];
        this.produk = [];
        this.welcomeSettings = null;
        this.welcomeLogoData = null;
        this.welcomeBgData = null;
        this.allWelcomeScreens = []; // Array untuk menyimpan semua welcome screen
        this.activeWelcomeScreenId = null; // ID welcome screen yang aktif ditampilkan
        this.currentLayanan = null;
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

    previewWelcomeScreen() {
        // Ambil data terbaru dari form
        const ws = {
            template: document.querySelector('.template-btn.active')?.dataset.template || 'cover-dark',
            colorTheme: document.querySelector('.theme-btn.active')?.dataset.theme || 'elegant-gold',
            fontFamily: document.getElementById('wsFont').value || 'Playfair Display',
            title: document.getElementById('wsTitle').value || 'CATALOG',
            subtitle: document.getElementById('wsSubtitle').value || 'Company Profile',
            description: document.getElementById('wsDescription').value || 'Koleksi produk eksklusif kami',
            leftText: document.getElementById('wsLeftText').value || 'Deskripsi singkat tentang\nkoleksi atau perusahaan Anda.',
            backgroundOpacity: parseInt(document.getElementById('wsBgOpacity').value) || 50,
            logoSize: parseInt(document.getElementById('wsLogoSize').value) || 60,
            logoX: parseInt(document.getElementById('wsLogoX').value) || 50,
            logoY: parseInt(document.getElementById('wsLogoY').value) || 10,
            titleSize: parseInt(document.getElementById('wsTitleSize').value) || 32,
            titleX: parseInt(document.getElementById('wsTitleX').value) || 50,
            titleY: parseInt(document.getElementById('wsTitleY').value) || 50,
            subtitleSize: parseInt(document.getElementById('wsSubtitleSize').value) || 14,
            subtitleX: parseInt(document.getElementById('wsSubtitleX').value) || 50,
            subtitleY: parseInt(document.getElementById('wsSubtitleY').value) || 70,
            backgroundImage: this.welcomeBgData || (this.welcomeSettings?.backgroundImage ? this.pocketbaseUrl + '/api/files/' + (window.MOTIFKAIN_CONFIG?.welcomeCollection || 'welcome_settings') + '/' + this.welcomeSettings.id + '/' + this.welcomeSettings.backgroundImage : null),
            logo: this.welcomeLogoData || (this.welcomeSettings?.logo ? this.pocketbaseUrl + '/api/files/' + (window.MOTIFKAIN_CONFIG?.welcomeCollection || 'welcome_settings') + '/' + this.welcomeSettings.id + '/' + this.welcomeSettings.logo : null)
        };

        const theme = this.getThemeColors(ws.colorTheme);
        let html = '';

        switch(ws.template) {
            case 'cover-dark':
                html = this.renderPreviewDark(ws, theme);
                break;
            case 'cover-light':
                html = this.renderPreviewLight(ws, theme);
                break;
            case 'cover-split':
                html = this.renderPreviewSplit(ws, theme);
                break;
            case 'cover-numbered':
                html = this.renderPreviewNumbered(ws, theme);
                break;
            case 'cover-minimal':
                html = this.renderPreviewMinimal(ws, theme);
                break;
            default:
                html = this.renderPreviewDark(ws, theme);
        }

        // Buat modal preview
        const modal = document.createElement('div');
        modal.id = 'previewModal';
        modal.className = 'preview-modal';
        modal.innerHTML = `
            <div class="preview-modal-content">
                <div class="preview-modal-header">
                    <h3>Preview Welcome Screen</h3>
                    <button onclick="this.closest('.preview-modal').remove()">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                </div>
                <div class="preview-modal-body">
                    <div class="preview-phone-frame">
                        <div class="preview-phone-screen">
                            ${html}
                        </div>
                    </div>
                </div>
                <div class="preview-modal-footer">
                    <button class="btn btn-outline" onclick="this.closest('.preview-modal').remove()">Tutup</button>
                </div>
            </div>
        `;

        // Hapus modal lama jika ada
        const oldModal = document.getElementById('previewModal');
        if (oldModal) oldModal.remove();

        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    async fetchAPI(endpoint, options) {
        options = options || {};
        const headers = { 'Authorization': 'Bearer ' + this.pocketbaseToken };
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
        await this.loadLayanan();
        await this.loadAllWelcomeScreens();
        await this.loadKategori();
        await this.loadProduk();
    }

    // ===== MULTIPLE WELCOME SCREENS =====
    async loadAllWelcomeScreens() {
        const col = window.MOTIFKAIN_CONFIG?.welcomeCollection || 'welcome_settings';
        try {
            const res = await this.fetchAPI('/api/collections/' + col + '/records?per-page=500&sort=-created');
            if (res.ok) {
                const data = await res.json();
                this.allWelcomeScreens = data.items || [];
            } else {
                this.allWelcomeScreens = [];
            }
        } catch (e) {
            this.allWelcomeScreens = [];
        }
        this.renderWelcomeScreensList();
    }

    renderWelcomeScreensList() {
        const container = document.getElementById('welcomeScreensGrid');
        if (!container) return;

        if (this.allWelcomeScreens.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Belum ada welcome screen. Klik tombol "+ Welcome Screen Baru" untuk membuat.</p>';
            return;
        }

        const templateNames = {
            'cover-dark': 'Gelap',
            'cover-light': 'Terang',
            'cover-split': 'Split',
            'cover-numbered': 'Nomor',
            'cover-minimal': 'Minimal'
        };

        let html = '<div class="ws-grid">';
        for (let i = 0; i < this.allWelcomeScreens.length; i++) {
            const ws = this.allWelcomeScreens[i];
            const templateName = templateNames[ws.template] || 'Default';
            const isActive = ws.id === this.activeWelcomeScreenId;
            const bgUrl = ws.backgroundImage ? this.pocketbaseUrl + '/api/files/' + (window.MOTIFKAIN_CONFIG?.welcomeCollection || 'welcome_settings') + '/' + ws.id + '/' + ws.backgroundImage : null;
            const logoUrl = ws.logo ? this.pocketbaseUrl + '/api/files/' + (window.MOTIFKAIN_CONFIG?.welcomeCollection || 'welcome_settings') + '/' + ws.id + '/' + ws.logo : null;

            html += '<div class="ws-card ' + (isActive ? 'ws-card-active' : '') + '">';
            html += '<div class="ws-card-preview">';
            if (bgUrl) {
                html += '<div class="ws-card-bg" style="background-image:url(' + bgUrl + ')"></div>';
            } else {
                html += '<div class="ws-card-bg ws-card-bg-default"></div>';
            }
            if (logoUrl) {
                html += '<img src="' + logoUrl + '" class="ws-card-logo" alt="Logo">';
            }
            html += '<div class="ws-card-title">' + (ws.title || 'Untitled') + '</div>';
            html += '</div>';
            html += '<div class="ws-card-info">';
            html += '<div class="ws-card-template"><span class="ws-badge">' + templateName + '</span></div>';
            html += '<div class="ws-card-name">' + (ws.title || 'Tanpa Judul') + '</div>';
            html += '<div class="ws-card-date">' + (ws.created ? new Date(ws.created).toLocaleDateString('id-ID') : '') + '</div>';
            html += '</div>';
            html += '<div class="ws-card-actions">';
            html += '<button class="btn btn-sm" onclick="admin.editWelcomeScreen(\'' + ws.id + '\')">Edit</button> ';
            html += '<button class="btn btn-sm btn-outline" onclick="admin.duplicateWelcomeScreen(\'' + ws.id + '\')">Duplikat</button> ';
            if (!isActive) {
                html += '<button class="btn btn-sm" onclick="admin.setActiveWelcomeScreen(\'' + ws.id + '\')">Aktifkan</button> ';
            } else {
                html += '<span class="ws-active-badge">Aktif</span> ';
            }
            html += '<button class="btn btn-sm btn-danger" onclick="admin.deleteWelcomeScreen(\'' + ws.id + '\')">Hapus</button>';
            html += '</div></div>';
        }
        html += '</div>';
        container.innerHTML = html;
    }

    showWelcomeListEditor() {
        this.switchTab('welcome');
    }

    editWelcomeScreen(id) {
        const ws = this.allWelcomeScreens.find(w => w.id === id);
        if (!ws) return;

        this.welcomeSettings = ws;
        this.welcomeLogoData = null;
        this.welcomeBgData = null;

        this.switchTab('welcome');

        setTimeout(() => {
            this.renderWelcomeSettings();
            document.querySelector('.welcome-settings')?.scrollIntoView({ behavior: 'smooth' });
            this.showNotification('Welcome screen loaded. Edit dan simpan.', 'success');
        }, 100);
    }

    async duplicateWelcomeScreen(id) {
        const ws = this.allWelcomeScreens.find(w => w.id === id);
        if (!ws) return;

        const col = window.MOTIFKAIN_CONFIG?.welcomeCollection || 'welcome_settings';
        const data = { ...ws };
        delete data.id;
        delete data.created;
        delete data.updated;
        data.title = (data.title || 'Welcome') + ' (Copy)';

        try {
            await this.fetchAPI('/api/collections/' + col + '/records', { method: 'POST', body: JSON.stringify(data) });
            this.showNotification('Berhasil diduplikat!', 'success');
            await this.loadAllWelcomeScreens();
        } catch (e) {
            this.showNotification('Gagal menduplikat: ' + e.message, 'error');
        }
    }

    async setActiveWelcomeScreen(id) {
        this.activeWelcomeScreenId = id;
        localStorage.setItem('motifkain_active_ws', id);
        this.showNotification('Welcome screen berhasil diaktifkan!', 'success');
        await this.loadAllWelcomeScreens();
    }

    async deleteWelcomeScreen(id) {
        if (!confirm('Yakin ingin menghapus welcome screen ini?')) return;

        const col = window.MOTIFKAIN_CONFIG?.welcomeCollection || 'welcome_settings';
        try {
            await this.fetchAPI('/api/collections/' + col + '/records/' + id, { method: 'DELETE' });
            this.showNotification('Berhasil dihapus!', 'success');

            if (this.activeWelcomeScreenId === id) {
                this.activeWelcomeScreenId = null;
                localStorage.removeItem('motifkain_active_ws');
            }

            await this.loadAllWelcomeScreens();
        } catch (e) {
            this.showNotification('Gagal menghapus: ' + e.message, 'error');
        }
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === 'tab-' + tabName);
        });
    }

    backToWelcomeList() {
        this.switchTab('welcomelist');
    }

    // ===== WELCOME SCREEN SETTINGS =====
    async loadWelcomeSettings() {
        const savedActiveId = localStorage.getItem('motifkain_active_ws');
        const col = window.MOTIFKAIN_CONFIG?.welcomeCollection || 'welcome_settings';

        try {
            if (savedActiveId) {
                const res = await this.fetchAPI('/api/collections/' + col + '/records/' + savedActiveId);
                if (res.ok) {
                    const ws = await res.json();
                    this.welcomeSettings = ws;
                    this.activeWelcomeScreenId = savedActiveId;
                    this.updateSavedStatus(true);
                    this.renderWelcomeSettings();
                    return;
                }
            }

            const res = await this.fetchAPI('/api/collections/' + col + '/records?per-page=1&sort=-created');
            if (res.ok) {
                const data = await res.json();
                if (data.items && data.items.length > 0) {
                    this.welcomeSettings = data.items[0];
                    this.activeWelcomeScreenId = this.welcomeSettings.id;
                    localStorage.setItem('motifkain_active_ws', this.activeWelcomeScreenId);
                    this.updateSavedStatus(true);
                } else {
                    this.welcomeSettings = this.getDefaultWelcomeSettings();
                    this.updateSavedStatus(false);
                }
            }
        } catch (e) {
            this.welcomeSettings = this.getDefaultWelcomeSettings();
            this.updateSavedStatus(false);
        }
        this.renderWelcomeSettings();
    }

    updateSavedStatus(hasData) {
        const card = document.getElementById('savedWsCard');
        const status = document.getElementById('savedWsStatus');
        const actions = document.getElementById('savedWsActions');

        if (status) {
            if (hasData && this.welcomeSettings) {
                const ws = this.welcomeSettings;
                const templateNames = {
                    'cover-dark': 'Gelap',
                    'cover-light': 'Terang',
                    'cover-split': 'Split',
                    'cover-numbered': 'Nomor',
                    'cover-minimal': 'Minimal'
                };
                const templateName = templateNames[ws.template] || ws.template || 'Default';
                const isActive = ws.id === this.activeWelcomeScreenId;
                status.innerHTML = `Template: ${templateName} | Theme: ${ws.colorTheme || 'elegant-gold'} | Judul: ${ws.title || '-'}${isActive ? ' <span style="color:#4CAF50;">(Aktif)</span>' : ''}`;

                if (actions) {
                    actions.innerHTML = `
                        <button class="btn btn-sm" onclick="admin.editSavedWelcome()">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                            Edit Data Tersimpan
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="admin.previewWelcomeScreen()">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                            Lihat Preview
                        </button>
                    `;
                }
            } else {
                status.textContent = 'Belum ada data tersimpan di PocketBase. Buat baru dengan mengisi form di bawah.';
                if (actions) {
                    actions.innerHTML = `<button class="btn btn-outline btn-sm" onclick="admin.showNotification('Isi form di bawah, lalu klik Simpan untuk membuat data baru', 'info')">+ Buat Data Baru</button>`;
                }
            }
        }
    }

    editSavedWelcome() {
        if (this.welcomeSettings) {
            this.showNotification('Data welcome screen sudah diload ke form editor. Edit langsung dan simpan.', 'success');
            document.querySelector('.welcome-settings')?.scrollIntoView({ behavior: 'smooth' });
        }
    }

    refreshWelcomeData() {
        this.loadWelcomeSettings();
    }

    getDefaultWelcomeSettings() {
        return {
            template: 'cover-dark',
            colorTheme: 'elegant-gold',
            fontFamily: 'Playfair Display',
            title: 'CATALOG',
            subtitle: 'Company Profile',
            description: 'Koleksi produk eksklusif kami',
            leftText: 'Deskripsi singkat tentang\nkoleksi atau perusahaan Anda.'
        };
    }

    renderWelcomeSettings() {
        if (!this.welcomeSettings) return;
        const ws = this.welcomeSettings;
        const col = window.MOTIFKAIN_CONFIG?.welcomeCollection || 'welcome_settings';

        // Set form values
        document.getElementById('wsTitle').value = ws.title || '';
        document.getElementById('wsSubtitle').value = ws.subtitle || '';
        document.getElementById('wsDescription').value = ws.description || '';
        document.getElementById('wsLeftText').value = ws.leftText || '';
        document.getElementById('wsFont').value = ws.fontFamily || 'Playfair Display';

        // Set template active
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.template === ws.template);
        });

        // Set theme active
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === ws.colorTheme);
        });

        // Load logo if exists
        if (ws.logo) {
            const logoUrl = this.pocketbaseUrl + '/api/files/' + col + '/' + ws.id + '/' + ws.logo;
            document.getElementById('wsLogoPreview').src = logoUrl;
            document.getElementById('wsLogoPreview').style.display = 'block';
            document.getElementById('wsLogoPlaceholder').style.display = 'none';
            document.getElementById('wsLogoRemoveBtn').style.display = 'inline-block';
            ws.logoUrl = logoUrl;
        } else {
            document.getElementById('wsLogoPreview').style.display = 'none';
            document.getElementById('wsLogoPlaceholder').style.display = 'flex';
            document.getElementById('wsLogoRemoveBtn').style.display = 'none';
            ws.logoUrl = null;
        }

        // Load background image if exists
        if (ws.backgroundImage) {
            const bgUrl = this.pocketbaseUrl + '/api/files/' + col + '/' + ws.id + '/' + ws.backgroundImage;
            document.getElementById('wsBgPreview').src = bgUrl;
            document.getElementById('wsBgPreview').style.display = 'block';
            document.getElementById('wsBgPlaceholder').style.display = 'none';
            document.getElementById('wsBgRemoveBtn').style.display = 'inline-block';
            ws.backgroundImageUrl = bgUrl;
        } else {
            document.getElementById('wsBgPreview').style.display = 'none';
            document.getElementById('wsBgPlaceholder').style.display = 'flex';
            document.getElementById('wsBgRemoveBtn').style.display = 'none';
            ws.backgroundImageUrl = null;
        }

        // Load values
        if (ws.backgroundOpacity) {
            document.getElementById('wsBgOpacity').value = ws.backgroundOpacity;
            document.getElementById('bgOpacityValue').textContent = ws.backgroundOpacity;
        }
        if (ws.logoSize) {
            document.getElementById('wsLogoSize').value = ws.logoSize;
            document.getElementById('logoSizeValue').textContent = ws.logoSize;
        }
        if (ws.logoX) {
            document.getElementById('wsLogoX').value = ws.logoX;
            document.getElementById('logoXValue').textContent = ws.logoX;
        }
        if (ws.logoY) {
            document.getElementById('wsLogoY').value = ws.logoY;
            document.getElementById('logoYValue').textContent = ws.logoY;
        }
        if (ws.titleSize) {
            document.getElementById('wsTitleSize').value = ws.titleSize;
            document.getElementById('titleSizeValue').textContent = ws.titleSize;
        }
        if (ws.titleX) {
            document.getElementById('wsTitleX').value = ws.titleX;
            document.getElementById('titleXValue').textContent = ws.titleX;
        }
        if (ws.titleY) {
            document.getElementById('wsTitleY').value = ws.titleY;
            document.getElementById('titleYValue').textContent = ws.titleY;
        }
        if (ws.subtitleSize) {
            document.getElementById('wsSubtitleSize').value = ws.subtitleSize;
            document.getElementById('subtitleSizeValue').textContent = ws.subtitleSize;
        }
        if (ws.subtitleX) {
            document.getElementById('wsSubtitleX').value = ws.subtitleX;
            document.getElementById('subtitleXValue').textContent = ws.subtitleX;
        }
        if (ws.subtitleY) {
            document.getElementById('wsSubtitleY').value = ws.subtitleY;
            document.getElementById('subtitleYValue').textContent = ws.subtitleY;
        }
        if (ws.descriptionSize) {
            document.getElementById('wsDescriptionSize').value = ws.descriptionSize;
            document.getElementById('descriptionSizeValue').textContent = ws.descriptionSize;
        }
        if (ws.descriptionX) {
            document.getElementById('wsDescriptionX').value = ws.descriptionX;
            document.getElementById('descriptionXValue').textContent = ws.descriptionX;
        }
        if (ws.descriptionY) {
            document.getElementById('wsDescriptionY').value = ws.descriptionY;
            document.getElementById('descriptionYValue').textContent = ws.descriptionY;
        }
        if (ws.splitLeftWidth) {
            document.getElementById('wsSplitLeftWidth').value = ws.splitLeftWidth;
            document.getElementById('splitLeftWidthValue').textContent = ws.splitLeftWidth;
        }

        this.updateWelcomePreview();
    }

    // ===== LAYANAN CRUD =====
    async loadLayanan() {
        const col = window.MOTIFKAIN_CONFIG?.layananCollection || 'layanan';
        try {
            const res = await this.fetchAPI('/api/collections/' + col + '/records?sort=+order');
            if (res.ok) {
                const data = await res.json();
                this.layanan = data.items || [];
            } else if (res.status === 400) {
                // Collection doesn't exist or bad request - ignore
                console.log('Collection "' + col + '" not available yet');
                this.layanan = [];
            }
        } catch (e) {
            // Collection might not exist - ignore error
            console.log('Collection "' + col + '" not available:', e.message);
            this.layanan = [];
        }
        this.renderLayanan();
        this.populateLayananDropdowns();
    }

    renderLayanan() {
        var container = document.getElementById('layananList');
        if (!container) return;

        if (this.layanan.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Belum ada layanan. Tambahkan layanan baru.</p>';
            return;
        }

        var html = '';
        for (var i = 0; i < this.layanan.length; i++) {
            var l = this.layanan[i];
            var icon = l.icon || '📁';
            var itemCount = this.getKategoriCountByLayanan(l.id);
            html += '<div class="layanan-item">';
            html += '<div class="layanan-icon">' + icon + '</div>';
            html += '<div class="layanan-info">';
            html += '<div class="layanan-name">' + l.name + '</div>';
            html += '<div class="layanan-count">' + itemCount + ' kategori</div>';
            html += '</div>';
            html += '<div class="layanan-actions">';
            html += '<button class="btn btn-sm" onclick="admin.editLayanan(\'' + l.id + '\')">Edit</button> ';
            html += '<button class="btn btn-sm btn-danger" onclick="admin.deleteLayanan(\'' + l.id + '\')">Hapus</button>';
            html += '</div></div>';
        }
        container.innerHTML = html;
    }

    getKategoriCountByLayanan(layananId) {
        return this.kategori.filter(k => k.layanan === layananId || k.layanan_id === layananId).length;
    }

    populateLayananDropdowns() {
        var selects = ['filterKategoriLayanan', 'filterProdukLayanan'];
        selects.forEach(function(selectId) {
            var select = document.getElementById(selectId);
            if (!select) return;
            var currentVal = select.value;
            select.innerHTML = '<option value="">Semua Layanan</option>';
            for (var i = 0; i < admin.layanan.length; i++) {
                var l = admin.layanan[i];
                select.innerHTML += '<option value="' + l.id + '">' + l.name + '</option>';
            }
            select.value = currentVal;
        });
    }

    showAddLayananModal() {
        this.currentLayanan = null;
        document.getElementById('layananModalTitle').textContent = 'Tambah Layanan';
        document.getElementById('layananName').value = '';
        document.getElementById('layananIcon').value = '';
        document.getElementById('layananModal').classList.add('active');
    }

    editLayanan(id) {
        var l = null;
        for (var i = 0; i < this.layanan.length; i++) {
            if (this.layanan[i].id === id) { l = this.layanan[i]; break; }
        }
        if (!l) return;

        this.currentLayanan = l;
        document.getElementById('layananModalTitle').textContent = 'Edit Layanan';
        document.getElementById('layananName').value = l.name || '';
        document.getElementById('layananIcon').value = l.icon || '';
        document.getElementById('layananModal').classList.add('active');
    }

    async saveLayanan() {
        var name = document.getElementById('layananName').value.trim();
        var icon = document.getElementById('layananIcon').value.trim();

        if (!name) {
            this.showNotification('Nama layanan wajib diisi!', 'error');
            return;
        }

        var data = { name: name, icon: icon || '📁' };

        var col = window.MOTIFKAIN_CONFIG?.layananCollection || 'layanan';

        try {
            if (this.currentLayanan) {
                await this.fetchAPI('/api/collections/' + col + '/records/' + this.currentLayanan.id, { method: 'PATCH', body: JSON.stringify(data) });
                this.showNotification('Berhasil disimpan!', 'success');
            } else {
                await this.fetchAPI('/api/collections/' + col + '/records', { method: 'POST', body: JSON.stringify(data) });
                this.showNotification('Berhasil ditambahkan!', 'success');
            }
        } catch (e) {
            this.showNotification('Gagal menyimpan: ' + e.message, 'error');
        }

        this.closeModal('layananModal');
        await this.loadLayanan();
    }

    async deleteLayanan(id) {
        if (!confirm('Yakin ingin menghapus layanan ini? Kategori di dalamnya tidak akan terhapus.')) return;
        var col = window.MOTIFKAIN_CONFIG?.layananCollection || 'layanan';
        try {
            await this.fetchAPI('/api/collections/' + col + '/records/' + id, { method: 'DELETE' });
            this.showNotification('Berhasil dihapus!', 'success');
        } catch (e) {
            this.showNotification('Gagal menghapus: ' + e.message, 'error');
        }
        await this.loadLayanan();
    }

    filterKategoriByLayanan() {
        var layananId = document.getElementById('filterKategoriLayanan').value;
        this.renderKategori(layananId);
    }

    filterProductsByLayanan() {
        var layananId = document.getElementById('filterProdukLayanan').value;
        var kategoriId = document.getElementById('filterKategori').value;
        // Update kategori dropdown based on layanan
        this.updateKategoriDropdown(layananId);
        this.filterProducts();
    }

    updateKategoriDropdown(layananId) {
        var select = document.getElementById('filterKategori');
        if (!select) return;
        var currentVal = select.value;
        select.innerHTML = '<option value="">Semua Kategori</option>';

        if (layananId) {
            var filteredKategori = this.kategori.filter(k => k.layanan === layananId || k.layanan_id === layananId);
            for (var i = 0; i < filteredKategori.length; i++) {
                var k = filteredKategori[i];
                select.innerHTML += '<option value="' + k.id + '">' + k.name + '</option>';
            }
        } else {
            for (var i = 0; i < this.kategori.length; i++) {
                var k = this.kategori[i];
                select.innerHTML += '<option value="' + k.id + '">' + k.name + '</option>';
            }
        }
        select.value = currentVal;
    }

    // ===== WELCOME SCREEN SETTINGS =====
    updateSavedStatus(hasData) {
        const card = document.getElementById('savedWsCard');
        const status = document.getElementById('savedWsStatus');
        const actions = document.getElementById('savedWsActions');

        if (status) {
            if (hasData && this.welcomeSettings) {
                const ws = this.welcomeSettings;
                const templateNames = {
                    'cover-dark': 'Gelap',
                    'cover-light': 'Terang',
                    'cover-split': 'Split',
                    'cover-numbered': 'Nomor',
                    'cover-minimal': 'Minimal'
                };
                const templateName = templateNames[ws.template] || ws.template || 'Default';
                status.textContent = `Template: ${templateName} | Theme: ${ws.colorTheme || 'elegant-gold'} | Judul: ${ws.title || '-'}`;

                if (actions) {
                    actions.innerHTML = `
                        <button class="btn btn-sm" onclick="admin.editSavedWelcome()">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                            Edit Data Tersimpan
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="admin.previewWelcomeScreen()">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                            Lihat Preview
                        </button>
                    `;
                }
            } else {
                status.textContent = 'Belum ada data tersimpan di PocketBase. Buat baru dengan mengisi form di bawah.';
                if (actions) {
                    actions.innerHTML = `<button class="btn btn-outline btn-sm" onclick="admin.showNotification('Isi form di bawah, lalu klik Simpan untuk membuat data baru', 'info')">+ Buat Data Baru</button>`;
                }
            }
        }
    }

    editSavedWelcome() {
        if (this.welcomeSettings) {
            this.showNotification('Data welcome screen sudah diload ke form editor. Edit langsung dan simpan.', 'success');
            // Scroll to editor form
            document.querySelector('.welcome-settings')?.scrollIntoView({ behavior: 'smooth' });
        }
    }

    refreshWelcomeData() {
        this.loadWelcomeSettings();
    }

    getDefaultWelcomeSettings() {
        return {
            template: 'cover-dark',
            colorTheme: 'elegant-gold',
            fontFamily: 'Playfair Display',
            title: 'CATALOG',
            subtitle: 'Company Profile',
            description: 'Koleksi produk eksklusif kami',
            leftText: 'Deskripsi singkat tentang\nkoleksi atau perusahaan Anda.'
        };
    }

    renderWelcomeSettings() {
        if (!this.welcomeSettings) return;
        const ws = this.welcomeSettings;
        const col = window.MOTIFKAIN_CONFIG?.welcomeCollection || 'welcome_settings';

        // Set form values
        document.getElementById('wsTitle').value = ws.title || '';
        document.getElementById('wsSubtitle').value = ws.subtitle || '';
        document.getElementById('wsDescription').value = ws.description || '';
        document.getElementById('wsLeftText').value = ws.leftText || '';
        document.getElementById('wsFont').value = ws.fontFamily || 'Playfair Display';

        // Set template active
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.template === ws.template);
        });

        // Set theme active
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === ws.colorTheme);
        });

        // Load logo if exists - build full URL
        if (ws.logo) {
            const logoUrl = this.pocketbaseUrl + '/api/files/' + col + '/' + ws.id + '/' + ws.logo;
            document.getElementById('wsLogoPreview').src = logoUrl;
            document.getElementById('wsLogoPreview').style.display = 'block';
            document.getElementById('wsLogoPlaceholder').style.display = 'none';
            document.getElementById('wsLogoRemoveBtn').style.display = 'inline-block';
            // Simpan URL lengkap untuk preview
            ws.logoUrl = logoUrl;
        } else {
            document.getElementById('wsLogoPreview').style.display = 'none';
            document.getElementById('wsLogoPlaceholder').style.display = 'flex';
            document.getElementById('wsLogoRemoveBtn').style.display = 'none';
            ws.logoUrl = null;
        }

        // Load background image if exists - build full URL
        if (ws.backgroundImage) {
            const bgUrl = this.pocketbaseUrl + '/api/files/' + col + '/' + ws.id + '/' + ws.backgroundImage;
            document.getElementById('wsBgPreview').src = bgUrl;
            document.getElementById('wsBgPreview').style.display = 'block';
            document.getElementById('wsBgPlaceholder').style.display = 'none';
            document.getElementById('wsBgRemoveBtn').style.display = 'inline-block';
            // Simpan URL lengkap untuk preview
            ws.backgroundImageUrl = bgUrl;
        } else {
            document.getElementById('wsBgPreview').style.display = 'none';
            document.getElementById('wsBgPlaceholder').style.display = 'flex';
            document.getElementById('wsBgRemoveBtn').style.display = 'none';
            ws.backgroundImageUrl = null;
        }

        // Load background opacity
        if (ws.backgroundOpacity) {
            document.getElementById('wsBgOpacity').value = ws.backgroundOpacity;
            document.getElementById('bgOpacityValue').textContent = ws.backgroundOpacity;
        }

        // Load position values
        if (ws.logoSize) {
            document.getElementById('wsLogoSize').value = ws.logoSize;
            document.getElementById('logoSizeValue').textContent = ws.logoSize;
        }
        if (ws.logoX) {
            document.getElementById('wsLogoX').value = ws.logoX;
            document.getElementById('logoXValue').textContent = ws.logoX;
        }
        if (ws.logoY) {
            document.getElementById('wsLogoY').value = ws.logoY;
            document.getElementById('logoYValue').textContent = ws.logoY;
        }
        if (ws.titleSize) {
            document.getElementById('wsTitleSize').value = ws.titleSize;
            document.getElementById('titleSizeValue').textContent = ws.titleSize;
        }
        if (ws.titleX) {
            document.getElementById('wsTitleX').value = ws.titleX;
            document.getElementById('titleXValue').textContent = ws.titleX;
        }
        if (ws.titleY) {
            document.getElementById('wsTitleY').value = ws.titleY;
            document.getElementById('titleYValue').textContent = ws.titleY;
        }
        if (ws.subtitleSize) {
            document.getElementById('wsSubtitleSize').value = ws.subtitleSize;
            document.getElementById('subtitleSizeValue').textContent = ws.subtitleSize;
        }
        if (ws.subtitleX) {
            document.getElementById('wsSubtitleX').value = ws.subtitleX;
            document.getElementById('subtitleXValue').textContent = ws.subtitleX;
        }
        if (ws.subtitleY) {
            document.getElementById('wsSubtitleY').value = ws.subtitleY;
            document.getElementById('subtitleYValue').textContent = ws.subtitleY;
        }

        // Initial preview render
        this.updateWelcomePreview();
    }

    selectTemplate(templateId) {
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.template === templateId);
        });
        if (!this.welcomeSettings) this.welcomeSettings = {};
        this.welcomeSettings.template = templateId;

        // Show/hide split settings
        const splitSettings = document.getElementById('splitSettings');
        if (splitSettings) {
            splitSettings.style.display = templateId === 'cover-split' ? 'block' : 'none';
        }

        this.updateWelcomePreview();
    }

    selectTheme(themeId) {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeId);
        });
        if (!this.welcomeSettings) this.welcomeSettings = {};
        this.welcomeSettings.colorTheme = themeId;
        this.updateWelcomePreview();
    }

    updateWelcomePreview() {
        if (!this.welcomeSettings) this.welcomeSettings = this.getDefaultWelcomeSettings();

        const ws = this.welcomeSettings;
        ws.title = document.getElementById('wsTitle').value;
        ws.subtitle = document.getElementById('wsSubtitle').value;
        ws.description = document.getElementById('wsDescription').value;
        ws.leftText = document.getElementById('wsLeftText').value;
        ws.fontFamily = document.getElementById('wsFont').value;
        ws.backgroundOpacity = parseInt(document.getElementById('wsBgOpacity').value) || 50;
        ws.logoSize = parseInt(document.getElementById('wsLogoSize').value) || 60;
        ws.logoX = parseInt(document.getElementById('wsLogoX').value) || 50;
        ws.logoY = parseInt(document.getElementById('wsLogoY').value) || 10;
        ws.titleSize = parseInt(document.getElementById('wsTitleSize').value) || 32;
        ws.titleX = parseInt(document.getElementById('wsTitleX').value) || 50;
        ws.titleY = parseInt(document.getElementById('wsTitleY').value) || 50;
        ws.subtitleSize = parseInt(document.getElementById('wsSubtitleSize').value) || 14;
        ws.subtitleX = parseInt(document.getElementById('wsSubtitleX').value) || 50;
        ws.subtitleY = parseInt(document.getElementById('wsSubtitleY').value) || 70;
        ws.descriptionSize = parseInt(document.getElementById('wsDescriptionSize').value) || 14;
        ws.descriptionX = parseInt(document.getElementById('wsDescriptionX').value) || 50;
        ws.descriptionY = parseInt(document.getElementById('wsDescriptionY').value) || 75;
        ws.btnX = parseInt(document.getElementById('wsBtnX').value) || 50;
        ws.btnY = parseInt(document.getElementById('wsBtnY').value) || 90;
        ws.btnBgColor = document.getElementById('wsBtnBgColor').value || '#1B5E20';
        ws.btnTextColor = document.getElementById('wsBtnTextColor').value || '#FFFFFF';
        ws.btnFontSize = parseInt(document.getElementById('wsBtnFontSize').value) || 14;
        ws.splitLeftWidth = parseInt(document.getElementById('wsSplitLeftWidth').value) || 40;

        // Use URL from PocketBase or from upload (base64)
        ws.backgroundImageUrl = ws.backgroundImageUrl || ws.backgroundImage;
        ws.logoUrl = ws.logoUrl || ws.logo;

        const preview = document.getElementById('wsPreviewArea');
        if (!preview) return;

        const theme = this.getThemeColors(ws.colorTheme);
        const template = ws.template || 'cover-dark';

        let html = '';
        switch(template) {
            case 'cover-dark':
                html = this.renderPreviewDark(ws, theme);
                break;
            case 'cover-light':
                html = this.renderPreviewLight(ws, theme);
                break;
            case 'cover-split':
                html = this.renderPreviewSplit(ws, theme);
                break;
            case 'cover-numbered':
                html = this.renderPreviewNumbered(ws, theme);
                break;
            case 'cover-minimal':
                html = this.renderPreviewMinimal(ws, theme);
                break;
            default:
                html = this.renderPreviewDark(ws, theme);
        }

        preview.innerHTML = html;
    }

    getLogoStyle(ws) {
        const size = ws.logoSize || 60;
        const x = ws.logoX || 50;
        const y = ws.logoY || 10;

        return `height:${size}px;max-width:150px;object-fit:contain;position:absolute;left:${x}%;top:${y}%;transform:translate(-50%, 0);`;
    }

    getTitleStyle(ws) {
        const x = ws.titleX || 50;
        const y = ws.titleY || 50;
        const size = ws.titleSize || 32;
        return `position:absolute;left:${x}%;top:${y}%;transform:translate(-50%, -50%);text-align:center;width:90%;font-size:${size}px;`;
    }

    getSubtitleStyle(ws) {
        const x = ws.subtitleX || 50;
        const y = ws.subtitleY || 70;
        const size = ws.subtitleSize || 14;
        return `position:absolute;left:${x}%;top:${y}%;transform:translate(-50%, -50%);text-align:center;width:90%;font-size:${size}px;`;
    }

    getDescriptionStyle(ws) {
        const x = ws.descriptionX || 50;
        const y = ws.descriptionY || 75;
        const size = ws.descriptionSize || 14;
        return `position:absolute;left:${x}%;top:${y}%;transform:translate(-50%, -50%);text-align:center;width:90%;font-size:${size}px;line-height:1.6;`;
    }

    // Background Image handlers
    handleWelcomeBgUpload(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.welcomeBgData = e.target.result;
            document.getElementById('wsBgPreview').src = e.target.result;
            document.getElementById('wsBgPreview').style.display = 'block';
            document.getElementById('wsBgPlaceholder').style.display = 'none';
            document.getElementById('wsBgRemoveBtn').style.display = 'inline-block';
            this.welcomeSettings = this.welcomeSettings || {};
            this.welcomeSettings.backgroundImage = e.target.result;
            this.updateWelcomePreview();
        };
        reader.readAsDataURL(file);
    }

    removeWelcomeBg() {
        this.welcomeBgData = null;
        document.getElementById('wsBgPreview').style.display = 'none';
        document.getElementById('wsBgPlaceholder').style.display = 'flex';
        document.getElementById('wsBgRemoveBtn').style.display = 'none';
        document.getElementById('wsBgInput').value = '';
        if (!this.welcomeSettings) this.welcomeSettings = {};
        this.welcomeSettings.backgroundImage = null;
        this.updateWelcomePreview();
    }

    updateBgOpacity() {
        const val = document.getElementById('wsBgOpacity').value;
        document.getElementById('bgOpacityValue').textContent = val;
        if (!this.welcomeSettings) this.welcomeSettings = {};
        this.welcomeSettings.backgroundOpacity = parseInt(val);
        this.updateWelcomePreview();
    }

    updateBottomPanelOpacity() {
        const val = document.getElementById('wsBottomPanelOpacity').value;
        document.getElementById('bottomPanelOpacityValue').textContent = val;
        if (!this.welcomeSettings) this.welcomeSettings = {};
        this.welcomeSettings.bottomPanelOpacity = parseInt(val);
        this.updateWelcomePreview();
    }

    updateBtnStyle() {
        const xVal = document.getElementById('wsBtnX')?.value || '50';
        const yVal = document.getElementById('wsBtnY')?.value || '90';
        const bgColor = document.getElementById('wsBtnBgColor')?.value || '#1B5E20';
        const textColor = document.getElementById('wsBtnTextColor')?.value || '#FFFFFF';
        const fontSize = document.getElementById('wsBtnFontSize')?.value || '14';

        if (document.getElementById('btnXValue')) document.getElementById('btnXValue').textContent = xVal;
        if (document.getElementById('btnYValue')) document.getElementById('btnYValue').textContent = yVal;
        if (document.getElementById('btnFontSizeValue')) document.getElementById('btnFontSizeValue').textContent = fontSize;

        if (!this.welcomeSettings) this.welcomeSettings = {};
        this.welcomeSettings.btnX = parseInt(xVal);
        this.welcomeSettings.btnY = parseInt(yVal);
        this.welcomeSettings.btnBgColor = bgColor;
        this.welcomeSettings.btnTextColor = textColor;
        this.welcomeSettings.btnFontSize = parseInt(fontSize);
        this.updateWelcomePreview();
    }

    getBtnStyle(ws) {
        const x = ws.btnX || 50;
        const y = ws.btnY || 90;
        const bgColor = ws.btnBgColor || '#1B5E20';
        const textColor = ws.btnTextColor || '#FFFFFF';
        const fontSize = ws.btnFontSize || 14;
        return `position:absolute;left:${x}%;top:${y}%;transform:translate(-50%, -50%);background:${bgColor};color:${textColor};padding:12px 32px;border:none;border-radius:6px;font-size:${fontSize}px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);`;
    }

    // Logo handlers
    updateLogoSize() {
        const val = document.getElementById('wsLogoSize').value;
        document.getElementById('logoSizeValue').textContent = val;
        if (!this.welcomeSettings) this.welcomeSettings = {};
        this.welcomeSettings.logoSize = parseInt(val);
        this.updateWelcomePreview();
    }

    setLogoPosition(position) {
        document.querySelectorAll('.pos-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.position === position);
        });
        if (!this.welcomeSettings) this.welcomeSettings = {};
        this.welcomeSettings.logoPosition = position;
        this.updateWelcomePreview();
    }

    getThemeColors(themeId) {
        const themes = {
            'elegant-gold': {
                primary: '#5D4037',
                secondary: '#8D6E63',
                accent: '#C9A66B',
                accentAlt: '#008B8B',
                textDark: '#1a1a1a',
                textLight: '#6D4C41',
                textMuted: '#A1887F',
                bgLight: '#FFF8F0',
                bgDark: '#1a2a3a',
                bgCard: '#FFFFFF'
            },
            'elegant-red': {
                primary: '#8B0000',
                secondary: '#B22222',
                accent: '#CD5C5C',
                accentAlt: '#DC143C',
                textDark: '#4A0000',
                textLight: '#FFF0F0',
                textMuted: '#8B0000',
                bgLight: '#FFF5F5',
                bgDark: '#4A0000',
                bgCard: '#FFF8F8'
            },
            'elegant-cream': {
                primary: '#8B4513',
                secondary: '#D2691E',
                accent: '#DEB887',
                accentAlt: '#CD853F',
                textDark: '#3D2314',
                textLight: '#5C4033',
                textMuted: '#8B7355',
                bgLight: '#FFF8DC',
                bgDark: '#3D2314',
                bgCard: '#FFFAF0'
            },
            'elegant-brown': {
                primary: '#3E2723',
                secondary: '#5D4037',
                accent: '#8D6E63',
                accentAlt: '#A1887F',
                textDark: '#1a1a1a',
                textLight: '#4E342E',
                textMuted: '#795548',
                bgLight: '#EFEBE9',
                bgDark: '#3E2723',
                bgCard: '#FFFFFF'
            },
            'ocean-blue': {
                primary: '#1E3A5F',
                secondary: '#4A90A4',
                accent: '#E8F4F8',
                accentAlt: '#26C6DA',
                textDark: '#0D2137',
                textLight: '#3D5A73',
                textMuted: '#6B8BA4',
                bgLight: '#F0F8FF',
                bgDark: '#0D2137',
                bgCard: '#FFFFFF'
            },
            'forest-green': {
                primary: '#2D4739',
                secondary: '#4CAF50',
                accent: '#A5D6A7',
                accentAlt: '#8BC34A',
                textDark: '#1B3324',
                textLight: '#3D5C4A',
                textMuted: '#6B8B7A',
                bgLight: '#F1F8E9',
                bgDark: '#1B3324',
                bgCard: '#FFFFFF'
            },
            'monochrome': {
                primary: '#212121',
                secondary: '#616161',
                accent: '#BDBDBD',
                accentAlt: '#9E9E9E',
                textDark: '#000000',
                textLight: '#424242',
                textMuted: '#757575',
                bgLight: '#FAFAFA',
                bgDark: '#000000',
                bgCard: '#FFFFFF'
            }
        };
        return themes[themeId] || themes['elegant-gold'];
    }

    renderPreviewDark(ws, theme) {
        const bgUrl = ws.backgroundImageUrl || ws.backgroundImage;
        let bgStyle;
        if (bgUrl) {
            bgStyle = `background: linear-gradient(rgba(0,0,0,${1 - (ws.backgroundOpacity || 50)/100}), rgba(0,0,0,${1 - (ws.backgroundOpacity || 50)/100})), url('${bgUrl}') center/cover;`;
        } else {
            bgStyle = `background:linear-gradient(180deg,${theme.bgDark} 0%,${theme.primary} 100%);`;
        }

        const logoStyle = this.getLogoStyle(ws);
        const titleStyle = this.getTitleStyle(ws);
        const btnStyle = this.getBtnStyle(ws);
        const logoUrl = ws.logoUrl || ws.logo;
        const logoHtml = logoUrl
            ? `<img src="${logoUrl}" style="${logoStyle}" class="preview-logo">`
            : `<div style="${logoStyle}" class="preview-logo-placeholder">📷</div>`;

        return `
        <div style="width:100%;height:100%;${bgStyle}padding:12%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
            <div style="position:absolute;top:5%;left:5%;width:40px;height:40px;border-top:2px solid ${theme.accent};border-left:2px solid ${theme.accent};opacity:0.4;"></div>
            <div style="position:absolute;bottom:5%;right:5%;width:40px;height:40px;border-bottom:2px solid ${theme.accent};border-right:2px solid ${theme.accent};opacity:0.4;"></div>
            ${logoHtml}
            <div style="${titleStyle}">
                <h1 style="font-family:'${ws.fontFamily}',serif;font-size:${ws.titleSize || 32}px;color:#fff;margin-bottom:4%;letter-spacing:0.05em;">${ws.title}</h1>
                <p style="color:${theme.accent};font-size:${ws.subtitleSize || 14}px;letter-spacing:0.2em;margin-bottom:4%;">${ws.subtitle}</p>
                <div style="width:30px;height:1px;background:${theme.accent};margin:0 auto;"></div>
            </div>
            ${ws.description ? `<div style="${this.getDescriptionStyle(ws)}color:rgba(255,255,255,0.7);">${ws.description}</div>` : ''}
            ${ws.leftText ? `<div style="position:absolute;left:50%;bottom:15%;transform:translateX(-50%);text-align:center;width:80%;font-size:0.45rem;color:${theme.textMuted};line-height:1.4;">${ws.leftText.replace(/\n/g, '<br>')}</div>` : ''}
            <button style="${btnStyle}">Lihat Katalog</button>
        </div>`;
    }

    renderPreviewLight(ws, theme) {
        const bgUrl = ws.backgroundImageUrl || ws.backgroundImage;
        let bgStyle;
        if (bgUrl) {
            bgStyle = `background: linear-gradient(rgba(255,255,255,${(ws.backgroundOpacity || 50)/100}), rgba(255,255,255,${(ws.backgroundOpacity || 50)/100})), url('${bgUrl}') center/cover;`;
        } else {
            bgStyle = `background:${theme.bgLight};`;
        }
        const logoStyle = this.getLogoStyle(ws);
        const titleStyle = this.getTitleStyle(ws);
        const btnStyle = this.getBtnStyle(ws);
        const logoUrl = ws.logoUrl || ws.logo;
        const logoHtml = logoUrl
            ? `<img src="${logoUrl}" style="${logoStyle}" class="preview-logo">`
            : `<div style="${logoStyle}" class="preview-logo-placeholder">📷</div>`;

        return `
        <div style="width:100%;height:100%;${bgStyle}padding:12%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
            <div style="position:absolute;top:5%;right:5%;width:30px;height:30px;border-top:2px solid ${theme.accentAlt};border-right:2px solid ${theme.accentAlt};opacity:0.3;"></div>
            ${logoHtml}
            <div style="${titleStyle}">
                <h1 style="font-family:'${ws.fontFamily}',serif;font-size:${ws.titleSize || 32}px;color:${theme.textDark};margin-bottom:4%;">${ws.title}</h1>
                <p style="color:${theme.accentAlt};font-size:${ws.subtitleSize || 14}px;letter-spacing:0.2em;margin-bottom:4%;">${ws.subtitle}</p>
                <div style="width:30px;height:1px;background:${theme.accent};margin:0 auto;"></div>
            </div>
            ${ws.description ? `<div style="${this.getDescriptionStyle(ws)}color:${theme.textMuted};">${ws.description}</div>` : ''}
            ${ws.leftText ? `<div style="position:absolute;left:50%;bottom:15%;transform:translateX(-50%);text-align:center;width:80%;font-size:0.45rem;color:${theme.textMuted};line-height:1.4;">${ws.leftText.replace(/\n/g, '<br>')}</div>` : ''}
            <button style="${btnStyle}">Lihat Katalog</button>
        </div>`;
    }

    renderPreviewSplit(ws, theme) {
        const bgUrl = ws.backgroundImageUrl || ws.backgroundImage;
        let rightBgStyle = theme.bgCard;

        if (bgUrl) {
            rightBgStyle = `linear-gradient(rgba(255,255,255,${(ws.backgroundOpacity || 50)/100}), rgba(255,255,255,${(ws.backgroundOpacity || 50)/100})), url('${bgUrl}') center/cover`;
        }

        const logoStyle = this.getLogoStyle(ws);
        const titleStyle = this.getTitleStyle(ws);
        const descStyle = this.getDescriptionStyle(ws);
        const btnStyle = this.getBtnStyle(ws);
        const logoUrl = ws.logoUrl || ws.logo;
        const logoHtml = logoUrl ? `<img src="${logoUrl}" style="${logoStyle}">` : '';

        const splitLeftWidth = ws.splitLeftWidth || 40;
        const splitRightWidth = 100 - splitLeftWidth;

        return `
        <div style="width:100%;height:100%;display:flex;position:relative;">
            <div style="width:${splitLeftWidth}%;height:100%;background:${theme.bgDark};padding:6%;display:flex;flex-direction:column;justify-content:center;position:relative;">
                ${logoHtml}
                ${ws.leftText ? `<div style="width:25px;height:1px;background:${theme.accent};margin:12% 0;"></div><div style="font-size:0.4rem;color:rgba(255,255,255,0.6);line-height:1.4;">${ws.leftText.replace(/\n/g, '<br>')}</div>` : ''}
            </div>
            <div style="width:${splitRightWidth}%;height:100%;background:${rightBgStyle};padding:8%;display:flex;flex-direction:column;justify-content:center;position:relative;">
                <div style="${titleStyle}">
                    <h1 style="font-family:'${ws.fontFamily}',serif;font-size:${ws.titleSize || 32}px;color:${theme.textDark};margin-bottom:4%;">${ws.title}</h1>
                    <p style="color:${theme.accentAlt};font-size:${ws.subtitleSize || 14}px;letter-spacing:0.1em;margin-bottom:4%;">${ws.subtitle}</p>
                    <div style="width:25px;height:1px;background:${theme.textDark};margin-bottom:8%;"></div>
                </div>
                ${ws.description ? `<div style="${descStyle}color:${theme.textMuted};">${ws.description}</div>` : ''}
                <button style="${btnStyle}">Lihat Katalog</button>
            </div>
        </div>`;
    }

    renderPreviewNumbered(ws, theme) {
        const bgUrl = ws.backgroundImageUrl || ws.backgroundImage;
        let bgStyle;
        if (bgUrl) {
            bgStyle = `background: linear-gradient(rgba(0,0,0,${1 - (ws.backgroundOpacity || 50)/100}), rgba(0,0,0,${1 - (ws.backgroundOpacity || 50)/100})), url('${bgUrl}') center/cover;`;
        } else {
            bgStyle = `background:${theme.bgDark};`;
        }
        const logoStyle = this.getLogoStyle(ws);
        const titleStyle = this.getTitleStyle(ws);
        const btnStyle = this.getBtnStyle(ws);
        const logoUrl = ws.logoUrl || ws.logo;
        const logoHtml = logoUrl
            ? `<img src="${logoUrl}" style="${logoStyle}">`
            : `<div style="${logoStyle}" class="preview-logo-placeholder">📷</div>`;

        return `
        <div style="width:100%;height:100%;${bgStyle}padding:10%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
            <div style="position:absolute;top:5%;left:5%;width:30px;height:30px;border-top:2px solid ${theme.accent};border-left:2px solid ${theme.accent};opacity:0.4;"></div>
            <div style="position:absolute;bottom:5%;right:5%;width:30px;height:30px;border-bottom:2px solid ${theme.accent};border-right:2px solid ${theme.accent};opacity:0.4;"></div>
            ${logoHtml}
            <div style="${titleStyle}">
                <h1 style="font-family:'${ws.fontFamily}',serif;font-size:1rem;color:#fff;margin-bottom:10px;letter-spacing:0.1em;">${ws.title}</h1>
                <p style="color:${theme.accent};font-size:${ws.subtitleSize || 14}px;letter-spacing:0.3em;margin-bottom:15px;">${ws.subtitle}</p>
                <div style="width:40px;height:1px;background:${theme.accent};margin-bottom:15px;"></div>
            </div>
            ${ws.description ? `<div style="${this.getDescriptionStyle(ws)}color:rgba(255,255,255,0.7);line-height:1.5;max-width:80%;">${ws.description}</div>` : ''}
            ${ws.leftText ? `<div style="position:absolute;left:50%;bottom:15%;transform:translateX(-50%);text-align:center;width:80%;font-size:0.45rem;color:${theme.textMuted};line-height:1.4;">${ws.leftText.replace(/\n/g, '<br>')}</div>` : ''}
            <button style="${btnStyle}">Lihat Katalog</button>
        </div>`;
    }

    renderPreviewMinimal(ws, theme) {
        const bgUrl = ws.backgroundImageUrl || ws.backgroundImage;
        let bgStyle;
        if (bgUrl) {
            bgStyle = `background: linear-gradient(rgba(255,255,255,${(ws.backgroundOpacity || 50)/100}), rgba(255,255,255,${(ws.backgroundOpacity || 50)/100})), url('${bgUrl}') center/cover;`;
        } else {
            bgStyle = `background:${theme.bgLight};`;
        }
        const logoStyle = this.getLogoStyle(ws);
        const titleStyle = this.getTitleStyle(ws);
        const btnStyle = this.getBtnStyle(ws);
        const logoUrl = ws.logoUrl || ws.logo;
        const logoHtml = logoUrl
            ? `<img src="${logoUrl}" style="${logoStyle}">`
            : `<div style="${logoStyle}" class="preview-logo-placeholder">📷</div>`;

        return `
        <div style="width:100%;height:100%;${bgStyle}padding:10%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
            <div style="position:absolute;top:8%;right:8%;width:40px;height:40px;border-top:1px solid ${theme.textMuted};border-right:1px solid ${theme.textMuted};"></div>
            <div style="position:absolute;bottom:8%;left:8%;width:40px;height:40px;border-bottom:1px solid ${theme.textMuted};border-left:1px solid ${theme.textMuted};"></div>
            ${logoHtml}
            <div style="${titleStyle}">
                <p style="color:${theme.textMuted};font-size:${ws.subtitleSize || 14}px;letter-spacing:0.2em;margin-bottom:4%;text-transform:uppercase;">${ws.subtitle}</p>
                <h1 style="font-family:'${ws.fontFamily}',serif;font-size:1rem;color:${theme.textDark};margin-bottom:6%;font-weight:300;">${ws.title}</h1>
                <div style="width:30px;height:1px;background:${theme.accentAlt};margin-bottom:6%;"></div>
            </div>
            ${ws.description ? `<div style="${this.getDescriptionStyle(ws)}color:${theme.textMuted};font-style:italic;">${ws.description}</div>` : ''}
            ${ws.leftText ? `<div style="position:absolute;left:50%;bottom:15%;transform:translateX(-50%);text-align:center;width:80%;font-size:0.4rem;color:${theme.textMuted};line-height:1.4;">${ws.leftText.replace(/\n/g, '<br>')}</div>` : ''}
            <button style="${btnStyle}">Lihat Katalog</button>
        </div>`;
    }

    handleWelcomeLogoUpload(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.welcomeLogoData = e.target.result;
            document.getElementById('wsLogoPreview').src = e.target.result;
            document.getElementById('wsLogoPreview').style.display = 'block';
            document.getElementById('wsLogoPlaceholder').style.display = 'none';
            document.getElementById('wsLogoRemoveBtn').style.display = 'inline-block';
            if (!this.welcomeSettings) this.welcomeSettings = {};
            this.welcomeSettings.logo = e.target.result;
            this.updateWelcomePreview();
        };
        reader.readAsDataURL(file);
    }

    removeWelcomeLogo() {
        this.welcomeLogoData = null;
        document.getElementById('wsLogoPreview').style.display = 'none';
        document.getElementById('wsLogoPlaceholder').style.display = 'flex';
        document.getElementById('wsLogoRemoveBtn').style.display = 'none';
        document.getElementById('wsLogoInput').value = '';
        if (!this.welcomeSettings) this.welcomeSettings = {};
        this.welcomeSettings.logo = null;
        this.updateWelcomePreview();
    }
    async saveWelcomeSettings() {
        const col = window.MOTIFKAIN_CONFIG?.welcomeCollection || 'welcome';
        const data = {};
        data.template = this.welcomeSettings ? this.welcomeSettings.template : 'cover-dark';
        data.colorTheme = this.welcomeSettings ? this.welcomeSettings.colorTheme : 'elegant-gold';
        data.fontFamily = document.getElementById('wsFont') ? document.getElementById('wsFont').value : '';
        data.title = document.getElementById('wsTitle') ? document.getElementById('wsTitle').value : '';
        data.subtitle = document.getElementById('wsSubtitle') ? document.getElementById('wsSubtitle').value : '';
        data.description = document.getElementById('wsDescription') ? document.getElementById('wsDescription').value : '';
        data.leftText = document.getElementById('wsLeftText') ? document.getElementById('wsLeftText').value : '';
        data.backgroundOpacity = parseInt(document.getElementById('wsBgOpacity') ? document.getElementById('wsBgOpacity').value : 50);
        data.logoSize = parseInt(document.getElementById('wsLogoSize') ? document.getElementById('wsLogoSize').value : 60);
        data.logoX = parseInt(document.getElementById('wsLogoX') ? document.getElementById('wsLogoX').value : 50);
        data.logoY = parseInt(document.getElementById('wsLogoY') ? document.getElementById('wsLogoY').value : 10);
        data.titleSize = parseInt(document.getElementById('wsTitleSize') ? document.getElementById('wsTitleSize').value : 32);
        data.titleX = parseInt(document.getElementById('wsTitleX') ? document.getElementById('wsTitleX').value : 50);
        data.titleY = parseInt(document.getElementById('wsTitleY') ? document.getElementById('wsTitleY').value : 50);
        data.subtitleSize = parseInt(document.getElementById('wsSubtitleSize') ? document.getElementById('wsSubtitleSize').value : 14);
        data.subtitleX = parseInt(document.getElementById('wsSubtitleX') ? document.getElementById('wsSubtitleX').value : 50);
        data.subtitleY = parseInt(document.getElementById('wsSubtitleY') ? document.getElementById('wsSubtitleY').value : 70);
        data.descriptionSize = parseInt(document.getElementById('wsDescriptionSize') ? document.getElementById('wsDescriptionSize').value : 14);
        data.descriptionX = parseInt(document.getElementById('wsDescriptionX') ? document.getElementById('wsDescriptionX').value : 50);
        data.descriptionY = parseInt(document.getElementById('wsDescriptionY') ? document.getElementById('wsDescriptionY').value : 75);
        data.btnX = parseInt(document.getElementById('wsBtnX') ? document.getElementById('wsBtnX').value : 50);
        data.btnY = parseInt(document.getElementById('wsBtnY') ? document.getElementById('wsBtnY').value : 90);
        data.btnBgColor = document.getElementById('wsBtnBgColor') ? document.getElementById('wsBtnBgColor').value : '#1B5E20';
        data.btnTextColor = document.getElementById('wsBtnTextColor') ? document.getElementById('wsBtnTextColor').value : '#FFFFFF';
        data.btnFontSize = parseInt(document.getElementById('wsBtnFontSize') ? document.getElementById('wsBtnFontSize').value : 14);
        data.splitLeftWidth = parseInt(document.getElementById('wsSplitLeftWidth') ? document.getElementById('wsSplitLeftWidth').value : 40);

        try {
            const formData = new FormData();

            for (const [key, value] of Object.entries(data)) {
                formData.append(key, value);
            }

            if (this.welcomeLogoData) {
                const blob = this.dataURLtoBlob(this.welcomeLogoData);
                formData.append('logo', blob, 'logo.png');
            }

            if (this.welcomeBgData) {
                const blob = this.dataURLtoBlob(this.welcomeBgData);
                formData.append('backgroundImage', blob, 'background.jpg');
            }

            if (this.welcomeSettings && this.welcomeSettings.id) {
                await this.fetchAPI('/api/collections/' + col + '/records/' + this.welcomeSettings.id, {
                    method: 'PATCH',
                    body: formData
                });
            } else {
                const createRes = await this.fetchAPI('/api/collections/' + col + '/records', {
                    method: 'POST',
                    body: formData
                });
                if (createRes.ok) {
                    const newData = await createRes.json();
                    this.welcomeSettings = newData;
                    this.activeWelcomeScreenId = newData.id;
                    localStorage.setItem('motifkain_active_ws', this.activeWelcomeScreenId);
                }
            }

            this.showNotification('Welcome Screen berhasil disimpan!', 'success');
            this.welcomeLogoData = null;
            this.welcomeBgData = null;

            await this.loadAllWelcomeScreens();
            await this.loadWelcomeSettings();
        } catch (e) {
            this.showNotification('Gagal menyimpan: ' + e.message, 'error');
        }
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

    async loadKategori() {
        const col = window.MOTIFKAIN_CONFIG?.kategoriCollection || 'kategori';
        try {
            const res = await this.fetchAPI('/api/collections/' + col + '/records?sort=+order');
            if (res.ok) {
                const data = await res.json();
                this.kategori = data.items || [];
            }
        } catch (e) {
            this.kategori = [
                { id: 'desain-motif', name: 'Desain Motif', slug: 'desain-motif', layanan: null },
                { id: 'printing', name: 'Printing Kain', slug: 'printing', layanan: null },
                { id: 'pakaian', name: 'Pakaian Jadi', slug: 'pakaian', layanan: null },
                { id: 'asesoris', name: 'Asesoris', slug: 'asesoris', layanan: null }
            ];
        }
        this.renderKategori();
        this.populateLayananDropdowns();
    }

    renderKategori(layananFilter) {
        var container = document.getElementById('kategoriList');
        if (!container) return;

        var filtered = this.kategori;
        if (layananFilter) {
            filtered = this.kategori.filter(function(k) {
                return k.layanan === layananFilter || k.layanan_id === layananFilter;
            });
        }

        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Belum ada kategori' + (layananFilter ? ' di layanan ini' : '') + '</p>';
            return;
        }

        var html = '';
        for (var i = 0; i < filtered.length; i++) {
            var k = filtered[i];
            var layananName = '';
            if (k.layanan || k.layanan_id) {
                var layanan = this.layanan.find(function(l) { return l.id === (k.layanan || k.layanan_id); });
                if (layanan) layananName = '<span class="kategori-layanan-badge">' + layanan.name + '</span>';
            }
            html += '<div class="kategori-item">';
            html += '<div class="kategori-icon">' + (k.name.charAt ? k.name.charAt(0).toUpperCase() : '?') + '</div>';
            html += '<div class="kategori-info">';
            html += '<div class="kategori-name">' + k.name + '</div>';
            html += '<div class="kategori-slug">' + k.slug + '</div>';
            if (layananName) html += '<div>' + layananName + '</div>';
            html += '</div>';
            html += '<div class="kategori-actions">';
            html += '<button class="btn btn-sm" onclick="admin.editKategori(\'' + k.id + '\')">Edit</button> ';
            html += '<button class="btn btn-sm btn-danger" onclick="admin.deleteKategori(\'' + k.id + '\')">Hapus</button>';
            html += '</div></div>';
        }
        container.innerHTML = html;
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

    showAddKategoriModal() {
        this.currentKategori = null;
        document.getElementById('kategoriModalTitle').textContent = 'Tambah Kategori';
        document.getElementById('kategoriName').value = '';
        document.getElementById('kategoriSlug').value = '';
        document.getElementById('kategoriOrder').value = this.kategori.length;
        // Populate layanan dropdown
        var select = document.getElementById('kategoriLayanan');
        if (select) {
            select.innerHTML = '<option value="">Pilih Layanan (opsional)</option>';
            for (var i = 0; i < this.layanan.length; i++) {
                var l = this.layanan[i];
                select.innerHTML += '<option value="' + l.id + '">' + l.name + '</option>';
            }
        }
        document.getElementById('kategoriModal').classList.add('active');
    }

    editKategori(id) {
        var k = null;
        for (var i = 0; i < this.kategori.length; i++) {
            if (this.kategori[i].id === id) { k = this.kategori[i]; break; }
        }
        if (!k) return;

        this.currentKategori = k;
        document.getElementById('kategoriModalTitle').textContent = 'Edit Kategori';
        document.getElementById('kategoriName').value = k.name || '';
        document.getElementById('kategoriSlug').value = k.slug || '';
        document.getElementById('kategoriOrder').value = k.order || 0;
        // Populate layanan dropdown
        var select = document.getElementById('kategoriLayanan');
        if (select) {
            select.innerHTML = '<option value="">Pilih Layanan (opsional)</option>';
            for (var i = 0; i < this.layanan.length; i++) {
                var l = this.layanan[i];
                var selected = (k.layanan === l.id || k.layanan_id === l.id) ? ' selected' : '';
                select.innerHTML += '<option value="' + l.id + '"' + selected + '>' + l.name + '</option>';
            }
        }
        document.getElementById('kategoriModal').classList.add('active');
    }

    async saveKategori() {
        var name = document.getElementById('kategoriName').value.trim();
        var slug = document.getElementById('kategoriSlug').value.trim().toLowerCase().replace(/\s+/g, '-');
        var order = parseInt(document.getElementById('kategoriOrder').value) || 0;
        var layanan = document.getElementById('kategoriLayanan').value;

        if (!name || !slug) {
            this.showNotification('Nama dan slug wajib diisi!', 'error');
            return;
        }

        var data = { name: name, slug: slug, order: order };
        if (layanan) data.layanan = layanan;

        var col = window.MOTIFKAIN_CONFIG?.kategoriCollection || 'kategori';
        var self = this;

        try {
            if (this.currentKategori) {
                await this.fetchAPI('/api/collections/' + col + '/records/' + this.currentKategori.id, { method: 'PATCH', body: JSON.stringify(data) });
                this.showNotification('Berhasil disimpan!', 'success');
            } else {
                await this.fetchAPI('/api/collections/' + col + '/records', { method: 'POST', body: JSON.stringify(data) });
                this.showNotification('Berhasil ditambahkan!', 'success');
            }
        } catch (e) {
            this.showNotification('Gagal menyimpan: ' + e.message, 'error');
        }

        this.closeModal('kategoriModal');
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
        document.getElementById('productModalTitle').textContent = 'Tambah Produk';
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
