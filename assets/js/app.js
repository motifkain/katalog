/**
 * MOTIFKAIN KATALOG - MAIN APP
 * Tiruan tampilan iswaraapp
 */

// ===== CONFIG =====
const CONFIG = window.MOTIFKAIN_CONFIG || {
    pocketbaseUrl: 'https://katalog-production-104e.up.railway.app',
    welcomeCollection: 'welcome_settings',
    produkCollection: 'produk',
    kategoriCollection: 'kategori',
    userCollection: 'users'
};

// ===== STATE =====
let welcomeSettings = window.WELCOME_SETTINGS || {
    logoUrl: 'assets/images/logo-motifkain.png',
    leftText: 'Deskripsi singkat tentang\nkoleksi atau perusahaan Anda.',
    title: 'CATALOG',
    subtitle: 'Company Profile',
    description: 'Koleksi produk eksklusif kami',
    colorTheme: 'elegant-cream',
    backgroundOpacity: 50,
    leftPanelOpacity: 50
};

let products = [];
let filteredProducts = [];
let categories = [];
let users = [];
let productCarousels = {};
let currentImageIndex = 0;
let currentCategory = 'desain-motif';
let currentSubcategory = null;

let selectedProduct = null;
let allWelcomeScreens = []; // Store all welcome screens
let activeWelcomeScreenId = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadWelcomeSettings();
    await loadCategories();
    await loadProducts();
    await loadUsers();
    setupSearch();
    renderWelcomeScreen();
});

// ===== LOAD USERS =====
async function loadUsers() {
    try {
        const res = await fetch(`${CONFIG.pocketbaseUrl}/api/collections/${CONFIG.userCollection}/records?sort=+role`);
        if (res.ok) {
            const data = await res.json();
            users = data.items || [];
        }
    } catch (e) {
        users = [];
    }
}

// ===== WELCOME SCREEN =====
async function loadWelcomeSettings() {
    const savedActiveId = localStorage.getItem('motifkain_active_ws');

    try {
        // First, load all welcome screens
        const listRes = await fetch(`${CONFIG.pocketbaseUrl}/api/collections/${CONFIG.welcomeCollection}/records?per-page=500&sort=-created`);
        if (listRes.ok) {
            const listData = await listRes.json();
            allWelcomeScreens = listData.items || [];
        }

        // Find the active welcome screen
        let activeWs = null;

        if (savedActiveId) {
            // Use the saved active ID
            activeWs = allWelcomeScreens.find(ws => ws.id === savedActiveId);
        }

        if (!activeWs && allWelcomeScreens.length > 0) {
            // Use the most recent one
            activeWs = allWelcomeScreens[0];
            activeWelcomeScreenId = activeWs.id;
            localStorage.setItem('motifkain_active_ws', activeWelcomeScreenId);
        }

        if (activeWs) {
            activeWelcomeScreenId = activeWs.id;
            welcomeSettings = {
                id: activeWs.id,
                template: activeWs.template || 'cover-split',
                colorTheme: activeWs.colorTheme || 'elegant-cream',
                fontFamily: activeWs.fontFamily || 'Playfair Display',
                logoUrl: activeWs.logo ? `${CONFIG.pocketbaseUrl}/api/files/${CONFIG.welcomeCollection}/${activeWs.id}/${activeWs.logo}` : '',
                backgroundImage: activeWs.backgroundImage ? `${CONFIG.pocketbaseUrl}/api/files/${CONFIG.welcomeCollection}/${activeWs.id}/${activeWs.backgroundImage}` : '',
                backgroundOpacity: activeWs.backgroundOpacity || 50,
                logoSize: activeWs.logoSize || 60,
                logoX: activeWs.logoX || 50,
                logoY: activeWs.logoY || 10,
                titleSize: activeWs.titleSize || 32,
                titleX: activeWs.titleX || 50,
                titleY: activeWs.titleY || 50,
                subtitleSize: activeWs.subtitleSize || 14,
                subtitleX: activeWs.subtitleX || 50,
                subtitleY: activeWs.subtitleY || 70,
                descriptionSize: activeWs.descriptionSize || 14,
                descriptionX: activeWs.descriptionX || 50,
                descriptionY: activeWs.descriptionY || 75,
                leftText: activeWs.leftText || activeWs.left_text || 'Deskripsi singkat tentang\nkoleksi atau perusahaan Anda.',
                title: activeWs.title || 'CATALOG',
                subtitle: activeWs.subtitle || 'Company Profile',
                description: activeWs.description || 'Koleksi produk eksklusif kami',
                // Button styles from PocketBase
                btnX: activeWs.btnX ?? 50,
                btnY: activeWs.btnY ?? 90,
                btnBgColor: activeWs.btnBgColor || '#1B5E20',
                btnTextColor: activeWs.btnTextColor || '#FFFFFF',
                btnFontSize: activeWs.btnFontSize ?? 14
            };
            updateFavicon(welcomeSettings.logoUrl);
        }
    } catch (e) {
        console.log('Welcome settings from config file');
    }
}

function updateFavicon(logoUrl) {
    if (!logoUrl) return;
    const favicon = document.getElementById('faviconLink');
    if (favicon) {
        favicon.href = logoUrl;
    }
}

function getThemeColors(themeId) {
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

function renderWelcomeScreen() {
    const ws = welcomeSettings;
    const theme = getThemeColors(ws.colorTheme || 'elegant-gold');
    const template = ws.template || 'cover-dark';

    // Render based on template
    const welcomeScreen = document.getElementById('welcomeScreen');

    let html = '';
    switch(template) {
        case 'cover-dark':
            html = renderWelcomeDark(ws, theme);
            break;
        case 'cover-light':
            html = renderWelcomeLight(ws, theme);
            break;
        case 'cover-split':
            html = renderWelcomeSplit(ws, theme);
            break;
        case 'cover-numbered':
            html = renderWelcomeNumbered(ws, theme);
            break;
        case 'cover-minimal':
            html = renderWelcomeMinimal(ws, theme);
            break;
        default:
            html = renderWelcomeDark(ws, theme);
    }

    // Add settings button to open welcome screen selector
    html += `
        <button class="ws-selector-btn" onclick="openWelcomeSelector()" title="Pilih Welcome Screen">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
        </button>
    `;

    welcomeScreen.innerHTML = html;
}

function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    // Parse hex
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return r + ',' + g + ',' + b;
}

function getLogoStyleWelcome(ws) {
    const size = ws.logoSize ?? 60;
    const x = ws.logoX ?? 50;
    const y = ws.logoY ?? 10;
    return `height:${size}px;max-width:150px;object-fit:contain;position:absolute;left:${x}%;top:${y}%;transform:translate(-50%, 0);`;
}

function getTitleStyleWelcome(ws) {
    const x = ws.titleX ?? 50;
    const y = ws.titleY ?? 50;
    const size = ws.titleSize ?? 32;
    return `position:absolute;left:${x}%;top:${y}%;transform:translate(-50%, -50%);text-align:center;width:90%;font-size:${size}px;color:#fff;`;
}

function getSubtitleStyleWelcome(ws) {
    const x = ws.subtitleX ?? 50;
    const y = ws.subtitleY ?? 70;
    const size = ws.subtitleSize ?? 14;
    return `position:absolute;left:${x}%;top:${y}%;transform:translate(-50%, -50%);text-align:center;width:90%;font-size:${size}px;`;
}

function getDescriptionStyleWelcome(ws) {
    const x = ws.descriptionX ?? 50;
    const y = ws.descriptionY ?? 75;
    const size = ws.descriptionSize ?? 14;
    return `position:absolute;left:${x}%;top:${y}%;transform:translate(-50%, -50%);text-align:center;width:90%;font-size:${size}px;line-height:1.6;`;
}

function getTaglineStyleWelcome(ws) {
    const size = ws.taglineSize || 14;
    return `font-size:${size}px;line-height:1.6;`;
}

function getBtnStyleWelcome(ws) {
    const x = ws.btnX ?? 50;
    const y = ws.btnY ?? 90;
    const bgColor = ws.btnBgColor || '#1B5E20';
    const textColor = ws.btnTextColor || '#FFFFFF';
    const fontSize = ws.btnFontSize || 14;
    return `position:absolute;left:${x}%;top:${y}%;transform:translate(-50%, -50%);background:${bgColor};color:${textColor};padding:12px 32px;border:none;border-radius:6px;font-size:${fontSize}px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);`;
}

function renderWelcomeDark(ws, theme) {
    const bgImg = ws.backgroundImage || ws.backgroundImageUrl;
    const bgStyle = bgImg
        ? `background: linear-gradient(rgba(0,0,0,${1 - (ws.backgroundOpacity || 50)/100}), rgba(0,0,0,${1 - (ws.backgroundOpacity || 50)/100})), url('${bgImg}') center/cover no-repeat;`
        : `background:linear-gradient(180deg,${theme.bgDark} 0%,${theme.primary} 100%);`;

    const logoStyle = getLogoStyleWelcome(ws);
    const titleStyle = getTitleStyleWelcome(ws);
    const descStyle = getDescriptionStyleWelcome(ws);
    const taglineStyle = getTaglineStyleWelcome(ws);
    const btnStyle = getBtnStyleWelcome(ws);

    const logoHtml = ws.logoUrl
        ? `<img src="${ws.logoUrl}" style="${logoStyle}">`
        : `<div style="width:60px;height:60px;border:2px dashed ${theme.accent};border-radius:8px;display:flex;align-items:center;justify-content:center;opacity:0.5;${logoStyle}"><span style="font-size:1.5rem;">📷</span></div>`;

    return `
    <div style="width:100%;height:100%;${bgStyle}padding:8%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
        <div style="position:absolute;top:5%;left:5%;width:40px;height:40px;border-top:2px solid ${theme.accent};border-left:2px solid ${theme.accent};opacity:0.4;"></div>
        <div style="position:absolute;bottom:5%;right:5%;width:40px;height:40px;border-bottom:2px solid ${theme.accent};border-right:2px solid ${theme.accent};opacity:0.4;"></div>
        ${logoHtml}
        <div style="${titleStyle}">
            <h1 style="font-family:'${ws.fontFamily}',serif;font-size:${ws.titleSize || 32}px;margin-bottom:10px;letter-spacing:0.05em;">${ws.title}</h1>
            <p style="color:${theme.accent};font-size:${ws.subtitleSize || 14}px;letter-spacing:0.3em;margin-bottom:15px;">${ws.subtitle}</p>
            <div style="width:50px;height:2px;background:linear-gradient(90deg,transparent,${theme.accent},transparent);margin:0 auto;"></div>
        </div>
        ${ws.description ? `<div style="${descStyle}color:rgba(255,255,255,0.7);">${ws.description}</div>` : ''}
        ${ws.leftText ? `<div style="position:absolute;left:50%;bottom:15%;transform:translateX(-50%);text-align:center;width:80%;${taglineStyle}color:${theme.textMuted};">${ws.leftText.replace(/\n/g, '<br>')}</div>` : ''}
        <button class="welcome-btn" onclick="openKatalog()" style="${btnStyle}">Lihat Katalog</button>
    </div>`;
}

function renderWelcomeLight(ws, theme) {
    const bgImg = ws.backgroundImage || ws.backgroundImageUrl;
    const bgStyle = bgImg
        ? `background: linear-gradient(rgba(255,255,255,${(ws.backgroundOpacity || 50)/100}), rgba(255,255,255,${(ws.backgroundOpacity || 50)/100})), url('${bgImg}') center/cover no-repeat;`
        : `background:${theme.bgLight};`;

    const logoStyle = getLogoStyleWelcome(ws);
    const titleStyle = getTitleStyleWelcome(ws);
    const descStyle = getDescriptionStyleWelcome(ws);
    const taglineStyle = getTaglineStyleWelcome(ws);
    const btnStyle = getBtnStyleWelcome(ws);

    const logoHtml = ws.logoUrl
        ? `<img src="${ws.logoUrl}" style="${logoStyle}">`
        : `<div style="width:60px;height:60px;border:2px dashed ${theme.accentAlt};border-radius:8px;display:flex;align-items:center;justify-content:center;opacity:0.5;${logoStyle}"><span style="font-size:1.5rem;">📷</span></div>`;

    return `
    <div style="width:100%;height:100%;${bgStyle}padding:8%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
        <div style="position:absolute;top:5%;right:5%;width:30px;height:30px;border-top:2px solid ${theme.accentAlt};border-right:2px solid ${theme.accentAlt};opacity:0.3;"></div>
        ${logoHtml}
        <div style="${titleStyle}">
            <h1 style="font-family:'${ws.fontFamily}',serif;font-size:${ws.titleSize || 32}px;margin-bottom:10px;">${ws.title}</h1>
            <p style="color:${theme.accentAlt};font-size:${ws.subtitleSize || 14}px;letter-spacing:0.3em;margin-bottom:15px;">${ws.subtitle}</p>
            <div style="width:50px;height:2px;background:${theme.accent};margin:0 auto;"></div>
        </div>
        ${ws.description ? `<div style="${descStyle}color:${theme.textMuted};">${ws.description}</div>` : ''}
        ${ws.leftText ? `<div style="position:absolute;left:50%;bottom:15%;transform:translateX(-50%);text-align:center;width:80%;${taglineStyle}color:${theme.textMuted};">${ws.leftText.replace(/\n/g, '<br>')}</div>` : ''}
        <button class="welcome-btn" onclick="openKatalog()" style="${btnStyle}">Lihat Katalog</button>
    </div>`;
}

function renderWelcomeSplit(ws, theme) {
    const logoStyle = getLogoStyleWelcome(ws);
    const titleStyle = getTitleStyleWelcome(ws);
    const descStyle = getDescriptionStyleWelcome(ws);
    const taglineStyle = getTaglineStyleWelcome(ws);
    const btnStyle = getBtnStyleWelcome(ws);

    const bgImg = ws.backgroundImage || ws.backgroundImageUrl;
    const rightBgStyle = bgImg
        ? `background: linear-gradient(rgba(255,255,255,${(100 - (ws.backgroundOpacity || 50))/100}), rgba(255,255,255,${(100 - (ws.backgroundOpacity || 50))/100})), url('${bgImg}') center/cover;`
        : `background:${theme.bgCard || '#FFFAF0'};`;

    return `
    <div style="width:100%;height:100%;display:flex;position:relative;">
        <div style="width:40%;height:100%;background:${theme.bgDark};padding:6%;display:flex;flex-direction:column;justify-content:center;position:relative;">
            ${ws.logoUrl ? `<img src="${ws.logoUrl}" style="${logoStyle}">` : ''}
            ${ws.leftText ? `<div style="width:25px;height:1px;background:${theme.accent};margin:20px 0;"></div><div style="${taglineStyle}color:rgba(255,255,255,0.6);">${ws.leftText.replace(/\n/g, '<br>')}</div>` : ''}
        </div>
        <div style="width:60%;height:100%;${rightBgStyle};padding:8%;display:flex;flex-direction:column;justify-content:center;position:relative;">
            <div style="${titleStyle}">
                <h1 style="font-family:'${ws.fontFamily}',serif;font-size:${ws.titleSize || 32}px;margin-bottom:15px;">${ws.title}</h1>
                <p style="color:${theme.accentAlt};font-size:${ws.subtitleSize || 14}px;letter-spacing:0.2em;margin-bottom:15px;">${ws.subtitle}</p>
                <div style="width:40px;height:2px;background:${theme.textDark};margin-bottom:20px;"></div>
            </div>
            ${ws.description ? `<div style="position:absolute;left:65%;top:60%;transform:translate(-50%, -50%);width:50%;font-size:${ws.descriptionSize || 14}px;color:${theme.textMuted};line-height:1.6;">${ws.description}</div>` : ''}
            <button class="welcome-btn" onclick="openKatalog()" style="${btnStyle}">Lihat Katalog</button>
        </div>
    </div>`;
}

function renderWelcomeNumbered(ws, theme) {
    const bgImg = ws.backgroundImage || ws.backgroundImageUrl;
    const bgStyle = bgImg
        ? `background: linear-gradient(rgba(0,0,0,${1 - (ws.backgroundOpacity || 50)/100}), rgba(0,0,0,${1 - (ws.backgroundOpacity || 50)/100})), url('${bgImg}') center/cover no-repeat;`
        : `background:${theme.bgDark};`;

    const logoStyle = getLogoStyleWelcome(ws);
    const titleStyle = getTitleStyleWelcome(ws);
    const descStyle = getDescriptionStyleWelcome(ws);
    const taglineStyle = getTaglineStyleWelcome(ws);
    const btnStyle = getBtnStyleWelcome(ws);

    const logoHtml = ws.logoUrl
        ? `<img src="${ws.logoUrl}" style="${logoStyle}">`
        : `<div style="width:60px;height:60px;border:2px dashed ${theme.accent};border-radius:8px;display:flex;align-items:center;justify-content:center;opacity:0.5;${logoStyle}"><span style="font-size:1.5rem;">📷</span></div>`;

    return `
    <div style="width:100%;height:100%;${bgStyle}padding:8%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
        <div style="position:absolute;top:5%;left:5%;width:40px;height:40px;border-top:2px solid ${theme.accent};border-left:2px solid ${theme.accent};opacity:0.4;"></div>
        <div style="position:absolute;bottom:5%;right:5%;width:40px;height:40px;border-bottom:2px solid ${theme.accent};border-right:2px solid ${theme.accent};opacity:0.4;"></div>
        ${logoHtml}
        <div style="${titleStyle}">
            <h1 style="font-family:'${ws.fontFamily}',serif;font-size:${ws.titleSize || 32}px;margin-bottom:15px;letter-spacing:0.05em;">${ws.title}</h1>
            <p style="color:${theme.accent};font-size:${ws.subtitleSize || 14}px;letter-spacing:0.3em;margin-bottom:15px;">${ws.subtitle}</p>
            <div style="width:50px;height:2px;background:linear-gradient(90deg,transparent,${theme.accent},transparent);margin:0 auto;"></div>
        </div>
        ${ws.description ? `<div style="${descStyle}color:rgba(255,255,255,0.7);">${ws.description}</div>` : ''}
        ${ws.leftText ? `<div style="position:absolute;left:50%;bottom:15%;transform:translateX(-50%);text-align:center;width:80%;${taglineStyle}color:${theme.textMuted};">${ws.leftText.replace(/\n/g, '<br>')}</div>` : ''}
        <button class="welcome-btn" onclick="openKatalog()" style="${btnStyle}">Lihat Katalog</button>
    </div>`;
}

function renderWelcomeMinimal(ws, theme) {
    const bgImg = ws.backgroundImage || ws.backgroundImageUrl;
    const bgStyle = bgImg
        ? `background: linear-gradient(rgba(255,255,255,${(ws.backgroundOpacity || 50)/100}), rgba(255,255,255,${(ws.backgroundOpacity || 50)/100})), url('${bgImg}') center/cover no-repeat;`
        : `background:${theme.bgLight};`;

    const logoStyle = getLogoStyleWelcome(ws);
    const titleStyle = getTitleStyleWelcome(ws);
    const descStyle = getDescriptionStyleWelcome(ws);
    const taglineStyle = getTaglineStyleWelcome(ws);
    const btnStyle = getBtnStyleWelcome(ws);

    const logoHtml = ws.logoUrl
        ? `<img src="${ws.logoUrl}" style="${logoStyle}">`
        : `<div style="width:60px;height:60px;border:2px dashed ${theme.accentAlt};border-radius:8px;display:flex;align-items:center;justify-content:center;opacity:0.5;${logoStyle}"><span style="font-size:1.5rem;">📷</span></div>`;

    return `
    <div style="width:100%;height:100%;${bgStyle}padding:10%;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;">
        <div style="position:absolute;top:8%;right:8%;width:40px;height:40px;border-top:1px solid ${theme.textMuted};border-right:1px solid ${theme.textMuted};"></div>
        <div style="position:absolute;bottom:8%;left:8%;width:40px;height:40px;border-bottom:1px solid ${theme.textMuted};border-left:1px solid ${theme.textMuted};"></div>
        ${logoHtml}
        <div style="${titleStyle}">
            <p style="color:${theme.textMuted};font-size:${ws.subtitleSize || 14}px;letter-spacing:0.3em;margin-bottom:15px;text-transform:uppercase;">${ws.subtitle}</p>
            <h1 style="font-family:'${ws.fontFamily}',serif;font-weight:300;font-size:${ws.titleSize || 32}px;margin-bottom:30px;">${ws.title}</h1>
            <div style="width:50px;height:1px;background:${theme.accentAlt};margin-bottom:20px;"></div>
        </div>
        ${ws.description ? `<div style="${descStyle}color:${theme.textMuted};font-style:italic;">${ws.description}</div>` : ''}
        ${ws.leftText ? `<div style="position:absolute;left:50%;bottom:15%;transform:translateX(-50%);text-align:center;width:80%;${taglineStyle}color:${theme.textMuted};">${ws.leftText.replace(/\n/g, '<br>')}</div>` : ''}
        <button class="welcome-btn" onclick="openKatalog()" style="${btnStyle}">Lihat Katalog</button>
    </div>`;
}

// ===== NAVIGATION =====
function openKatalog() {
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.add('active');
    document.getElementById('backToWelcomeBtn').style.display = 'flex';
    document.getElementById('backBtnContainer').style.display = 'block';
}

function backToWelcome() {
    document.getElementById('appScreen').classList.remove('active');
    document.getElementById('welcomeScreen').classList.remove('hidden');
    document.getElementById('backToWelcomeBtn').style.display = 'none';
    document.getElementById('backBtnContainer').style.display = 'none';
}

// ===== CATEGORIES & SUBCATEGORIES =====
async function loadCategories() {
    try {
        const res = await fetch(`${CONFIG.pocketbaseUrl}/api/collections/${CONFIG.kategoriCollection || 'kategori'}/records?sort=order`);
        if (res.ok) {
            const data = await res.json();
            categories = data.items || [];
        }
    } catch (e) {
        console.log('Categories collection not found');
    }

    // Default categories if none loaded
    if (!categories || categories.length === 0) {
        categories = [
            { id: 'desain-motif', name: 'Desain Motif', slug: 'desain-motif' },
            { id: 'printing', name: 'Printing Kain', slug: 'printing' },
            { id: 'pakaian', name: 'Pakaian Jadi', slug: 'pakaian' },
            { id: 'asesoris', name: 'Asesoris', slug: 'asesoris' }
        ];
    }

    // Render category tabs
    renderCategoryTabs();
}

function renderCategoryTabs() {
    const tabs = document.getElementById('categoryTabs');
    if (!tabs) return;

    tabs.innerHTML = categories.map(cat => `
        <button class="category-tab ${currentCategory === cat.slug ? 'active' : ''}"
                data-category="${cat.slug}"
                onclick="selectCategory('${cat.slug}')">
            ${cat.name}
        </button>
    `).join('');
}

function selectCategory(slug) {
    currentCategory = slug;
    currentSubcategory = null;
    renderCategoryTabs();
    renderSubcategories();
    filterProducts();
}

function renderSubcategories() {
    const bar = document.getElementById('subcategoryBar');
    if (!bar) return;

    const subs = getSubcategories(currentCategory);

    if (subs.length === 0) {
        bar.style.display = 'none';
        return;
    }

    bar.style.display = 'flex';
    bar.innerHTML = subs.map(sub => `
        <button class="subcategory-btn ${currentSubcategory === sub.id ? 'active' : ''}"
                onclick="selectSubcategory('${sub.id}')">
            ${sub.name}
        </button>
    `).join('');
}

async function loadProducts() {
    try {
        const res = await fetch(`${CONFIG.pocketbaseUrl}/api/collections/${CONFIG.produkCollection || 'produk'}/records?per-page=200&sort=-created`);
        if (res.ok) {
            const data = await res.json();
            products = (data.items || []).map(item => ({
                ...item,
                image: item.image ? `${CONFIG.pocketbaseUrl}/api/files/${CONFIG.produkCollection || 'produk'}/${item.id}/${item.image}` : '',
                images: (item.images || []).map(img => `${CONFIG.pocketbaseUrl}/api/files/${CONFIG.produkCollection || 'produk'}/${item.id}/${img}`)
            }));
        }
    } catch (e) {
        console.error("Error loading products:", e);
        products = [];
    }

    // If no products, use sample
    if (products.length === 0) {
        products = getSampleProducts();
    }

    filterProducts();
}

function getSampleProducts() {
    return [
        { id: "1", nama: "Motif Bunga Melati", harga: 150000, kategori: "desain-motif", subkategori: "batik", deskripsi: "Desain motif bunga melati klasik Indonesia", image: "https://picsum.photos/400/400?random=1", images: [], namatoko: "MotifKain", daerah: "Jakarta" },
        { id: "2", nama: "Motif Parang Classic", harga: 175000, kategori: "desain-motif", subkategori: "batik", deskripsi: "Motif parang klasik Yogyakarta", image: "https://picsum.photos/400/400?random=2", images: [], namatoko: "MotifKain", daerah: "Solo" },
        { id: "3", nama: "Kain Printing Premium", harga: 200000, kategori: "printing", subkategori: "sutra", deskripsi: "Kain printing kualitas premium", image: "https://picsum.photos/400/400?random=3", images: [], namatoko: "MotifKain", daerah: "Bandung" },
        { id: "4", nama: "Blouse Batik Elegant", harga: 350000, kategori: "pakaian", subkategori: "atasan", deskripsi: "Blouse batik dengan motif eksklusif", image: "https://picsum.photos/400/400?random=4", images: [], namatoko: "MotifKain", daerah: "Yogyakarta" },
        { id: "5", nama: "Gelang Batik Artisan", harga: 75000, kategori: "asesoris", subkategori: "gelang", deskripsi: "Gelang aksesoris dari kain batik", image: "https://picsum.photos/400/400?random=5", images: [], namatoko: "MotifKain", daerah: "Surabaya" },
        { id: "6", nama: "Motif Kawung Geometris", harga: 160000, kategori: "desain-motif", subkategori: "modern", deskripsi: "Desain motif kawung geometric modern", image: "https://picsum.photos/400/400?random=6", images: [], namatoko: "MotifKain", daerah: "Jakarta" },
        { id: "7", nama: "Kain Batik Tulis", harga: 450000, kategori: "printing", subkategori: "katun", deskripsi: "Kain batik tulis handmade", image: "https://picsum.photos/400/400?random=7", images: [], namatoko: "MotifKain", daerah: "Solo" },
        { id: "8", nama: "Rok Batik Femine", harga: 285000, kategori: "pakaian", subkategori: "bawahan", deskripsi: "Rok batik elegant untuk acara formal", image: "https://picsum.photos/400/400?random=8", images: [], namatoko: "MotifKain", daerah: "Yogyakarta" },
    ];
}

function getSubcategories(category) {
    // Get unique subcategories from products
    const subMap = {};
    products.forEach(p => {
        if (p.kategori === category && p.subkategori) {
            subMap[p.subkategori] = { id: p.subkategori, name: capitalize(p.subkategori) };
        }
    });
    return Object.values(subMap);
}

function selectSubcategory(id) {
    currentSubcategory = currentSubcategory === id ? null : id;
    renderSubcategories();
    filterProducts();
    updateActiveFilters();
}

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// ===== FILTERING =====
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
}

function toggleFilters() {
    const section = document.getElementById('filterSection');
    section.classList.toggle('active');

    if (section.classList.contains('active')) {
        renderFilterChips();
    }
}

function renderFilterChips() {
    const container = document.getElementById('filterChips');
    if (!container) return;

    const subs = getSubcategories(currentCategory);
    container.innerHTML = subs.map(sub => `
        <button class="filter-chip ${currentSubcategory === sub.id ? 'active' : ''}"
                onclick="selectSubcategory('${sub.id}')">
            ${sub.name}
        </button>
    `).join('');
}

function updateActiveFilters() {
    const container = document.getElementById('activeFilters');
    const tagsContainer = document.getElementById('activeFilterTags');

    if (!container || !tagsContainer) return;

    if (currentSubcategory) {
        container.style.display = 'flex';
        tagsContainer.innerHTML = `
            <span class="active-filter-tag">
                ${capitalize(currentSubcategory)}
                <button onclick="selectSubcategory('${currentSubcategory}')">&times;</button>
            </span>
        `;
    } else {
        container.style.display = 'none';
    }
}

function resetFilters() {
    currentSubcategory = null;
    document.getElementById('searchInput').value = '';
    renderSubcategories();
    filterProducts();
    updateActiveFilters();
}

function filterProducts() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    filteredProducts = products.filter(p => {
        // Category filter
        if (p.kategori !== currentCategory) return false;

        // Subcategory filter
        if (currentSubcategory && p.subkategori !== currentSubcategory) return false;

        // Search filter
        if (searchQuery) {
            const matchName = (p.nama || '').toLowerCase().includes(searchQuery);
            const matchStore = (p.namatoko || '').toLowerCase().includes(searchQuery);
            const matchDesc = (p.deskripsi || '').toLowerCase().includes(searchQuery);
            if (!matchName && !matchStore && !matchDesc) return false;
        }

        return true;
    });

    renderProductsGrid();
}

// ===== PRODUCTS GRID =====
function renderProductsGrid() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: span 2;">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
                </svg>
                <h3>Produk Tidak Ditemukan</h3>
                <p>Coba ubah filter atau kata kunci pencarian</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredProducts.map(product => {
        const images = getProductImages(product);
        const mainImage = images[0] || product.image || 'https://via.placeholder.com/400x400?text=No+Image';
        const harga = product.harga ? formatRupiah(product.harga) : 'Hubungi Kami';

        return `
            <div class="product-card" onclick="openDetail('${product.id}')">
                <div class="product-image">
                    ${images.length > 1
                        ? renderMiniCarousel(product.id, images)
                        : `<img src="${mainImage}" alt="${product.nama}">`
                    }
                    ${images.length > 1 ? `<span class="carousel-badge">${images.length} foto</span>` : ''}
                    <div class="wa-badge">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.nama || ''}</h3>
                    <p class="product-price">${harga}</p>
                    <div class="product-store">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.36 9l.6 3H5.04l.6-3h12.72M20 4H4v2h16V4zm0 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zM6 18v-4h6v4H6z"/>
                        </svg>
                        <span>${product.namatoko || 'MotifKain'}</span>
                    </div>
                    <div class="product-location">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <span>${product.daerah || '-'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Setup mini carousels
    setupMiniCarousels();
}

function renderMiniCarousel(id, images) {
    return `
        <div class="product-carousel" id="carousel-${id}">
            ${images.map((img, i) => `<img src="${img}" alt="" class="${i === 0 ? 'active' : ''}" data-index="${i}">`).join('')}
            <div class="carousel-dots">
                ${images.map((_, i) => `<div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}
            </div>
        </div>
    `;
}

function setupMiniCarousels() {
    filteredProducts.forEach(product => {
        const images = getProductImages(product);
        if (images.length <= 1) return;

        const carousel = document.getElementById(`carousel-${product.id}`);
        if (!carousel) return;

        if (!productCarousels[product.id]) {
            productCarousels[product.id] = { current: 0, images: images };
        }

        setInterval(() => {
            const state = productCarousels[product.id];
            if (!state) return;

            const imgs = carousel.querySelectorAll('img');
            const dots = carousel.querySelectorAll('.carousel-dot');

            imgs[state.current].classList.remove('active');
            dots[state.current].classList.remove('active');

            state.current = (state.current + 1) % state.images.length;

            imgs[state.current].classList.add('active');
            dots[state.current].classList.add('active');
        }, 3000);
    });
}

function getProductImages(product) {
    const images = [];
    if (product.image) images.push(product.image);
    if (product.images && Array.isArray(product.images)) images.push(...product.images.filter(Boolean));
    return images;
}

function formatRupiah(num) {
    return 'Rp ' + num.toLocaleString('id-ID');
}

// ===== PRODUCT DETAIL =====
// removed duplicate - already declared at line 27
let productImages = [];
let zoomLevel = 1;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;

function openDetail(productId) {
    selectedProduct = filteredProducts.find(p => p.id === productId) || products.find(p => p.id === productId);
    if (!selectedProduct) return;

    const images = getProductImages(selectedProduct);
    currentImageIndex = 0;
    productImages = images;

    // Gallery
    document.getElementById('detailImage').src = images[0] || 'https://via.placeholder.com/400x400?text=No+Image';

    // Badge
    const badge = document.getElementById('galleryBadge');
    if (images.length > 1) {
        badge.style.display = 'block';
        badge.textContent = `1/${images.length}`;
    } else {
        badge.style.display = 'none';
    }

    // Render dots
    renderGalleryDots(images.length);

    // Thumbnails
    renderThumbnails(images);

    // Show gallery navigation if multiple images
    const nav = document.getElementById('galleryNav');
    if (nav) {
        nav.style.display = images.length > 1 ? 'flex' : 'none';
    }

    // Info
    document.getElementById('detailName').textContent = selectedProduct.nama || '';
    document.getElementById('detailPrice').textContent = selectedProduct.harga ? formatRupiah(selectedProduct.harga) : 'Hubungi Kami';
    document.getElementById('detailBadge').textContent = capitalize(selectedProduct.subkategori || selectedProduct.kategori || '');
    document.getElementById('detailDescription').textContent = selectedProduct.deskripsi || 'Tidak ada deskripsi';

    // Store
    const storeName = selectedProduct.namatoko || 'MotifKain';
    document.getElementById('storeAvatar').textContent = storeName.charAt(0).toUpperCase();
    document.getElementById('storeName').textContent = storeName;
    document.getElementById('storeLocation').innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span>${selectedProduct.daerah || '-'}</span>
    `;

    // Show modal
    document.getElementById('detailModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function prevImage() {
    if (productImages.length <= 1) return;
    currentImageIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
    updateGalleryImage();
}

function nextImage() {
    if (productImages.length <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % productImages.length;
    updateGalleryImage();
}

function updateGalleryImage() {
    document.getElementById('detailImage').src = productImages[currentImageIndex] || '';

    // Update badge
    const badge = document.getElementById('galleryBadge');
    if (badge) badge.textContent = `${currentImageIndex + 1}/${productImages.length}`;

    // Update dots
    document.querySelectorAll('.gallery-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentImageIndex);
    });

    // Reset zoom when changing images
    resetZoom();
}

function renderGalleryDots(count) {
    const container = document.getElementById('galleryDots');
    if (!container) return;

    container.innerHTML = Array.from({length: count}, (_, i) =>
        `<div class="gallery-dot ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="selectGalleryImage(${i})"></div>`
    ).join('');
}

function renderThumbnails(images) {
    const container = document.getElementById('thumbnailGallery');
    if (!container) return;

    if (images.length <= 1) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    container.innerHTML = images.map((img, i) =>
        `<div class="thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="selectGalleryImage(${i})">
            <img src="${img}" alt="Thumbnail ${i + 1}">
        </div>`
    ).join('');
}

function selectGalleryImage(index) {
    if (!selectedProduct) return;

    currentImageIndex = index;
    document.getElementById('detailImage').src = productImages[index] || '';
    document.getElementById('galleryBadge').textContent = `${index + 1}/${productImages.length}`;

    // Update dots
    document.querySelectorAll('.gallery-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    // Update thumbnails
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });

    // Reset zoom
    resetZoom();
}

function closeDetail() {
    document.getElementById('detailModal').classList.remove('active');
    document.body.style.overflow = '';
    resetZoom();
}

// ===== IMAGE ZOOM =====
function openImageZoom(src) {
    if (!src || src.includes('placeholder')) return;

    const zoomModal = document.getElementById('zoomModal');
    const zoomImage = document.getElementById('zoomImage');
    const zoomCounter = document.getElementById('zoomCounter');

    zoomImage.src = src;
    zoomImage.style.transform = 'scale(1)';
    zoomImage.style.cursor = 'grab';

    if (zoomCounter) zoomCounter.textContent = `${currentImageIndex + 1} / ${productImages.length}`;

    zoomModal.classList.add('active');
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;

    // Add event listeners
    setupZoomControls(zoomImage);
}

function closeImageZoom(event) {
    if (event && event.target !== event.currentTarget && !event.target.classList.contains('zoom-close')) {
        return;
    }

    const zoomModal = document.getElementById('zoomModal');
    zoomModal.classList.remove('active');
    resetZoom();
}

function zoomPrevImage() {
    prevImage();
    const src = productImages[currentImageIndex];
    document.getElementById('zoomImage').src = src;
    document.getElementById('zoomCounter').textContent = `${currentImageIndex + 1} / ${productImages.length}`;
    resetZoom();
}

function zoomNextImage() {
    nextImage();
    const src = productImages[currentImageIndex];
    document.getElementById('zoomImage').src = src;
    document.getElementById('zoomCounter').textContent = `${currentImageIndex + 1} / ${productImages.length}`;
    resetZoom();
}

function resetZoom() {
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
    const zoomImage = document.getElementById('zoomImage');
    if (zoomImage) {
        zoomImage.style.transform = 'scale(1) translate(0, 0)';
    }
}

function setupZoomControls(zoomImage) {
    if (!zoomImage) return;

    // Mouse wheel zoom
    zoomImage.addEventListener('wheel', function(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.2 : 0.2;
        zoomLevel = Math.max(0.5, Math.min(4, zoomLevel + delta));
        applyZoom();
    });

    // Double click to toggle zoom
    zoomImage.addEventListener('dblclick', function(e) {
        e.preventDefault();
        if (zoomLevel > 1) {
            zoomLevel = 1;
            translateX = 0;
            translateY = 0;
        } else {
            zoomLevel = 2;
        }
        applyZoom();
    });

    // Drag to pan when zoomed
    zoomImage.addEventListener('mousedown', function(e) {
        if (zoomLevel > 1) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            zoomImage.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging && zoomLevel > 1) {
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            applyZoom();
        }
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
        if (zoomImage) zoomImage.style.cursor = 'grab';
    });

    // Touch support for mobile
    let touchStartX, touchStartY;
    let initialDistance = 0;
    let initialZoom = 1;

    zoomImage.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1 && zoomLevel > 1) {
            isDragging = true;
            touchStartX = e.touches[0].clientX - translateX;
            touchStartY = e.touches[0].clientY - translateY;
        } else if (e.touches.length === 2) {
            // Pinch to zoom
            initialDistance = getDistance(e.touches[0], e.touches[1]);
            initialZoom = zoomLevel;
        }
    });

    zoomImage.addEventListener('touchmove', function(e) {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
            translateX = e.touches[0].clientX - touchStartX;
            translateY = e.touches[0].clientY - touchStartY;
            applyZoom();
        } else if (e.touches.length === 2) {
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            const scale = currentDistance / initialDistance;
            zoomLevel = Math.max(0.5, Math.min(4, initialZoom * scale));
            applyZoom();
        }
    });

    zoomImage.addEventListener('touchend', function() {
        isDragging = false;
    });
}

function getDistance(touch1, touch2) {
    return Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
}

function applyZoom() {
    const zoomImage = document.getElementById('zoomImage');
    if (!zoomImage) return;

    zoomImage.style.transform = `scale(${zoomLevel}) translate(${translateX / zoomLevel}px, ${translateY / zoomLevel}px)`;
    zoomImage.classList.toggle('zoomed', zoomLevel > 1);
}

// ===== WHATSAPP CONTACT =====
function toggleWaMenu() {
    const dropdown = document.getElementById('waDropdown');
    const list = document.getElementById('waDropdownList');

    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        return;
    }

    // Render user options
    const designers = users.filter(u => u.role === 'designer');
    const marketings = users.filter(u => u.role === 'pemasaran');

    let html = '';

    if (designers.length > 0) {
        html += '<div class="wa-group-title">Desainer</div>';
        designers.forEach(u => {
            html += `<button class="wa-option" onclick="openWaChat('${u.whatsapp || ''}', '${u.nama || ''}', 'designer')">
                <span class="wa-option-icon">🎨</span>
                <span class="wa-option-name">${u.nama || '-'}</span>
            </button>`;
        });
    }

    if (marketings.length > 0) {
        html += '<div class="wa-group-title">Pemasaran</div>';
        marketings.forEach(u => {
            html += `<button class="wa-option" onclick="openWaChat('${u.whatsapp || ''}', '${u.nama || ''}', 'pemasaran')">
                <span class="wa-option-icon">📢</span>
                <span class="wa-option-name">${u.nama || '-'}</span>
            </button>`;
        });
    }

    if (designers.length === 0 && marketings.length === 0) {
        html += '<div class="wa-empty">Belum ada kontak WA</div>';
    }

    list.innerHTML = html;
    dropdown.classList.add('show');
}

function openWaChat(whatsapp, nama, role) {
    if (!whatsapp) {
        alert('Nomor WhatsApp belum diset');
        return;
    }

    // Format nomor
    let phone = whatsapp.replace(/[^0-9]/g, '');
    if (!phone.startsWith('62')) {
        phone = '62' + phone.substring(1);
    }

    // Pesan dengan nama produk
    let message = `Halo ${nama}, saya ingin konsultasi tentang produk *${selectedProduct?.nama || 'MotifKain'}*`;
    if (role === 'designer') {
        message = `Halo Desainer ${nama}, saya ingin konsultasi desain tentang *${selectedProduct?.nama || 'produk'}*`;
    } else if (role === 'pemasaran') {
        message = `Halo ${nama}, saya ingin info produk *${selectedProduct?.nama || 'MotifKain'}*`;
    }

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    // Close dropdown
    document.getElementById('waDropdown').classList.remove('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('waDropdown');
    const btn = document.querySelector('.wa-button');
    if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// ===== WELCOME SCREEN SELECTOR =====
function openWelcomeSelector() {
    const modal = document.getElementById('wsSelectorModal');
    if (!modal) {
        // Create modal if it doesn't exist
        createWelcomeSelectorModal();
    } else {
        renderWelcomeSelectorList();
        modal.classList.add('active');
    }
}

function createWelcomeSelectorModal() {
    const modal = document.createElement('div');
    modal.id = 'wsSelectorModal';
    modal.className = 'ws-selector-modal';
    modal.innerHTML = `
        <div class="ws-selector-content">
            <div class="ws-selector-header">
                <h3>Pilih Welcome Screen</h3>
                <button class="ws-selector-close" onclick="closeWelcomeSelector()">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
            </div>
            <div class="ws-selector-body" id="wsSelectorList">
                <!-- Welcome screens will be loaded here -->
                <div class="ws-selector-loading">Memuat...</div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.classList.add('active');
    renderWelcomeSelectorList();
}

function renderWelcomeSelectorList() {
    const container = document.getElementById('wsSelectorList');
    if (!container) return;

    if (allWelcomeScreens.length === 0) {
        container.innerHTML = '<p class="ws-selector-empty">Belum ada welcome screen. Buka admin untuk membuat.</p>';
        return;
    }

    const templateNames = {
        'cover-dark': 'Gelap',
        'cover-light': 'Terang',
        'cover-split': 'Split',
        'cover-numbered': 'Nomor',
        'cover-minimal': 'Minimal'
    };

    let html = '<div class="ws-selector-grid">';
    for (let i = 0; i < allWelcomeScreens.length; i++) {
        const ws = allWelcomeScreens[i];
        const isActive = ws.id === activeWelcomeScreenId;
        const bgUrl = ws.backgroundImage ? `${CONFIG.pocketbaseUrl}/api/files/${CONFIG.welcomeCollection}/${ws.id}/${ws.backgroundImage}` : '';
        const logoUrl = ws.logo ? `${CONFIG.pocketbaseUrl}/api/files/${CONFIG.welcomeCollection}/${ws.id}/${ws.logo}` : '';
        const templateName = templateNames[ws.template] || 'Default';

        html += `<div class="ws-selector-card ${isActive ? 'active' : ''}" onclick="selectWelcomeScreen('${ws.id}')">`;
        html += `<div class="ws-selector-preview">`;
        if (bgUrl) {
            html += `<div class="ws-selector-bg" style="background-image:url(${bgUrl});opacity:${(100 - (ws.backgroundOpacity || 50)) / 100};"></div>`;
        } else {
            html += `<div class="ws-selector-bg ws-selector-bg-default"></div>`;
        }
        if (logoUrl) {
            html += `<img src="${logoUrl}" class="ws-selector-logo" alt="Logo">`;
        }
        html += `<div class="ws-selector-title">${ws.title || 'Untitled'}</div>`;
        html += `</div>`;
        html += `<div class="ws-selector-info">`;
        html += `<span class="ws-selector-badge">${templateName}</span>`;
        html += `<span class="ws-selector-name">${ws.title || 'Tanpa Judul'}</span>`;
        html += `</div>`;
        if (isActive) {
            html += `<div class="ws-selector-active-badge">Aktif</div>`;
        }
        html += `</div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

async function selectWelcomeScreen(id) {
    const ws = allWelcomeScreens.find(w => w.id === id);
    if (!ws) return;

    // Save to localStorage
    activeWelcomeScreenId = id;
    localStorage.setItem('motifkain_active_ws', id);

    // Update welcome settings
    welcomeSettings = {
        id: ws.id,
        template: ws.template || 'cover-split',
        colorTheme: ws.colorTheme || 'elegant-cream',
        fontFamily: ws.fontFamily || 'Playfair Display',
        logoUrl: ws.logo ? `${CONFIG.pocketbaseUrl}/api/files/${CONFIG.welcomeCollection}/${ws.id}/${ws.logo}` : '',
        backgroundImage: ws.backgroundImage ? `${CONFIG.pocketbaseUrl}/api/files/${CONFIG.welcomeCollection}/${ws.id}/${ws.backgroundImage}` : '',
        backgroundOpacity: ws.backgroundOpacity || 50,
        logoSize: ws.logoSize ?? 60,
        logoX: ws.logoX ?? 50,
        logoY: ws.logoY ?? 10,
        titleSize: ws.titleSize ?? 32,
        titleX: ws.titleX ?? 50,
        titleY: ws.titleY ?? 50,
        subtitleSize: ws.subtitleSize ?? 14,
        subtitleX: ws.subtitleX ?? 50,
        subtitleY: ws.subtitleY ?? 70,
        leftText: ws.leftText || ws.left_text || 'Deskripsi singkat tentang\nkoleksi atau perusahaan Anda.',
        title: ws.title || 'CATALOG',
        subtitle: ws.subtitle || 'Company Profile',
        description: ws.description || 'Koleksi produk eksklusif kami'
    };

    updateFavicon(welcomeSettings.logoUrl);
    renderWelcomeScreen();
    closeWelcomeSelector();
}

function closeWelcomeSelector() {
    const modal = document.getElementById('wsSelectorModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('wsSelectorModal');
    if (modal && e.target === modal) {
        closeWelcomeSelector();
    }
});
