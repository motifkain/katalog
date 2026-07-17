/**
 * MOTIFKAIN ADMIN DASHBOARD
 * Hidden dashboard for managing catalog products
 */

class AdminDashboard {
    constructor() {
        this.products = [];
        this.isAuthenticated = false;
        this.adminPassword = 'motifkain2024'; // Change this for production

        this.init();
    }

    init() {
        // Check authentication
        const auth = sessionStorage.getItem('motifkain_auth');
        if (auth === 'authenticated') {
            this.isAuthenticated = true;
            this.showDashboard();
        } else {
            this.showLogin();
        }

        this.loadProducts();
    }

    showLogin() {
        document.getElementById('loginSection').style.display = 'flex';
        document.getElementById('dashboardSection').style.display = 'none';
        document.getElementById('loginError').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        this.isAuthenticated = true;
    }

    login(password) {
        if (password === this.adminPassword) {
            sessionStorage.setItem('motifkain_auth', 'authenticated');
            this.isAuthenticated = true;
            this.showDashboard();
            this.loadProducts();
        } else {
            document.getElementById('loginError').style.display = 'block';
            document.getElementById('loginError').textContent = 'Password salah!';
        }
    }

    logout() {
        sessionStorage.removeItem('motifkain_auth');
        this.isAuthenticated = false;
        this.showLogin();
    }

    loadProducts() {
        const stored = localStorage.getItem('motifkain_products');
        if (stored) {
            this.products = JSON.parse(stored);
        } else {
            // Load from file as fallback
            fetch('data/products.json')
                .then(res => res.json())
                .then(data => {
                    this.products = data.products || [];
                    this.renderProducts();
                    this.updateStats();
                })
                .catch(() => {
                    this.products = [];
                    this.renderProducts();
                    this.updateStats();
                });
            return;
        }
        this.renderProducts();
        this.updateStats();
    }

    saveProducts() {
        localStorage.setItem('motifkain_products', JSON.stringify(this.products));

        // Also update the products.json file for static hosting
        this.syncToFile();
    }

    async syncToFile() {
        try {
            const data = { products: this.products, settings: { template: localStorage.getItem('motifkain_template') || 'split' } };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

            // Try to save using File System Access API (Chrome)
            if ('showSaveFilePicker' in window) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: 'products.json',
                    types: [{
                        description: 'JSON Files',
                        accept: { 'application/json': ['.json'] }
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
            }
        } catch (e) {
            console.log('File sync skipped - using localStorage only');
        }
    }

    addProduct(product) {
        this.products.push({
            id: Date.now(),
            name: product.name || 'Produk Baru',
            description: product.description || '',
            image: product.image || '',
            addedAt: new Date().toISOString()
        });
        this.saveProducts();
        this.renderProducts();
        this.updateStats();

        // Refresh flipbook if open in another tab
        this.notifyFlipbookRefresh();
    }

    updateProduct(id, updates) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...updates };
            this.saveProducts();
            this.renderProducts();
            this.notifyFlipbookRefresh();
        }
    }

    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this.saveProducts();
        this.renderProducts();
        this.updateStats();
        this.notifyFlipbookRefresh();
    }

    reorderProducts(fromIndex, toIndex) {
        const [moved] = this.products.splice(fromIndex, 1);
        this.products.splice(toIndex, 0, moved);
        this.saveProducts();
        this.renderProducts();
        this.notifyFlipbookRefresh();
    }

    notifyFlipbookRefresh() {
        // Dispatch storage event to notify flipbook in other tabs
        localStorage.setItem('motifkain_refresh', Date.now());
    }

    renderProducts() {
        const container = document.getElementById('productsGrid');
        if (!container) return;

        if (this.products.length === 0) {
            container.innerHTML = `
                <div class="empty-products">
                    <div class="empty-icon">📦</div>
                    <h3>Belum Ada Produk</h3>
                    <p>Tambahkan produk pertama Anda dengan drag & drop foto</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.products.map((product, index) => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    ${product.image
                        ? `<img src="${product.image}" alt="${product.name}">`
                        : `<div class="no-image">
                            <span style="font-size: 2rem; opacity: 0.5;">📷</span>
                            <span>No Image</span>
                           </div>`
                    }
                    <div class="product-overlay">
                        <button class="btn-icon" onclick="admin.previewProduct(${product.id})" title="Preview">
                            👁️
                        </button>
                        <button class="btn-icon" onclick="admin.editProduct(${product.id})" title="Edit">
                            ✏️
                        </button>
                        <button class="btn-icon" onclick="admin.deleteProduct(${product.id})" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p>${product.description || 'Tanpa deskripsi'}</p>
                    <div class="product-actions">
                        <button class="btn-move" onclick="admin.moveProduct(${index}, -1)" ${index === 0 ? 'disabled' : ''}>
                            ↑
                        </button>
                        <span class="order-num">${index + 1}</span>
                        <button class="btn-move" onclick="admin.moveProduct(${index}, 1)" ${index === this.products.length - 1 ? 'disabled' : ''}>
                            ↓
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const stats = document.getElementById('stats');
        if (stats) {
            const template = localStorage.getItem('motifkain_template') || 'split';
            stats.innerHTML = `
                <div class="stat-item">
                    <span class="stat-number">${this.products.length}</span>
                    <span class="stat-label">Total Produk</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${Math.ceil(this.products.length / 2)}</span>
                    <span class="stat-label">Total Halaman</span>
                </div>
            `;
            const templateDisplay = document.getElementById('templateDisplay');
            if (templateDisplay) {
                templateDisplay.textContent = template;
            }
        }
    }

    previewProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            const modal = document.getElementById('previewModal');
            if (modal) {
                const previewImage = document.getElementById('previewImage');
                const previewTitle = document.getElementById('previewTitle');
                const previewDesc = document.getElementById('previewDesc');

                if (product.image) {
                    previewImage.src = product.image;
                } else {
                    previewImage.src = 'data:image/svg+xml,' + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
                            <rect fill="#F5F0E8" width="400" height="200"/>
                            <text x="200" y="100" text-anchor="middle" fill="#A1887F" font-family="sans-serif" font-size="14">
                                📷 No Image
                            </text>
                        </svg>
                    `);
                }
                previewTitle.textContent = product.name;
                previewDesc.textContent = product.description || 'Tidak ada deskripsi';
                modal.style.display = 'flex';
            }
        }
    }

    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            document.getElementById('editId').value = product.id;
            document.getElementById('editName').value = product.name;
            document.getElementById('editDesc').value = product.description || '';
            document.getElementById('editPreview').src = product.image || 'data:image/svg+xml,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
                    <rect fill="#F5F0E8" width="400" height="200"/>
                    <text x="200" y="100" text-anchor="middle" fill="#A1887F" font-family="sans-serif" font-size="14">
                        📷 No Image
                    </text>
                </svg>
            `);
            document.getElementById('editModal').style.display = 'flex';
        }
    }

    moveProduct(index, direction) {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < this.products.length) {
            this.reorderProducts(index, newIndex);
        }
    }

    saveEdit() {
        const id = parseInt(document.getElementById('editId').value);
        const name = document.getElementById('editName').value;
        const description = document.getElementById('editDesc').value;

        this.updateProduct(id, { name, description });
        document.getElementById('editModal').style.display = 'none';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    handleFileUpload(files) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        Array.from(files).forEach(file => {
            if (validTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.addProduct({
                        name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
                        description: '',
                        image: e.target.result
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    }

    openCatalog() {
        window.open('index.html', '_blank');
    }
}

// Initialize admin
let admin;
document.addEventListener('DOMContentLoaded', () => {
    admin = new AdminDashboard();

    // Login form
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('passwordInput').value;
        admin.login(password);
    });

    // Drag and drop
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            admin.handleFileUpload(files);
        });
    }

    // File input
    document.getElementById('fileInput')?.addEventListener('change', (e) => {
        admin.handleFileUpload(e.target.files);
    });

    // Modal close on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Listen for flipbook refresh
    window.addEventListener('storage', (e) => {
        if (e.key === 'motifkain_refresh' && admin) {
            admin.loadProducts();
        }
    });
});

// Export
window.AdminDashboard = AdminDashboard;
