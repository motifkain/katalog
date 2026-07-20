/**
 * MOTIFKAIN FLIPBOOK - INSTAGRAM 4:5 PORTRAIT STYLE
 * Single page flipbook dengan ukuran 1080x1350 (4:5)
 */

class Flipbook {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            animationSpeed: options.animationSpeed || 600,
            autoLoad: options.autoLoad !== false,
            pocketbaseUrl: options.pocketbaseUrl || '',
            ...options
        };

        this.pages = [];
        this.currentPage = 0;
        this.totalPages = 0;
        this.isAnimating = false;

        this.init();
    }

    async init() {
        if (this.options.autoLoad) {
            await this.loadPages();
        }
        this.render();
        this.bindEvents();
    }

    async loadPages() {
        // Coba load dari PocketBase first, fallback ke localStorage
        const pbUrl = window.MOTIFKAIN_CONFIG?.pocketbaseUrl || this.options.pocketbaseUrl;

        if (pbUrl) {
            try {
                const response = await fetch(`${pbUrl}/api/collections/catalog_pages/records?sort=order`);
                if (response.ok) {
                    const data = await response.json();
                    this.pages = data.items.map(item => ({
                        id: item.id,
                        template: item.template,
                        order: item.order,
                        mainTitle: item.mainTitle,
                        subtitle: item.subtitle,
                        description: item.description,
                        title: item.title,
                        body: item.body,
                        overlayText: item.overlayText,
                        overlayPosition: item.overlayPosition,
                        header: item.header,
                        footerText: item.footerText,
                        image: item.image ? `${pbUrl}/api/files/catalog_pages/${item.id}/${item.image}` : '',
                        images: item.images || [],
                        logo: item.logo ? `${pbUrl}/api/files/catalog_pages/${item.id}/${item.logo}` : '',
                        colorTheme: item.colorTheme,
                        fontFamily: item.fontFamily,
                        fontSizePx: item.fontSizePx,
                        titleSizePx: item.titleSizePx,
                        bodySizePx: item.bodySizePx,
                        logoSizePx: item.logoSizePx,
                        textColor: item.textColor,
                        bgColor: item.bgColor
                    }));

                    // Process multiple images
                    for (let i = 0; i < this.pages.length; i++) {
                        if (this.pages[i].images && this.pages[i].images.length > 0) {
                            this.pages[i].images = this.pages[i].images.map((img, idx) =>
                                `${pbUrl}/api/files/catalog_pages/${this.pages[i].id}/${img}`
                            );
                        }
                    }

                    if (window.MOTIFKAIN_CONFIG?.debug) {
                        console.log('Loaded', this.pages.length, 'pages from PocketBase');
                    }
                    this.totalPages = this.pages.length;
                    return;
                }
            } catch (e) {
                if (window.MOTIFKAIN_CONFIG?.debug) {
                    console.log('PocketBase unavailable, using localStorage:', e);
                }
            }
        }

        // Fallback ke localStorage
        this.pages = this.loadFromLocalStorage();
        this.totalPages = this.pages.length;
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem('motifkain_catalog');
        if (stored) {
            return JSON.parse(stored);
        }
        return [];
    }

    saveToLocalStorage() {
        localStorage.setItem('motifkain_catalog', JSON.stringify(this.pages));
        localStorage.setItem('motifkain_refresh', Date.now());
    }

    setPages(pages) {
        this.pages = pages;
        this.totalPages = pages.length;
        this.currentPage = 0;
        this.render();
        this.updateNavigation();
    }

    render() {
        if (!this.pages.length) {
            this.container.innerHTML = `
                <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#FFF8F0;">
                    <div style="font-size:3rem;margin-bottom:1rem;opacity:0.3;">📖</div>
                    <p style="color:#6D4C41;font-size:0.9rem;">Belum ada halaman katalog</p>
                    <p style="color:#A1887F;font-size:0.75rem;margin-top:0.5rem;">Buka dashboard admin untuk menambahkan</p>
                </div>`;
            return;
        }

        this.container.innerHTML = `
            <div class="flipbook-pages">
                ${this.pages.map((page, i) => `
                    <div class="flipbook-page ${i === this.currentPage ? 'active' : ''} ${i < this.currentPage ? 'flipped' : ''}"
                         data-page="${i}"
                         style="display:${i === this.currentPage || i === this.currentPage + 1 ? 'flex' : 'none'}">
                        ${PageTemplates.renderPage(page, i + 1)}
                    </div>
                `).join('')}
            </div>
            ${this.renderPageIndicators()}
        `;

        this.updateNavigation();
    }

    renderPageIndicators() {
        if (this.totalPages <= 1) return '';

        let indicators = '';
        for (let i = 0; i < this.totalPages; i++) {
            indicators += `<div class="page-dot ${i === this.currentPage ? 'active' : ''}" data-page="${i}"></div>`;
        }

        return `
            <div class="page-indicators">
                ${indicators}
            </div>
        `;
    }

    bindEvents() {
        // Click to flip
        this.container.addEventListener('click', (e) => {
            // Check if clicked on an image (for zoom/select)
            const img = e.target.closest('.catalog-image');
            if (img) {
                // Let the parent handler deal with it
                return;
            }

            const dot = e.target.closest('.page-dot');
            if (dot) {
                this.goToPage(parseInt(dot.dataset.page));
                return;
            }

            const pageEl = e.target.closest('.flipbook-page');
            if (pageEl && !this.isAnimating) {
                const rect = this.container.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const isLeftSide = clickX < rect.width / 2;

                if (isLeftSide) {
                    this.prevPage();
                } else {
                    this.nextPage();
                }
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                this.nextPage();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prevPage();
            }
        });

        // Touch swipe
        this.setupTouch();

        // Listen for storage changes (for multi-tab sync)
        window.addEventListener('storage', (e) => {
            if (e.key === 'motifkain_refresh') {
                this.refresh();
            }
        });

        // Poll for changes (backup)
        setInterval(() => {
            const r = localStorage.getItem('motifkain_refresh');
            if (r && r !== this.lastRefresh) {
                this.lastRefresh = r;
                this.refresh();
            }
        }, 1000);
    }

    setupTouch() {
        let startX = 0;
        let startY = 0;

        this.container.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
            startY = e.changedTouches[0].screenY;
        }, { passive: true });

        this.container.addEventListener('touchend', (e) => {
            const diffX = startX - e.changedTouches[0].screenX;
            const diffY = startY - e.changedTouches[0].screenY;

            // Only register as swipe if horizontal movement is greater
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextPage();
                } else {
                    this.prevPage();
                }
            }
        }, { passive: true });
    }

    nextPage() {
        if (this.isAnimating || this.currentPage >= this.totalPages - 1) return;
        this.isAnimating = true;

        const currentEl = this.container.querySelector(`.flipbook-page[data-page="${this.currentPage}"]`);
        this.currentPage++;

        if (currentEl) {
            currentEl.classList.add('flipping-left');
            currentEl.classList.remove('active');
        }

        setTimeout(() => {
            if (currentEl) {
                currentEl.style.display = 'none';
                currentEl.classList.remove('flipping-left');
            }

            const nextEl = this.container.querySelector(`.flipbook-page[data-page="${this.currentPage}"]`);
            if (nextEl) {
                nextEl.style.display = 'flex';
                nextEl.classList.add('active', 'sliding-in-right');
                setTimeout(() => nextEl.classList.remove('sliding-in-right'), this.options.animationSpeed);
            }

            this.updateNavigation();
            this.isAnimating = false;
        }, this.options.animationSpeed);
    }

    prevPage() {
        if (this.isAnimating || this.currentPage <= 0) return;
        this.isAnimating = true;

        const currentEl = this.container.querySelector(`.flipbook-page[data-page="${this.currentPage}"]`);
        this.currentPage--;

        if (currentEl) {
            currentEl.classList.add('sliding-out-right');
            setTimeout(() => {
                currentEl.style.display = 'none';
                currentEl.classList.remove('sliding-out-right', 'active');
            }, this.options.animationSpeed);
        }

        const prevEl = this.container.querySelector(`.flipbook-page[data-page="${this.currentPage}"]`);
        if (prevEl) {
            prevEl.style.display = 'flex';
            prevEl.classList.add('flipping-right', 'active');
            setTimeout(() => prevEl.classList.remove('flipping-right'), this.options.animationSpeed);
        }

        this.updateNavigation();
        this.isAnimating = false;
    }

    goToPage(pageNum) {
        if (pageNum < 0 || pageNum >= this.totalPages || this.isAnimating) return;
        this.isAnimating = true;

        const currentEl = this.container.querySelector(`.flipbook-page[data-page="${this.currentPage}"]`);
        const targetEl = this.container.querySelector(`.flipbook-page[data-page="${pageNum}"]`);

        if (currentEl) {
            currentEl.style.display = 'none';
            currentEl.classList.remove('active');
        }

        if (targetEl) {
            targetEl.style.display = 'flex';
            targetEl.classList.add('active');
        }

        this.currentPage = pageNum;

        setTimeout(() => {
            this.updateNavigation();
            this.isAnimating = false;
        }, 100);
    }

    updateNavigation() {
        // Update dots
        const dots = this.container.querySelectorAll('.page-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentPage);
        });

        // Update prev/next buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const indicator = document.getElementById('pageIndicator');

        if (prevBtn) prevBtn.disabled = this.currentPage <= 0;
        if (nextBtn) nextBtn.disabled = this.currentPage >= this.totalPages - 1;
        if (indicator) indicator.innerHTML = `<strong>${this.currentPage + 1}</strong> / ${this.totalPages}`;
    }

    async refresh() {
        await this.loadPages();
        this.render();
    }

    // Update pages from admin
    updatePages(pages) {
        this.pages = pages.map((p, i) => ({ ...p, order: i }));
        this.totalPages = this.pages.length;
        if (this.currentPage >= this.totalPages) {
            this.currentPage = Math.max(0, this.totalPages - 1);
        }
        this.render();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('flipbookContainer');
    if (container) {
        window.flipbook = new Flipbook('flipbookContainer');
    }
});

window.Flipbook = Flipbook;
