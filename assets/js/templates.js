/**
 * MOTIFKAIN PAGE TEMPLATES - INSTAGRAM 4:5 PORTRAIT STYLE
 * Ukuran: 1080x1350 (Instagram Portrait)
 */

// ===== COLOR THEMES =====
const ColorThemes = {
    themes: {
        'elegant-gold': {
            name: 'Elegant Gold',
            primary: '#5D4037',      // Coklat gelap
            secondary: '#8D6E63',   // Coklat medium
            accent: '#C9A66B',       // Emas
            accentAlt: '#008B8B',     // Teal
            textDark: '#1a1a1a',
            textLight: '#6D4C41',
            textMuted: '#A1887F',
            bgLight: '#FFF8F0',       // Cream
            bgDark: '#1a2a3a',       // Biru gelap
            bgCard: '#FFFFFF',
            bgMuted: '#F5F0E8'
        },
        'ocean-blue': {
            name: 'Ocean Blue',
            primary: '#1E3A5F',      // Biru gelap
            secondary: '#4A90A4',     // Biru medium
            accent: '#E8F4F8',        // Biru sangat muda
            accentAlt: '#26C6DA',     // Cyan
            textDark: '#0D2137',
            textLight: '#3D5A73',
            textMuted: '#78909C',
            bgLight: '#F0F8FF',       // AliceBlue
            bgDark: '#0D2137',        // Biru sangat gelap
            bgCard: '#FFFFFF',
            bgMuted: '#E1F5FE'
        },
        'forest-green': {
            name: 'Forest Green',
            primary: '#2D4739',      // Hijau gelap
            secondary: '#4CAF50',    // Hijau
            accent: '#A5D6A7',        // Hijau muda
            accentAlt: '#8BC34A',     // Lime
            textDark: '#1B3324',
            textLight: '#3D5C4A',
            textMuted: '#689F63',
            bgLight: '#F1F8E9',       // Hijau sangat muda
            bgDark: '#1B3324',        // Hijau sangat gelap
            bgCard: '#FFFFFF',
            bgMuted: '#DCEDC8'
        },
        'sunset-orange': {
            name: 'Sunset Orange',
            primary: '#D84315',      // Oranye gelap
            secondary: '#FF7043',     // Oranye
            accent: '#FFCCBC',        // Peach
            accentAlt: '#FF5722',     // Deep Orange
            textDark: '#4E2410',
            textLight: '#8B4513',
            textMuted: '#BCAAA4',
            bgLight: '#FBE9E7',       // Peach sangat muda
            bgDark: '#3E2723',        // Coklat sangat gelap
            bgCard: '#FFFFFF',
            bgMuted: '#FFECB3'
        },
        'royal-purple': {
            name: 'Royal Purple',
            primary: '#4A148C',      // Ungu gelap
            secondary: '#9C27B0',    // Ungu
            accent: '#E1BEE7',        // Lavender
            accentAlt: '#AB47BC',     // Ungu medium
            textDark: '#2E1A47',
            textLight: '#5E3577',
            textMuted: '#9575CD',
            bgLight: '#F3E5F5',       // Ungu sangat muda
            bgDark: '#2E1A47',        // Ungu sangat gelap
            bgCard: '#FFFFFF',
            bgMuted: '#EDE7F6'
        },
        'monochrome': {
            name: 'Monochrome',
            primary: '#212121',      // Hitam
            secondary: '#616161',    // Abu-abu gelap
            accent: '#BDBDBD',        // Abu-abu
            accentAlt: '#424242',     // Abu-abu medium
            textDark: '#000000',
            textLight: '#424242',
            textMuted: '#9E9E9E',
            bgLight: '#FAFAFA',       // Putihabu
            bgDark: '#000000',        // Hitam
            bgCard: '#FFFFFF',
            bgMuted: '#F5F5F5'
        },
        'rose-gold': {
            name: 'Rose Gold',
            primary: '#8B5A5A',      // Muted rose
            secondary: '#D4A5A5',    // Rose
            accent: '#E8C4C4',        // Blush
            accentAlt: '#C77B7B',     // Dusty rose
            textDark: '#4A2C2C',
            textLight: '#6B4444',
            textMuted: '#A89090',
            bgLight: '#FFF5F5',       // Rose sangat muda
            bgDark: '#3D2020',       // Muted burgundy
            bgCard: '#FFFFFF',
            bgMuted: '#FFE4E1'
        },
        'earth-brown': {
            name: 'Earth Brown',
            primary: '#5D4037',      // Coklat
            secondary: '#A1887F',    // Taupe
            accent: '#D7CCC8',        // Sand
            accentAlt: '#795548',     // Coklat medium
            textDark: '#3E2723',
            textLight: '#5D4037',
            textMuted: '#8D6E63',
            bgLight: '#EFEBE9',       // Cream coklat
            bgDark: '#3E2723',        // Coklat gelap
            bgCard: '#FFFFFF',
            bgMuted: '#D7CCC8'
        }
    },

    getTheme(id) {
        return this.themes[id] || this.themes['elegant-gold'];
    },

    getAllThemes() {
        return Object.values(this.themes);
    }
};

const PageTemplates = {
    templates: {
        // Cover Templates
        'cover-dark': { id: 'cover-dark', name: 'Cover Gelap', icon: '◼' },
        'cover-light': { id: 'cover-light', name: 'Cover Terang', icon: '◻' },
        'cover-split': { id: 'cover-split', name: 'Cover Split', icon: '◧' },
        'cover-numbered': { id: 'cover-numbered', name: 'Cover Nomor', icon: '№' },
        'cover-minimal': { id: 'cover-minimal', name: 'Cover Minimal', icon: '◇' },
        'cover-logo-left': { id: 'cover-logo-left', name: 'Logo Kiri', icon: '◈' },
        // Content Templates
        'image-full': { id: 'image-full', name: 'Gambar Penuh', icon: '◉' },
        'image-text': { id: 'image-text', name: 'Gambar + Teks', icon: '◗' },
        'text-image': { id: 'text-image', name: 'Teks + Gambar', icon: '◖' },
        'text-only': { id: 'text-only', name: 'Teks Saja', icon: '☰' },
        'image-split': { id: 'image-split', name: 'Split 50/50', icon: '▯' },
        'text-grid': { id: 'text-grid', name: 'Teks + Grid', icon: '▦' },
        'text-left-image': { id: 'text-left-image', name: 'Teks Kiri + Gambar', icon: '◂' },
        'numbered-list': { id: 'numbered-list', name: 'Daftar Nomor', icon: '①' },
        'image-dual': { id: 'image-dual', name: 'Dual Gambar', icon: '⊘' },
        // Gallery Templates
        'gallery-2x2': { id: 'gallery-2x2', name: 'Gallery 2x2', icon: '⊞' },
        'gallery-3x3': { id: 'gallery-3x3', name: 'Gallery 3x3', icon: '⊟' },
        'gallery-masonry': { id: 'gallery-masonry', name: 'Gallery Masonry', icon: '▤' }
    },

    getTemplate(id) { return this.templates[id] || this.templates['cover-dark']; },
    getAllTemplates() { return Object.values(this.templates); },

    createEmptyPage(templateId = 'cover-dark') {
        const p = {
            id: Date.now(),
            template: templateId,
            createdAt: new Date().toISOString(),
            order: 0,
            // Default styling
            colorTheme: 'elegant-gold',
            fontFamily: 'Playfair Display',
            fontSizePx: 24,
            titleSizePx: 36,
            bodySizePx: 14,
            logoSizePx: 40
        };
        switch(templateId) {
            case 'cover-dark':
                p.mainTitle = 'MOTIFKAIN';
                p.subtitle = 'Koleksi Desain 2024';
                p.description = 'Desain motif kain eksklusif';
                break;
            case 'cover-light':
                p.mainTitle = 'MOTIFKAIN';
                p.subtitle = 'Koleksi Desain 2024';
                p.description = 'Desain motif kain eksklusif';
                break;
            case 'cover-split':
                p.mainTitle = 'CATALOGUE';
                p.subtitle = 'Company Profile';
                p.description = 'Koleksi produk eksklusif kami';
                p.header = 'LOREM';
                p.body = 'Deskripsi singkat tentang koleksi atau perusahaan Anda.';
                break;
            case 'cover-numbered':
                p.mainTitle = 'CATALOGUE';
                p.subtitle = 'Exhibition';
                p.header = '01';
                p.body = 'Deskripsi koleksi atau produk pertama';
                p.footerText = 'www.company.com';
                break;
            case 'cover-minimal':
                p.mainTitle = 'CATALOGUE';
                p.subtitle = 'Company Name';
                p.body = 'Tagline atau slogan perusahaan';
                break;
            case 'image-full':
                p.overlayText = '';
                p.overlayPosition = 'bottom';
                break;
            case 'image-text':
                p.title = 'Nama Produk';
                p.description = 'Deskripsi produk';
                break;
            case 'text-image':
                p.title = 'Nama Produk';
                p.description = 'Deskripsi produk';
                break;
            case 'text-only':
                p.title = 'Judul';
                p.subtitle = 'Subtitle';
                p.body = 'Isi teks...';
                break;
            case 'gallery-2x2':
                p.header = 'Gallery';
                break;
            case 'gallery-3x3':
                p.header = 'Gallery';
                p.images = ['','','','','','','','',''];
                break;
            case 'gallery-masonry':
                p.header = 'Gallery';
                p.images = ['','','',''];
                break;
            case 'image-split':
                p.title = 'Judul Produk';
                p.description = 'Deskripsi produk atau layanan Anda';
                p.overlayText = '';
                break;
            case 'text-grid':
                p.title = 'Judul Section';
                p.subtitle = 'Subtitle';
                p.body = 'Deskripsi singkat tentang koleksi ini.';
                p.footerText = 'Info tambahan';
                break;
            case 'text-left-image':
                p.title = 'LOREM IPSUM';
                p.subtitle = 'Subtitle';
                p.body = 'Deskripsi produk atau layanan Anda di sini.';
                p.footerText = 'www.company.com';
                break;
            case 'numbered-list':
                p.title = 'CATALOGUE';
                p.subtitle = 'Section';
                p.header = '01';
                p.body = 'Deskripsi untuk item 01';
                p.overlayText = '02';
                p.overlayPosition = '02';
                break;
            case 'image-dual':
                p.title = 'Judul';
                p.description = 'Deskripsi singkat';
                break;
            case 'cover-logo-left':
                p.mainTitle = 'CATALOGUE';
                p.subtitle = 'Company Profile';
                p.header = 'LOREM';
                p.body = 'Deskripsi singkat tentang perusahaan Anda.';
                break;
        }
        return p;
    },

    // Render page content
    renderPage(pageData, pageNum) {
        const t = pageData.template || 'cover-dark';
        switch(t) {
            // Cover Templates
            case 'cover-dark': return this.renderCoverDark(pageData, pageNum);
            case 'cover-light': return this.renderCoverLight(pageData, pageNum);
            case 'cover-split': return this.renderCoverSplit(pageData, pageNum);
            case 'cover-numbered': return this.renderCoverNumbered(pageData, pageNum);
            case 'cover-minimal': return this.renderCoverMinimal(pageData, pageNum);
            case 'cover-logo-left': return this.renderCoverLogoLeft(pageData, pageNum);
            // Content Templates
            case 'image-full': return this.renderImageFull(pageData, pageNum);
            case 'image-text': return this.renderImageText(pageData, pageNum);
            case 'text-image': return this.renderTextImage(pageData, pageNum);
            case 'text-only': return this.renderTextOnly(pageData, pageNum);
            case 'image-split': return this.renderImageSplit(pageData, pageNum);
            case 'text-grid': return this.renderTextGrid(pageData, pageNum);
            case 'text-left-image': return this.renderTextLeftImage(pageData, pageNum);
            case 'numbered-list': return this.renderNumberedList(pageData, pageNum);
            case 'image-dual': return this.renderImageDual(pageData, pageNum);
            // Gallery Templates
            case 'gallery-2x2': return this.renderGallery2x2(pageData, pageNum);
            case 'gallery-3x3': return this.renderGallery3x3(pageData, pageNum);
            case 'gallery-masonry': return this.renderGalleryMasonry(pageData, pageNum);
            default: return this.renderCoverDark(pageData, pageNum);
        }
    },

    // Helper to get logo style based on size setting
    getLogoStyle(data, invert = false) {
        const size = data.logoSizePx ? data.logoSizePx + 'px' : '40px';
        let style = `height:${size};`;
        // Only invert if explicitly requested (for images on very dark backgrounds)
        if (invert) {
            style += 'filter:brightness(0)invert(1);opacity:0.9;';
        }
        return style;
    },

    // Helper to get style properties (PIXEL BASED + THEMED)
    getStyleProps(data) {
        // Get theme colors if theme is selected
        const theme = data.colorTheme ? ColorThemes.getTheme(data.colorTheme) : null;

        return {
            fontFamily: data.fontFamily || 'Playfair Display',
            titleSize: data.titleSizePx ? data.titleSizePx + 'px' : '36px',
            subtitleSize: data.fontSizePx ? (Math.round(data.fontSizePx * 0.7)) + 'px' : '16px',
            bodySize: data.bodySizePx ? data.bodySizePx + 'px' : '14px',
            fontSize: data.fontSizePx ? data.fontSizePx + 'px' : '24px',
            // Logo size
            logoSize: data.logoSizePx ? data.logoSizePx + 'px' : '40px',
            // Colors - use theme if available, else use custom
            textColor: theme ? theme.textDark : (data.textColor || '#1a1a1a'),
            bgColor: theme ? theme.bgLight : (data.bgColor || '#ffffff'),
            bgDark: theme ? theme.bgDark : (data.bgColorDark || '#1a1a1a'),
            bgCard: theme ? theme.bgCard : '#ffffff',
            primary: theme ? theme.primary : '#5D4037',
            secondary: theme ? theme.secondary : '#8D6E63',
            accent: theme ? theme.accent : '#C9A66B',
            accentAlt: theme ? theme.accentAlt : '#008B8B',
            textMuted: theme ? theme.textMuted : '#A1887F',
            // Legacy props for backward compatibility
            textColorLegacy: data.textColor || '#1a1a1a',
            bgColorLegacy: data.bgColor || '#ffffff'
        };
    },

    // Cover Dark - Gradient gelap premium
    renderCoverDark(data, num) {
        const style = this.getStyleProps(data);
        return `
        <div style="width:100%;height:100%;background:linear-gradient(180deg,${style.bgDark} 0%,${style.primary} 100%);padding:8%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
            <!-- Decorative corner -->
            <div style="position:absolute;top:5%;left:5%;width:40px;height:40px;border-top:2px solid ${style.accent};border-left:2px solid ${style.accent};opacity:0.4;"></div>
            <div style="position:absolute;bottom:5%;right:5%;width:40px;height:40px;border-bottom:2px solid ${style.accent};border-right:2px solid ${style.accent};opacity:0.4;"></div>

            <!-- Logo area -->
            <div style="text-align:center;margin-bottom:auto;">
                ${data.logo ? `<img src="${data.logo}" style="${this.getLogoStyle(data)}margin-bottom:3%;">` : ''}
            </div>

            <!-- Main content -->
            <div style="text-align:center;flex:1;display:flex;flex-direction:column;justify-content:center;">
                <h1 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:#fff;margin-bottom:2%;letter-spacing:0.05em;">${data.mainTitle || 'MOTIFKAIN'}</h1>
                <p style="color:${style.accent};font-size:${style.bodySize};letter-spacing:0.3em;margin-bottom:4%;">${data.subtitle || 'KOLEKSI DESAIN'}</p>
                <div style="width:50px;height:2px;background:linear-gradient(90deg,transparent,${style.accent},transparent);margin:0 auto;"></div>
                ${data.description ? `<p style="color:rgba(255,255,255,0.5);font-size:${style.bodySize};margin-top:4%;line-height:1.6;">${data.description}</p>` : ''}
            </div>

            <!-- Footer -->
            <div style="text-align:center;padding-top:5%;border-top:1px solid rgba(255,255,255,0.1);">
                <span style="color:rgba(255,255,255,0.3);font-size:${style.bodySize};">motifkain.com</span>
            </div>
        </div>`;
    },

    // Cover Light - Cream/beige premium
    renderCoverLight(data, num) {
        const style = this.getStyleProps(data);
        return `
        <div style="width:100%;height:100%;background:${style.bgColor};padding:8%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
            <!-- Decorative -->
            <div style="position:absolute;top:5%;right:5%;width:30px;height:30px;border-top:2px solid ${style.accentAlt};border-right:2px solid ${style.accentAlt};opacity:0.3;"></div>

            <!-- Logo area -->
            <div style="text-align:center;margin-bottom:auto;">
                ${data.logo ? `<img src="${data.logo}" style="${this.getLogoStyle(data)}margin-bottom:3%;">` : ''}
            </div>

            <!-- Main content -->
            <div style="text-align:center;flex:1;display:flex;flex-direction:column;justify-content:center;">
                <h1 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:${style.textColor};margin-bottom:2%;">${data.mainTitle || 'MOTIFKAIN'}</h1>
                <p style="color:${style.accentAlt};font-size:${style.bodySize};letter-spacing:0.3em;margin-bottom:4%;">${data.subtitle || 'KOLEKSI DESAIN'}</p>
                <div style="width:50px;height:2px;background:${style.accent};margin:0 auto;"></div>
                ${data.description ? `<p style="color:${style.textMuted};font-size:${style.bodySize};margin-top:4%;line-height:1.6;">${data.description}</p>` : ''}
            </div>

            <!-- Footer -->
            <div style="text-align:center;padding-top:5%;border-top:1px solid ${style.bgMuted};">
                <span style="color:${style.textMuted};font-size:${style.bodySize};">motifkain.com</span>
            </div>
        </div>`;
    },

    // Image Full - Gambar penuh dengan overlay
    renderImageFull(data, num) {
        const style = this.getStyleProps(data);
        const textPosition = data.overlayPosition === 'top' ? 'top:5%;transform:none;' : 'bottom:8%;';
        return `
        <div style="width:100%;height:100%;background:${style.bgColor};position:relative;display:flex;flex-direction:column;">
            ${data.logo ? `<div style="position:absolute;top:5%;left:5%;z-index:10;"><img src="${data.logo}" style="${this.getLogoStyle(data)}"></div>` : ''}

            <div style="flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                ${data.image ? `<img src="${data.image}" class="catalog-image" style="width:100%;height:100%;object-fit:cover;">` : `
                <div style="text-align:center;color:rgba(255,255,255,0.3);">
                    <div style="font-size:3rem;margin-bottom:5%;">📷</div>
                    <span style="font-size:${style.bodySize};">Tambahkan Gambar</span>
                </div>`}
            </div>

            ${data.overlayText ? `
            <div style="position:absolute;left:0;right:0;${textPosition}text-align:center;padding:0 8%;">
                <p style="color:#fff;font-size:${style.bodySize};text-shadow:0 2px 10px rgba(0,0,0,0.8);line-height:1.5;">${data.overlayText}</p>
            </div>` : ''}

            <div style="padding:4% 6%;background:linear-gradient(transparent,rgba(0,0,0,0.7));display:flex;justify-content:space-between;align-items:center;">
                <span style="color:${style.accent};font-size:${style.bodySize};font-weight:600;">MOTIFKAIN</span>
                <span style="color:rgba(255,255,255,0.5);font-size:${style.bodySize};">motifkain.com</span>
            </div>
        </div>`;
    },

    // Image + Text - Gambar di atas, teks di bawah
    renderImageText(data, num) {
        const style = this.getStyleProps(data);
        return `
        <div style="width:100%;height:100%;background:${style.bgColor};display:flex;flex-direction:column;">
            <!-- Image section (60%) -->
            <div style="flex:0 0 60%;position:relative;overflow:hidden;background:#f0f0f0;display:flex;align-items:center;justify-content:center;">
                ${data.image ? `<img src="${data.image}" class="catalog-image" style="width:100%;height:100%;object-fit:contain;">` : `
                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:3rem;opacity:0.2;">📷</span>
                </div>`}
                ${data.logo ? `<div style="position:absolute;top:5%;right:5%;"><img src="${data.logo}" style="${this.getLogoStyle(data)}opacity:0.9;"></div>` : ''}
            </div>

            <!-- Text section (40%) -->
            <div style="flex:0 0 40%;background:${style.bgCard};padding:8%;display:flex;flex-direction:column;justify-content:center;">
                <div style="width:30px;height:2px;background:${style.accentAlt};margin-bottom:5%;"></div>
                <h2 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:${style.textColor};margin-bottom:4%;line-height:1.2;">${data.title || 'Nama Produk'}</h2>
                <p style="color:${style.textMuted};font-size:${style.bodySize};line-height:1.6;flex:1;">${data.description || ''}</p>
                <div style="margin-top:auto;padding-top:5%;border-top:1px solid ${style.bgMuted};">
                    <span style="color:${style.accentAlt};font-size:${style.bodySize};">motifkain.com</span>
                </div>
            </div>
        </div>`;
    },

    // Text + Image - Teks di atas, gambar di bawah
    // Text + Image - Teks di atas, gambar di bawah
    renderTextImage(data, num) {
        const style = this.getStyleProps(data);
        return `
        <div style="width:100%;height:100%;background:${style.bgColor};display:flex;flex-direction:column;">
            <!-- Text section (40%) -->
            <div style="flex:0 0 40%;padding:8%;display:flex;flex-direction:column;justify-content:center;background:${style.bgCard};">
                ${data.logo ? `<div style="margin-bottom:5%;"><img src="${data.logo}" style="${this.getLogoStyle(data)}"></div>` : `<div style="width:30px;height:2px;background:${style.accentAlt};margin-bottom:5%;"></div>`}
                <h2 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:${style.textColor};margin-bottom:4%;line-height:1.2;">${data.title || 'Nama Produk'}</h2>
                <p style="color:${style.textMuted};font-size:${style.bodySize};line-height:1.6;flex:1;">${data.description || ''}</p>
                <div style="margin-top:auto;padding-top:5%;border-top:1px solid ${style.bgMuted};">
                    <span style="color:${style.accentAlt};font-size:${style.bodySize};">motifkain.com</span>
                </div>
            </div>

            // Image section (60%) -->
            <div style="flex:0 0 60%;position:relative;overflow:hidden;background:#f0f0f0;display:flex;align-items:center;justify-content:center;">
                ${data.image ? `<img src="${data.image}" class="catalog-image" style="width:100%;height:100%;object-fit:contain;">` : `
                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:3rem;opacity:0.2;">📷</span>
                </div>`}
            </div>
        </div>`;
    },

    // Text Only - Teks saja premium
    renderTextOnly(data, num) {
        const style = this.getStyleProps(data);
        return `
        <div style="width:100%;height:100%;background:${style.bgColor};padding:10%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
            ${data.logo ? `<div style="margin-bottom:auto;"><img src="${data.logo}" style="${this.getLogoStyle(data)}"></div>` : ''}

            <div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;">
                ${data.subtitle ? `<p style="color:${style.accentAlt};font-size:${style.subtitleSize};letter-spacing:0.2em;margin-bottom:3%;">${data.subtitle}</p>` : ''}
                <h2 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:${style.textColor};margin-bottom:5%;line-height:1.2;">${data.title || 'Judul'}</h2>
                <div style="width:50px;height:2px;background:${style.accent};margin:0 auto 5%;"></div>
                ${data.body ? `<p style="color:${style.textMuted};font-size:${style.bodySize};line-height:1.8;">${data.body}</p>` : ''}
            </div>

            <div style="text-align:center;margin-top:auto;padding-top:5%;border-top:1px solid ${style.bgMuted};">
                <span style="color:${style.textMuted};font-size:${style.bodySize};">motifkain.com</span>
            </div>
        </div>`;
    },

    // Gallery 2x2 - Grid 2x2 gambar - LEBIH BESAR
    renderGallery2x2(data, num) {
        const style = this.getStyleProps(data);
        const imgs = data.images || ['','','',''];
        return `
        <div style="width:100%;height:100%;background:${style.bgColor};display:flex;flex-direction:column;padding:5%;">
            <!-- Header -->
            <div style="margin-bottom:4%;">
                ${data.logo ? `<div style="margin-bottom:3%;"><img src="${data.logo}" style="${this.getLogoStyle(data)}"></div>` : ''}
                <h2 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:${style.textColor};">${data.header || 'Gallery'}</h2>
                <div style="width:30px;height:2px;background:${style.accentAlt};margin-top:3%;"></div>
            </div>

            <!-- Grid 2x2 - LEBIH BESAR -->
            <div style="flex:1;display:grid;grid-template-columns:repeat(2,1fr);gap:5%;overflow:hidden;">
                ${imgs.map((img, i) => `
                    <div style="background:#f0f0f0;border-radius:6px;overflow:hidden;aspect-ratio:1;display:flex;align-items:center;justify-content:center;">
                        ${img ? `<img src="${img}" class="catalog-image" style="width:100%;height:100%;object-fit:contain;">` : `<span style="font-size:${style.bodySize};opacity:0.12;">📷</span>`}
                    </div>
                `).join('')}
            </div>

            <!-- Footer -->
            <div style="margin-top:3%;padding-top:3%;border-top:1px solid ${style.bgMuted};display:flex;justify-content:space-between;align-items:center;">
                <span style="color:${style.textMuted};font-size:${style.bodySize};">${data.footerText || 'MotifKain'}</span>
                <span style="color:${style.accentAlt};font-size:${style.bodySize};">motifkain.com</span>
            </div>
        </div>`;
    },

    // Gallery 3x3 - Grid 9 gambar - LEBIH BESAR
    renderGallery3x3(data, num) {
        const style = this.getStyleProps(data);
        const imgs = data.images || ['','','','','','','','',''];
        return `
        <div style="width:100%;height:100%;background:${style.bgColor};display:flex;flex-direction:column;padding:4%;">
            <div style="margin-bottom:3%;">
                ${data.logo ? `<div style="margin-bottom:2%;"><img src="${data.logo}" style="${this.getLogoStyle(data)}"></div>` : ''}
                <h2 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:${style.textColor};">${data.header || 'Gallery'}</h2>
                <div style="width:25px;height:2px;background:${style.accentAlt};margin-top:2%;"></div>
            </div>
            <div style="flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:4%;overflow:hidden;">
                ${imgs.map((img, i) => `
                    <div style="background:#f0f0f0;border-radius:6px;overflow:hidden;aspect-ratio:1;display:flex;align-items:center;justify-content:center;">
                        ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:contain;">` : `<span style="font-size:${style.bodySize};opacity:0.12;">📷</span>`}
                    </div>
                `).join('')}
            </div>
            <div style="margin-top:3%;padding-top:2%;border-top:1px solid ${style.bgMuted};display:flex;justify-content:space-between;align-items:center;">
                <span style="color:${style.textMuted};font-size:${style.bodySize};">${data.footerText || 'MotifKain'}</span>
                <span style="color:${style.accentAlt};font-size:${style.bodySize};">motifkain.com</span>
            </div>
        </div>`;
    },

    // ===== TEMPLATE BARU =====

    // Cover Split - Kiri gelap, kanan terang
    renderCoverSplit(data, num) {
        const style = this.getStyleProps(data);
        return `
        <div style="width:100%;height:100%;display:flex;">
            <!-- Kiri - Gelap -->
            <div style="width:40%;height:100%;background:${style.bgDark};padding:6%;display:flex;flex-direction:column;position:relative;">
                <div style="position:absolute;top:5%;left:5%;width:25px;height:25px;border-top:1px solid rgba(255,255,255,0.3);border-left:1px solid rgba(255,255,255,0.3);"></div>
                ${data.logo ? `<img src="${data.logo}" style="${this.getLogoStyle(data)}margin-bottom:15%;margin-top:auto;">` : `<span style="color:rgba(255,255,255,0.5);font-size:${style.bodySize};margin-bottom:15%;margin-top:auto;">LOGO</span>`}
                <div style="width:25px;height:1px;background:${style.accent};margin-bottom:10%;"></div>
                <p style="color:rgba(255,255,255,0.4);font-size:${style.bodySize};line-height:1.8;">${data.header || 'LOREM IPSUM'}</p>
                <p style="color:rgba(255,255,255,0.6);font-size:${style.bodySize};margin-top:5%;line-height:1.6;">${data.body || 'Deskripsi singkat tentang koleksi Anda.'}</p>
                <p style="color:rgba(255,255,255,0.3);font-size:${style.bodySize};margin-top:auto;">website.motifkain.com</p>
                <div style="position:absolute;bottom:5%;right:5%;width:25px;height:25px;border-bottom:1px solid rgba(255,255,255,0.3);border-right:1px solid rgba(255,255,255,0.3);"></div>
            </div>
            <!-- Kanan - Terang -->
            <div style="width:60%;height:100%;background:${style.bgCard};padding:8%;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;">
                <div style="position:absolute;top:5%;right:5%;width:30px;height:30px;border-top:2px solid ${style.accentAlt};border-right:2px solid ${style.accentAlt};opacity:0.3;"></div>
                ${data.image ? `<img src="${data.image}" style="position:absolute;top:0;right:0;width:60%;height:100%;object-fit:cover;opacity:0.1;">` : `
                <div style="position:absolute;top:15%;right:10%;font-size:${style.titleSize};opacity:0.05;color:${style.textColor};">📷</div>`}
                <div style="width:35px;height:1px;background:${style.bgMuted};margin-bottom:8%;"></div>
                <h1 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:${style.textColor};margin-bottom:3%;line-height:1.1;">${data.mainTitle || 'CATALOGUE'}</h1>
                <p style="color:${style.accentAlt};font-size:${style.bodySize};letter-spacing:0.2em;margin-bottom:5%;">${data.subtitle || 'COMPANY PROFILE'}</p>
                <div style="width:40px;height:2px;background:${style.textColor};margin-bottom:8%;"></div>
                <p style="color:${style.textMuted};font-size:${style.bodySize};line-height:1.8;">${data.description || 'Koleksi produk eksklusif kami'}</p>
                <p style="color:${style.textMuted};font-size:${style.bodySize};margin-top:auto;">www.motifkain.com</p>
            </div>
        </div>`;
    },

    // Cover Numbered - Dengan nomor besar
    renderCoverNumbered(data, num) {
        const style = this.getStyleProps(data);
        const largeNum = parseInt(data.titleSizePx || 36) + 20 + 'px';
        return `
        <div style="width:100%;height:100%;background:${style.bgDark};padding:8%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
            <!-- Garis diagonal dekoratif -->
            <div style="position:absolute;top:0;right:0;width:40%;height:100%;background:linear-gradient(135deg,transparent 49%,rgba(255,255,255,0.03) 50%,transparent 51%);"></div>
            ${data.logo ? `<div style="margin-bottom:auto;"><img src="${data.logo}" style="${this.getLogoStyle(data)}opacity:0.9;"></div>` : ''}
            <div style="display:flex;align-items:flex-start;gap:5%;flex:1;">
                <div style="width:30%;display:flex;flex-direction:column;justify-content:center;">
                    <h2 style="font-family:'${style.fontFamily}',serif;font-size:${largeNum};color:#fff;font-weight:700;line-height:1;margin-bottom:5%;">${data.header || '01'}</h2>
                    <div style="width:40px;height:1px;background:${style.accent};margin-bottom:10%;"></div>
                    <p style="color:rgba(255,255,255,0.5);font-size:${style.bodySize};line-height:1.8;">${data.body || 'Deskripsi koleksi produk'}</p>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
                    <p style="color:${style.accent};font-size:${style.subtitleSize};letter-spacing:0.3em;margin-bottom:3%;">${data.mainTitle || 'CATALOGUE'}</p>
                    <h1 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:#fff;margin-bottom:5%;">${data.subtitle || 'Exhibition'}</h1>
                    <div style="width:30px;height:1px;background:${style.accent};margin-bottom:5%;"></div>
                    <p style="color:rgba(255,255,255,0.4);font-size:${style.bodySize};line-height:1.8;">${data.description || 'Koleksi produk kami'}</p>
                </div>
            </div>
            <p style="color:rgba(255,255,255,0.3);font-size:${style.bodySize};margin-top:auto;">${data.footerText || 'website.motifkain.com'}</p>
        </div>`;
    },

    // Cover Minimal - Clean & Elegant
    renderCoverMinimal(data, num) {
        const style = this.getStyleProps(data);
        const bigQuote = parseInt(style.titleSize) + 60 + 'px';
        return `
        <div style="width:100%;height:100%;background:${style.bgColor};padding:10%;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;">
            <!-- Elemen dekoratif pojok -->
            <div style="position:absolute;top:8%;right:8%;width:40px;height:40px;border-top:1px solid ${style.textMuted};border-right:1px solid ${style.textMuted};"></div>
            <div style="position:absolute;bottom:8%;left:8%;width:40px;height:40px;border-bottom:1px solid ${style.textMuted};border-left:1px solid ${style.textMuted};"></div>
            <div style="position:absolute;top:5%;left:5%;opacity:0.03;font-size:${bigQuote};color:${style.textColor};">"</div>
            ${data.logo ? `<div style="margin-bottom:15%;"><img src="${data.logo}" style="${this.getLogoStyle(data)}"></div>` : ''}
            <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
                <p style="color:${style.textMuted};font-size:${style.subtitleSize};letter-spacing:0.3em;margin-bottom:5%;text-transform:uppercase;">${data.subtitle || 'Company Name'}</p>
                <h1 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:${style.textColor};margin-bottom:8%;font-weight:300;">${data.mainTitle || 'CATALOGUE'}</h1>
                <div style="width:50px;height:1px;background:${style.accentAlt};margin-bottom:8%;"></div>
                <p style="color:${style.textMuted};font-size:${style.bodySize};line-height:1.8;font-style:italic;">${data.body || 'Tagline atau slogan perusahaan'}</p>
            </div>
            <p style="color:${style.textMuted};font-size:${style.bodySize};margin-top:auto;">www.motifkain.com</p>
        </div>`;
    },

    // Image Split - 50/50 gambar dan teks
    renderImageSplit(data, num) {
        const style = this.getStyleProps(data);
        return `
        <div style="width:100%;height:100%;display:flex;background:${style.bgCard};">
            <!-- Gambar -->
            <div style="width:50%;height:100%;position:relative;overflow:hidden;background:#f0f0f0;display:flex;align-items:center;justify-content:center;">
                ${data.image ? `<img src="${data.image}" class="catalog-image" style="width:100%;height:100%;object-fit:contain;">` : `
                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:${style.titleSize};opacity:0.1;">📷</span>
                </div>`}
                ${data.logo ? `<div style="position:absolute;top:5%;left:5%;"><img src="${data.logo}" style="${this.getLogoStyle(data)}opacity:0.9;"></div>` : ''}
                ${data.overlayText ? `<div style="position:absolute;bottom:5%;left:5%;right:5%;">
                    <p style="color:#fff;font-size:${style.bodySize};text-shadow:0 2px 8px rgba(0,0,0,0.5);line-height:1.4;">${data.overlayText}</p>
                </div>` : ''}
            </div>
            <!-- Teks -->
            <div style="width:50%;height:100%;background:${style.bgDark};padding:8%;display:flex;flex-direction:column;justify-content:center;">
                <div style="width:25px;height:1px;background:${style.accent};margin-bottom:8%;"></div>
                <h2 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:#fff;margin-bottom:5%;line-height:1.3;">${data.title || 'Judul Produk'}</h2>
                <div style="width:30px;height:1px;background:rgba(255,255,255,0.2);margin-bottom:8%;"></div>
                <p style="color:rgba(255,255,255,0.6);font-size:${style.bodySize};line-height:1.8;flex:1;">${data.description || 'Deskripsi produk atau layanan Anda.'}</p>
                <p style="color:${style.accent};font-size:${style.bodySize};margin-top:auto;">${num} / MOTIFKAIN</p>
            </div>
        </div>`;
    },

    // Text Grid - Teks dengan grid info
    renderTextGrid(data, num) {
        const style = this.getStyleProps(data);
        return `
        <div style="width:100%;height:100%;background:${style.bgColor};padding:6%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
            ${data.logo ? `<div style="margin-bottom:4%;"><img src="${data.logo}" style="${this.getLogoStyle(data)}"></div>` : ''}
            <div style="flex:1;display:flex;gap:5%;">
                <!-- Teks Kiri -->
                <div style="flex:0.8;display:flex;flex-direction:column;justify-content:center;">
                    <p style="color:${style.accentAlt};font-size:${style.subtitleSize};letter-spacing:0.2em;margin-bottom:3%;text-transform:uppercase;">${data.subtitle || 'Section'}</p>
                    <h2 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:${style.textColor};margin-bottom:5%;line-height:1.2;">${data.title || 'Judul Section'}</h2>
                    <div style="width:30px;height:2px;background:${style.accent};margin-bottom:5%;"></div>
                    <p style="color:${style.textMuted};font-size:${style.bodySize};line-height:1.7;flex:1;">${data.body || 'Deskripsi singkat tentang koleksi ini.'}</p>
                </div>
                <!-- Grid Kanan - LEBIH BESAR -->
                <div style="flex:1.2;display:grid;grid-template-columns:repeat(2,1fr);gap:6%;align-content:center;">
                    ${[1,2,3,4].map(() => `
                        <div style="aspect-ratio:1;background:${style.bgMuted};border-radius:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                            <span style="font-size:${style.bodySize};opacity:0.08;">📷</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div style="margin-top:4%;padding-top:3%;border-top:1px solid ${style.bgMuted};display:flex;justify-content:space-between;">
                <span style="color:${style.accentAlt};font-size:${style.bodySize};">${data.footerText || 'MotifKain'}</span>
                <span style="color:${style.textMuted};font-size:${style.bodySize};">motifkain.com</span>
            </div>
        </div>`;
    },

    // Gallery Masonry - Grid tidak rata - LEBIH BESAR
    renderGalleryMasonry(data, num) {
        const style = this.getStyleProps(data);
        const bigNum = parseInt(style.titleSize) + 20 + 'px';
        const midNum = parseInt(style.titleSize) + 5 + 'px';
        const imgs = data.images || ['','','','',''];
        return `
        <div style="width:100%;height:100%;background:${style.bgColor};padding:4%;display:flex;flex-direction:column;">
            <div style="margin-bottom:3%;">
                ${data.logo ? `<div style="margin-bottom:2%;"><img src="${data.logo}" style="${this.getLogoStyle(data)}"></div>` : ''}
                <h2 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:${style.textColor};margin-bottom:2%;">${data.header || 'Gallery'}</h2>
                <div style="width:30px;height:2px;background:${style.accentAlt};"></div>
            </div>
            <div style="flex:1;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(3,1fr);gap:4%;overflow:hidden;">
                <div style="grid-column:span 2;grid-row:span 2;background:${style.bgMuted};border-radius:6px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                    ${imgs[0] ? `<img src="${imgs[0]}" style="width:100%;height:100%;object-fit:cover;">` : `<span style="font-size:${bigNum};opacity:0.1;">📷</span>`}
                </div>
                <div style="grid-column:span 2;background:${style.bgMuted};border-radius:6px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                    ${imgs[1] ? `<img src="${imgs[1]}" style="width:100%;height:100%;object-fit:cover;">` : `<span style="font-size:${midNum};opacity:0.1;">📷</span>`}
                </div>
                <div style="grid-row:span 2;background:${style.bgMuted};border-radius:6px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                    ${imgs[2] ? `<img src="${imgs[2]}" style="width:100%;height:100%;object-fit:cover;">` : `<span style="font-size:${midNum};opacity:0.1;">📷</span>`}
                </div>
                <div style="background:${style.bgMuted};border-radius:6px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                    ${imgs[3] ? `<img src="${imgs[3]}" style="width:100%;height:100%;object-fit:cover;">` : `<span style="font-size:${style.bodySize};opacity:0.1;">📷</span>`}
                </div>
                <div style="grid-column:span 2;background:${style.bgMuted};border-radius:6px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                    ${imgs[4] ? `<img src="${imgs[4]}" style="width:100%;height:100%;object-fit:cover;">` : `<span style="font-size:${style.bodySize};opacity:0.1;">📷</span>`}
                </div>
            </div>
        </div>`;
    },

    // Cover Logo Left - Logo di kiri, teks di kanan
    renderCoverLogoLeft(data, num) {
        const style = this.getStyleProps(data);
        return `
        <div style="width:100%;height:100%;display:flex;">
            <!-- Kiri - Area Logo -->
            <div style="width:35%;height:100%;background:${style.bgDark};padding:8%;display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                    ${data.logo ? `<img src="${data.logo}" style="${this.getLogoStyle(data)}margin-bottom:15%;">` : `<div style="padding:15% 20%;background:rgba(255,255,255,0.1);border-radius:8px;margin-bottom:15%;"><span style="color:rgba(255,255,255,0.4);font-size:${style.bodySize};">LOGO</span></div>`}
                    <div style="width:30px;height:1px;background:${style.accent};margin-bottom:10%;"></div>
                </div>
                <div>
                    <p style="color:rgba(255,255,255,0.4);font-size:${style.bodySize};line-height:1.8;letter-spacing:0.1em;">${data.header || 'LOREM IPSUM'}</p>
                    <p style="color:rgba(255,255,255,0.6);font-size:${style.bodySize};margin-top:8%;line-height:1.6;">${data.body || 'Deskripsi singkat'}</p>
                </div>
                <p style="color:rgba(255,255,255,0.25);font-size:${style.bodySize};">website.motifkain.com</p>
            </div>
            <!-- Kanan - Area Teks -->
            <div style="width:65%;height:100%;background:${style.bgCard};padding:10%;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;">
                ${data.image ? `<img src="${data.image}" style="position:absolute;top:0;right:0;width:100%;height:100%;object-fit:cover;opacity:0.08;">` : ''}
                <div style="position:absolute;top:8%;right:8%;width:50px;height:50px;border-top:2px solid ${style.bgMuted};border-right:2px solid ${style.bgMuted};"></div>
                <div style="width:40px;height:1px;background:${style.bgMuted};margin-bottom:10%;"></div>
                <h1 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:${style.textColor};margin-bottom:3%;line-height:1.1;">${data.mainTitle || 'CATALOGUE'}</h1>
                <p style="color:${style.accentAlt};font-size:${style.subtitleSize};letter-spacing:0.25em;margin-bottom:8%;">${data.subtitle || 'COMPANY PROFILE'}</p>
                <div style="width:50px;height:2px;background:${style.textColor};margin-bottom:8%;"></div>
                <p style="color:${style.textMuted};font-size:${style.bodySize};line-height:1.8;">${data.description || 'Koleksi produk eksklusif'}</p>
                <p style="position:absolute;bottom:8%;right:10%;color:${style.textMuted};font-size:${style.bodySize};opacity:0.5;">www.motifkain.com</p>
            </div>
        </div>`;
    },

    // Text Left + Large Image Right
    renderTextLeftImage(data, num) {
        const style = this.getStyleProps(data);
        return `
        <div style="width:100%;height:100%;display:flex;background:${style.bgCard};">
            <!-- Kiri - Teks -->
            <div style="width:40%;height:100%;padding:8%;display:flex;flex-direction:column;justify-content:center;background:${style.bgColor};">
                ${data.logo ? `<img src="${data.logo}" style="${this.getLogoStyle(data)}margin-bottom:10%;">` : ''}
                <h2 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:${style.textColor};margin-bottom:5%;line-height:1.2;">${data.title || 'LOREM IPSUM'}</h2>
                <div style="width:30px;height:2px;background:${style.accent};margin-bottom:8%;"></div>
                <p style="color:${style.textMuted};font-size:${style.bodySize};line-height:1.8;flex:1;">${data.body || 'Deskripsi produk atau layanan Anda.'}</p>
                <p style="color:${style.accentAlt};font-size:${style.bodySize};margin-top:auto;padding-top:5%;border-top:1px solid ${style.bgMuted};">${data.footerText || 'www.company.com'}</p>
            </div>
            <!-- Kanan - Gambar -->
            <div style="width:60%;height:100%;position:relative;overflow:hidden;background:#f0f0f0;display:flex;align-items:center;justify-content:center;">
                ${data.image ? `<img src="${data.image}" class="catalog-image" style="width:100%;height:100%;object-fit:contain;">` : `
                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:${style.titleSize};opacity:0.08;">📷</span>
                </div>`}
            </div>
        </div>`;
    },

    // Numbered List - Seperti halaman catalog exhibition
    renderNumberedList(data, num) {
        const style = this.getStyleProps(data);
        const bigNum = parseInt(style.titleSize) + 10 + 'px';
        return `
        <div style="width:100%;height:100%;background:${style.bgDark};padding:8%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
            <!-- Elemen dekoratif -->
            <div style="position:absolute;top:5%;right:5%;width:30px;height:30px;border-top:1px solid rgba(255,255,255,0.1);border-right:1px solid rgba(255,255,255,0.1);"></div>
            <div style="position:absolute;bottom:5%;left:5%;width:30px;height:30px;border-bottom:1px solid rgba(255,255,255,0.1);border-left:1px solid rgba(255,255,255,0.1);"></div>

            ${data.logo ? `<img src="${data.logo}" style="${this.getLogoStyle(data)}opacity:0.9;margin-bottom:5%;">` : ''}

            <p style="color:${style.accent};font-size:${style.subtitleSize};letter-spacing:0.3em;margin-bottom:3%;">${data.mainTitle || 'CATALOGUE'}</p>
            <h1 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:#fff;margin-bottom:8%;">${data.subtitle || 'Exhibition'}</h1>

            <div style="flex:1;display:flex;flex-direction:column;gap:8%;">
                <!-- Item 01 -->
                <div style="display:flex;gap:8%;">
                    <span style="font-family:'${style.fontFamily}',serif;font-size:${bigNum};color:#fff;font-weight:700;line-height:1;min-width:60px;">01</span>
                    <p style="color:rgba(255,255,255,0.5);font-size:${style.bodySize};line-height:1.7;flex:1;padding-top:3%;">${data.body || 'Deskripsi item pertama'}</p>
                </div>
                <!-- Item 02 -->
                <div style="display:flex;gap:8%;">
                    <span style="font-family:'${style.fontFamily}',serif;font-size:${bigNum};color:#fff;font-weight:700;line-height:1;min-width:60px;">02</span>
                    <p style="color:rgba(255,255,255,0.5);font-size:${style.bodySize};line-height:1.7;flex:1;padding-top:3%;">${data.overlayText || 'Deskripsi item kedua'}</p>
                </div>
                <!-- Item 03 -->
                <div style="display:flex;gap:8%;">
                    <span style="font-family:'${style.fontFamily}',serif;font-size:${bigNum};color:#fff;font-weight:700;line-height:1;min-width:60px;">03</span>
                    <p style="color:rgba(255,255,255,0.5);font-size:${style.bodySize};line-height:1.7;flex:1;padding-top:3%;">${data.overlayPosition || 'Deskripsi item ketiga'}</p>
                </div>
            </div>

            <p style="color:rgba(255,255,255,0.3);font-size:${style.bodySize};margin-top:auto;padding-top:5%;border-top:1px solid rgba(255,255,255,0.1);">${data.footerText || 'website.motifkain.com'}</p>
        </div>`;
    },

    // Image Dual - Dua gambar berdampingan dengan judul
    renderImageDual(data, num) {
        const style = this.getStyleProps(data);
        return `
        <div style="width:100%;height:100%;background:${style.bgColor};display:flex;flex-direction:column;padding:5%;">
            <!-- Header -->
            <div style="margin-bottom:3%;">
                ${data.logo ? `<img src="${data.logo}" style="${this.getLogoStyle(data)}margin-bottom:3%;">` : ''}
                <h2 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:${style.textColor};margin-bottom:2%;">${data.title || 'Judul'}</h2>
                <p style="color:${style.textMuted};font-size:${style.bodySize};line-height:1.6;">${data.description || 'Deskripsi singkat'}</p>
                <div style="width:25px;height:2px;background:${style.accentAlt};margin-top:3%;"></div>
            </div>

            <!-- Dual Images -->
            <div style="flex:1;display:flex;gap:4%;overflow:hidden;">
                <div style="flex:1;background:#f0f0f0;border-radius:6px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                    ${data.image ? `<img src="${data.image}" class="catalog-image" style="width:100%;height:100%;object-fit:contain;">` : `<span style="font-size:${style.titleSize};opacity:0.1;">📷</span>`}
                </div>
                <div style="flex:1;background:#f0f0f0;border-radius:6px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                    ${data.images && data.images[0] ? `<img src="${data.images[0]}" style="width:100%;height:100%;object-fit:contain;">` : `<span style="font-size:${style.titleSize};opacity:0.1;">📷</span>`}
                </div>
            </div>

            <!-- Footer -->
            <div style="margin-top:3%;padding-top:3%;border-top:1px solid ${style.bgMuted};display:flex;justify-content:space-between;">
                <span style="color:${style.textMuted};font-size:${style.bodySize};">${data.footerText || 'MotifKain'}</span>
                <span style="color:${style.accentAlt};font-size:${style.bodySize};">motifkain.com</span>
            </div>
        </div>`;
    },

    // Back Cover
    renderBackCover() {
        return `
        <div style="width:100%;height:100%;background:linear-gradient(180deg,#1a2a3a 0%,#0d1520 100%);padding:10%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
            <h3 style="font-family:'Playfair Display',serif;font-size:36px;color:#fff;margin-bottom:5%;">Terima Kasih</h3>
            <p style="color:rgba(255,255,255,0.5);font-size:14px;margin-bottom:8%;line-height:1.8;">Telah melihat<br>koleksi kami</p>
            <div style="width:40px;height:2px;background:#C9A66B;margin-bottom:8%;"></div>
            <p style="color:#008B8B;font-size:14px;letter-spacing:0.15em;">website.motifkain.com</p>
        </div>`;
    }
};

window.PageTemplates = PageTemplates;
