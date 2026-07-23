/**
 * MOTIFKAIN PAGE TEMPLATES
 * Template untuk Welcome Screen Cover
 */

// ===== COLOR THEMES =====
const ColorThemes = {
    themes: {
        'elegant-gold': {
            name: 'Elegant Gold',
            primary: '#5D4037',
            secondary: '#8D6E63',
            accent: '#C9A66B',
            accentAlt: '#008B8B',
            textDark: '#1a1a1a',
            textLight: '#6D4C41',
            textMuted: '#A1887F',
            bgLight: '#FFF8F0',
            bgDark: '#1a2a3a',
            bgCard: '#FFFFFF',
            bgMuted: '#F5F0E8'
        },
        'elegant-red': {
            name: 'Elegant Red',
            primary: '#8B0000',
            secondary: '#B22222',
            accent: '#CD5C5C',
            accentAlt: '#DC143C',
            textDark: '#1a1a1a',
            textLight: '#4A0404',
            textMuted: '#8B0000',
            bgLight: '#FFF0F0',
            bgDark: '#4A0000',
            bgCard: '#FFFFFF',
            bgMuted: '#FFE4E1'
        },
        'elegant-cream': {
            name: 'Elegant Cream',
            primary: '#8B4513',
            secondary: '#D2691E',
            accent: '#DEB887',
            accentAlt: '#CD853F',
            textDark: '#3D2314',
            textLight: '#5C4033',
            textMuted: '#8B7355',
            bgLight: '#FFF8DC',
            bgDark: '#3D2314',
            bgCard: '#FFFAF0',
            bgMuted: '#FAEBD7'
        },
        'elegant-brown': {
            name: 'Elegant Brown',
            primary: '#3E2723',
            secondary: '#5D4037',
            accent: '#8D6E63',
            accentAlt: '#A1887F',
            textDark: '#1a1a1a',
            textLight: '#4E342E',
            textMuted: '#795548',
            bgLight: '#EFEBE9',
            bgDark: '#3E2723',
            bgCard: '#FFFFFF',
            bgMuted: '#D7CCC8'
        },
        'ocean-blue': {
            name: 'Ocean Blue',
            primary: '#1E3A5F',
            secondary: '#4A90A4',
            accent: '#E8F4F8',
            accentAlt: '#26C6DA',
            textDark: '#0D2137',
            textLight: '#3D5A73',
            bgLight: '#F0F8FF',
            bgDark: '#0D2137',
            bgCard: '#FFFFFF',
            bgMuted: '#E1F5FE'
        },
        'forest-green': {
            name: 'Forest Green',
            primary: '#2D4739',
            secondary: '#4CAF50',
            accent: '#A5D6A7',
            accentAlt: '#8BC34A',
            textDark: '#1B3324',
            textLight: '#3D5C4A',
            bgLight: '#F1F8E9',
            bgDark: '#1B3324',
            bgCard: '#FFFFFF',
            bgMuted: '#DCEDC8'
        },
        'monochrome': {
            name: 'Monochrome',
            primary: '#212121',
            secondary: '#616161',
            accent: '#BDBDBD',
            textDark: '#000000',
            textLight: '#424242',
            bgLight: '#FAFAFA',
            bgDark: '#000000',
            bgCard: '#FFFFFF',
            bgMuted: '#F5F5F5'
        }
    },
    getTheme(id) {
        return this.themes[id] || this.themes['elegant-gold'];
    }
};

const PageTemplates = {
    templates: {
        'cover-dark': { id: 'cover-dark', name: 'Cover Gelap', icon: '◼' },
        'cover-light': { id: 'cover-light', name: 'Cover Terang', icon: '◻' },
        'cover-split': { id: 'cover-split', name: 'Cover Split', icon: '◧' },
        'cover-numbered': { id: 'cover-numbered', name: 'Cover Nomor', icon: '№' },
        'cover-minimal': { id: 'cover-minimal', name: 'Cover Minimal', icon: '◇' }
    },

    getTemplate(id) { return this.templates[id] || this.templates['cover-dark']; },
    getAllTemplates() { return Object.values(this.templates); },

    createEmptyPage(templateId = 'cover-dark') {
        const p = {
            id: Date.now(),
            template: templateId,
            createdAt: new Date().toISOString(),
            order: 0,
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
        }
        return p;
    },

    getStyleProps(data) {
        const theme = data.colorTheme ? ColorThemes.getTheme(data.colorTheme) : null;
        return {
            fontFamily: data.fontFamily || 'Playfair Display',
            titleSize: data.titleSizePx ? data.titleSizePx + 'px' : '36px',
            subtitleSize: data.fontSizePx ? (Math.round(data.fontSizePx * 0.7)) + 'px' : '16px',
            bodySize: data.bodySizePx ? data.bodySizePx + 'px' : '14px',
            logoSize: data.logoSizePx ? data.logoSizePx + 'px' : '40px',
            textColor: theme ? theme.textDark : (data.textColor || '#1a1a1a'),
            bgColor: theme ? theme.bgLight : (data.bgColor || '#ffffff'),
            bgDark: theme ? theme.bgDark : '#1a1a1a',
            bgCard: theme ? theme.bgCard : '#ffffff',
            primary: theme ? theme.primary : '#5D4037',
            secondary: theme ? theme.secondary : '#8D6E63',
            accent: theme ? theme.accent : '#C9A66B',
            accentAlt: theme ? theme.accentAlt : '#008B8B',
            textMuted: theme ? theme.textMuted : '#A1887F',
            bgMuted: theme ? theme.bgMuted : '#F5F0E8'
        };
    },

    renderPage(pageData, pageNum) {
        const t = pageData.template || 'cover-dark';
        switch(t) {
            case 'cover-dark': return this.renderCoverDark(pageData, pageNum);
            case 'cover-light': return this.renderCoverLight(pageData, pageNum);
            case 'cover-split': return this.renderCoverSplit(pageData, pageNum);
            case 'cover-numbered': return this.renderCoverNumbered(pageData, pageNum);
            case 'cover-minimal': return this.renderCoverMinimal(pageData, pageNum);
            default: return this.renderCoverDark(pageData, pageNum);
        }
    },

    renderCoverDark(data, num) {
        const style = this.getStyleProps(data);
        const logoPos = data.logoPosition || 'top';
        const logoStyle = logoPos === 'center' ? 'text-align:center;margin-bottom:auto;' :
                          logoPos === 'bottom' ? 'text-align:center;margin-top:auto;order:2;' :
                          'text-align:center;margin-bottom:auto;';
        const logoHtml = data.logo
            ? `<img src="${data.logo}" style="height:${style.logoSize};margin-bottom:3%;">`
            : `<div style="width:60px;height:60px;border:2px dashed ${style.accent};border-radius:8px;display:flex;align-items:center;justify-content:center;margin:0 auto 3%;opacity:0.4;"><span style="color:${style.accent};font-size:1.5rem;">📷</span></div>`;
        return `
        <div style="width:100%;height:100%;background:linear-gradient(180deg,${style.bgDark} 0%,${style.primary} 100%);padding:8%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
            <div style="position:absolute;top:5%;left:5%;width:40px;height:40px;border-top:2px solid ${style.accent};border-left:2px solid ${style.accent};opacity:0.4;"></div>
            <div style="position:absolute;bottom:5%;right:5%;width:40px;height:40px;border-bottom:2px solid ${style.accent};border-right:2px solid ${style.accent};opacity:0.4;"></div>
            <div style="${logoStyle}">${logoHtml}</div>
            <div style="text-align:center;flex:1;display:flex;flex-direction:column;justify-content:center;">
                <h1 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:#fff;margin-bottom:2%;letter-spacing:0.05em;">${data.mainTitle || ''}</h1>
                <p style="color:${style.accent};font-size:${style.bodySize};letter-spacing:0.3em;margin-bottom:4%;">${data.subtitle || ''}</p>
                <div style="width:50px;height:2px;background:linear-gradient(90deg,transparent,${style.accent},transparent);margin:0 auto;"></div>
                ${data.description ? `<p style="color:rgba(255,255,255,0.5);font-size:${style.bodySize};margin-top:4%;line-height:1.6;">${data.description}</p>` : ''}
            </div>
        </div>`;
    },

    renderCoverLight(data, num) {
        const style = this.getStyleProps(data);
        const logoPos = data.logoPosition || 'top';
        const logoStyle = logoPos === 'center' ? 'text-align:center;margin:0 auto;' :
                          logoPos === 'bottom' ? 'text-align:center;order:2;' :
                          'text-align:center;';
        const logoHtml = data.logo
            ? `<img src="${data.logo}" style="height:${style.logoSize};margin-bottom:3%;">`
            : `<div style="width:60px;height:60px;border:2px dashed ${style.accentAlt};border-radius:8px;display:flex;align-items:center;justify-content:center;margin:0 auto 3%;opacity:0.4;"><span style="color:${style.accentAlt};font-size:1.5rem;">📷</span></div>`;
        return `
        <div style="width:100%;height:100%;background:${style.bgColor};padding:8%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
            <div style="position:absolute;top:5%;right:5%;width:30px;height:30px;border-top:2px solid ${style.accentAlt};border-right:2px solid ${style.accentAlt};opacity:0.3;"></div>
            <div style="${logoStyle}">${logoHtml}</div>
            <div style="text-align:center;flex:1;display:flex;flex-direction:column;justify-content:center;">
                <h1 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:${style.textColor};margin-bottom:2%;">${data.mainTitle || ''}</h1>
                <p style="color:${style.accentAlt};font-size:${style.bodySize};letter-spacing:0.3em;margin-bottom:4%;">${data.subtitle || ''}</p>
                <div style="width:50px;height:2px;background:${style.accent};margin:0 auto;"></div>
                ${data.description ? `<p style="color:${style.textMuted};font-size:${style.bodySize};margin-top:4%;line-height:1.6;">${data.description}</p>` : ''}
            </div>
        </div>`;
    },

    renderCoverSplit(data, num) {
        const style = this.getStyleProps(data);
        return `
        <div style="width:100%;height:100%;display:flex;">
            <div style="width:40%;height:100%;background:${style.bgDark};padding:6%;display:flex;flex-direction:column;">
                ${data.logo ? `<img src="${data.logo}" style="height:${style.logoSize};margin-bottom:15%;margin-top:auto;">` : ''}
                <div style="width:25px;height:1px;background:${style.accent};margin-bottom:10%;"></div>
                <p style="color:rgba(255,255,255,0.4);font-size:${style.bodySize};">${data.header || ''}</p>
            </div>
            <div style="width:60%;height:100%;background:${style.bgCard};padding:8%;display:flex;flex-direction:column;justify-content:center;">
                <h1 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:${style.textColor};margin-bottom:3%;">${data.mainTitle || ''}</h1>
                <p style="color:${style.accentAlt};font-size:${style.bodySize};letter-spacing:0.2em;margin-bottom:5%;">${data.subtitle || ''}</p>
                <div style="width:40px;height:2px;background:${style.textColor};margin-bottom:8%;"></div>
                <p style="color:${style.textMuted};font-size:${style.bodySize};line-height:1.8;">${data.description || ''}</p>
            </div>
        </div>`;
    },

    renderCoverNumbered(data, num) {
        const style = this.getStyleProps(data);
        return `
        <div style="width:100%;height:100%;background:${style.bgDark};padding:8%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
            ${data.logo ? `<img src="${data.logo}" style="height:${style.logoSize};margin-bottom:auto;opacity:0.9;">` : ''}
            <div style="display:flex;align-items:flex-start;gap:5%;flex:1;">
                <div style="width:30%;display:flex;flex-direction:column;justify-content:center;">
                    <h2 style="font-family:'${style.fontFamily}',serif;font-size:calc(${style.titleSize} + 20px);color:#fff;font-weight:700;line-height:1;margin-bottom:5%;">${data.header || ''}</h2>
                    <div style="width:40px;height:1px;background:${style.accent};margin-bottom:10%;"></div>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
                    <p style="color:${style.accent};font-size:${style.subtitleSize};letter-spacing:0.3em;margin-bottom:3%;">${data.mainTitle || ''}</p>
                    <h1 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:#fff;margin-bottom:5%;">${data.subtitle || ''}</h1>
                    <div style="width:30px;height:1px;background:${style.accent};margin-bottom:5%;"></div>
                    <p style="color:rgba(255,255,255,0.4);font-size:${style.bodySize};line-height:1.8;">${data.description || ''}</p>
                </div>
            </div>
        </div>`;
    },

    renderCoverMinimal(data, num) {
        const style = this.getStyleProps(data);
        return `
        <div style="width:100%;height:100%;background:${style.bgColor};padding:10%;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;">
            <div style="position:absolute;top:8%;right:8%;width:40px;height:40px;border-top:1px solid ${style.textMuted};border-right:1px solid ${style.textMuted};"></div>
            <div style="position:absolute;bottom:8%;left:8%;width:40px;height:40px;border-bottom:1px solid ${style.textMuted};border-left:1px solid ${style.textMuted};"></div>
            ${data.logo ? `<img src="${data.logo}" style="height:${style.logoSize};margin-bottom:3%;text-align:center;">` : ''}
            <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
                <p style="color:${style.textMuted};font-size:${style.subtitleSize};letter-spacing:0.3em;margin-bottom:5%;text-transform:uppercase;">${data.subtitle || ''}</p>
                <h1 style="font-family:'${style.fontFamily}',serif;font-size:${style.titleSize};color:${style.textColor};margin-bottom:8%;font-weight:300;">${data.mainTitle || ''}</h1>
                <div style="width:50px;height:1px;background:${style.accentAlt};margin-bottom:8%;"></div>
                <p style="color:${style.textMuted};font-size:${style.bodySize};line-height:1.8;font-style:italic;">${data.body || ''}</p>
            </div>
        </div>`;
    }
};

window.PageTemplates = PageTemplates;
