/* =====================================================================
   MotifKain — Katalog Publik (vanilla JS, no build, no deps)
   Alur:
     1. Boot → load hierarki 6 koleksi PocketBase (parallel + expand)
     2. Bangun tree di-memory: layanan → kategori → subkategori → produk → warna → gambar
     3. Render: hero stats, filter chips, motif grid, kontak, footer year
     4. Interaksi: search, filter, modal detail, lightbox gallery
     5. Fallback: bila PB gagal/kosong → pakai sample dari config.js
   ===================================================================== */

(function () {
  'use strict';

  /* ---------- Config & state ---------- */
  var CFG = window.MOTIFKAIN_CONFIG || {};
  var pbUrl = (CFG.pocketbaseUrl || '').replace(/\/+$/, '');
  var perPage = CFG.perPage || 500;

  var els = {};
  var state = {
    layanan: [],
    kategori: [],
    subkategori: [],
    produk: [],
    warna: [],
    gambar: [],
    kontak: [],
    /* Tree siap-render */
    tree: { layanan: [] },
    /* UI state */
    activeLayanan: 'all',
    query: '',
    loaded: false,
    lightboxImages: [],
    lightboxIndex: 0
  };

  /* =================================================================
     1. Boot
     ================================================================= */
  document.addEventListener('DOMContentLoaded', function () {
    cacheElements();
    bindEvents();
    setFooterYear();
    showLoading(true);
    loadAllData().then(function () {
      buildTree();
      renderHeroStats();
      renderFilters();
      renderMotifGrid();
      renderKontak();
      state.loaded = true;
      showLoading(false);
    }).catch(function (err) {
      console.warn('[MotifKain] PocketBase fetch gagal, pakai sample fallback:', err && err.message);
      useSampleFallback();
      buildTree();
      renderHeroStats();
      renderFilters();
      renderMotifGrid();
      renderKontak();
      state.loaded = true;
      showLoading(false);
      showStateError('Tidak dapat terhubung ke PocketBase. Menampilkan data contoh.');
    });
  });

  function cacheElements() {
    els.grid         = document.getElementById('motifGrid');
    els.filterBar    = document.getElementById('filterBar');
    els.searchInput  = document.getElementById('searchInput');
    els.searchForm   = document.getElementById('searchForm');
    els.searchBar    = document.getElementById('searchBar');
    els.searchToggle = document.getElementById('searchToggle');
    els.searchClose  = document.getElementById('searchClose');
    els.modal        = document.getElementById('modalDetail');
    els.detailTitle  = document.getElementById('modalDetailTitle');
    els.detailCrumb  = document.getElementById('detailCrumb');
    els.detailMeta   = document.getElementById('detailMeta');
    els.detailPrice  = document.getElementById('detailPrice');
    els.detailDesc   = document.getElementById('detailDesc');
    els.detailWarna  = document.getElementById('detailWarna');
    els.warnaList    = document.getElementById('warnaList');
    els.detailActions= document.getElementById('detailActions');
    els.btnWaDesainer= document.getElementById('btnWaDesainer');
    els.btnWaPemasaran = document.getElementById('btnWaPemasaran');
    els.detailGallery= document.getElementById('detailGallery');
    els.lightbox     = document.getElementById('lightbox');
    els.lightboxImg  = document.getElementById('lightboxImg');
    els.stateLoading = document.getElementById('stateLoading');
    els.stateError   = document.getElementById('stateError');
    els.stateEmpty   = document.getElementById('stateEmpty');
    els.stateErrorMsg= document.getElementById('stateErrorMsg');
    els.stateRetry   = document.getElementById('stateRetry');
    els.toast        = document.getElementById('toast');
  }

  function bindEvents() {
    /* Search */
    els.searchToggle.addEventListener('click', toggleSearch);
    els.searchClose.addEventListener('click', closeSearch);
    els.searchInput.addEventListener('input', function (e) {
      state.query = (e.target.value || '').trim().toLowerCase();
      renderMotifGrid();
    });

    /* Modal close */
    if (els.modal) {
      els.modal.addEventListener('click', function (e) {
        if (e.target.hasAttribute('data-close')) closeModal();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (els.lightbox && !els.lightbox.hidden) closeLightbox();
        else if (els.modal && !els.modal.hidden) closeModal();
        else if (els.searchBar && !els.searchBar.hidden) closeSearch();
      }
      if (els.lightbox && !els.lightbox.hidden) {
        if (e.key === 'ArrowLeft')  navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
      }
    });

    /* Lightbox nav */
    if (els.lightbox) {
      els.lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
      els.lightbox.querySelector('.lightbox-prev').addEventListener('click', function () { navigateLightbox(-1); });
      els.lightbox.querySelector('.lightbox-next').addEventListener('click', function () { navigateLightbox(1); });
      els.lightbox.addEventListener('click', function (e) {
        if (e.target === els.lightbox) closeLightbox();
      });
    }

    /* Retry */
    if (els.stateRetry) {
      els.stateRetry.addEventListener('click', function () {
        showLoading(true);
        hideAllStates();
        loadAllData().then(function () {
          buildTree(); renderHeroStats(); renderFilters(); renderMotifGrid(); renderKontak();
          showLoading(false);
        }).catch(function () { showLoading(false); showStateError('Masih tidak dapat terhubung.'); });
      });
    }
  }

  function setFooterYear() {
    var el = document.getElementById('yearNow');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* =================================================================
     2. PocketBase fetch
     ================================================================= */
  function pbUrl_(path) { return pbUrl + path; }

  function pbFetch(path) {
    /* Endpoint publik — tanpa Authorization.
       PocketBase secara default menerima ?page=1&perPage=500&sort=field. */
    return fetch(pbUrl_(path), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' dari ' + path);
      return r.json();
    });
  }

  function fetchCollection(name) {
    var path = '/api/collections/' + encodeURIComponent(name) + '/records?perPage=' + perPage + '&sort=order,nama,created';
    return pbFetch(path).then(function (j) { return j.items || []; });
  }

  function loadAllData() {
    /* Fetch paralel semua koleksi yang diperlukan */
    var lists = CFG.fetchList || ['layanan', 'kategori', 'subkategori', 'produk', 'warna', 'gambar', 'kontak'];
    var promises = lists.map(function (name) {
      return fetchCollection(name).then(function (items) { return { name: name, items: items }; });
    });
    return Promise.all(promises).then(function (results) {
      results.forEach(function (r) {
        if (state.hasOwnProperty(r.name)) state[r.name] = r.items;
      });
    });
  }

  function useSampleFallback() {
    var s = (CFG.sample) || {};
    state.layanan     = s.layanan     || [];
    state.kategori    = s.kategori    || [];
    state.subkategori = s.subkategori || [];
    state.produk      = s.produk      || [];
    state.warna       = s.warna       || [];
    state.gambar      = s.gambar      || [];
    state.kontak      = s.kontak      || [];
  }

  /* =================================================================
     3. Build tree (relasi one-to-many)
     ================================================================= */
  function buildTree() {
    var byIdLayanan     = indexBy(state.layanan, 'id');
    var byIdKategori    = indexBy(state.kategori, 'id');
    var byIdSubkategori = indexBy(state.subkategori, 'id');
    var byIdProduk      = indexBy(state.produk, 'id');
    var byIdWarna       = indexBy(state.warna, 'id');

    /* gambar dikelompokkan per warna (relasi Many — gambar.warna bisa id array) */
    state.gambar.forEach(function (g) {
      var ids = Array.isArray(g.warna) ? g.warna : (g.warna ? [g.warna] : []);
      g._warnaIds = ids;
      /* bangun url PocketBase */
      g._url = buildFileUrl(CFG.collections.gambar, g.id, g.gambar);
    });

    /* warna → produk (Many), produk → warnaList (Many) */
    var warnaByProduk = {};
    state.warna.forEach(function (w) {
      var pIds = Array.isArray(w.produk) ? w.produk : (w.produk ? [w.produk] : []);
      w._produkIds = pIds;
      (warnaByProduk[w.produk] = warnaByProduk[w.produk] || []).push(w);
      /* url gambar per warna */
      w._images = state.gambar.filter(function (g) { return g._warnaIds.indexOf(w.id) !== -1; });
    });

    /* produk → warnaList, dengan gambar pertama sebagai thumbnail */
    state.produk.forEach(function (p) {
      p._warnaList = warnaByProduk[p.id] || [];
      var firstImg = null;
      for (var i = 0; i < p._warnaList.length; i++) {
        if (p._warnaList[i]._images.length) { firstImg = p._warnaList[i]._images[0]; break; }
      }
      p._thumb = firstImg ? firstImg._url : fileUrlToDataUri(CFG.placeholderSvg);
    });

    /* subkategori → produkList */
    var produkBySub = groupBy(state.produk, function (p) {
      return Array.isArray(p.subkategori) ? p.subkategori[0] : p.subkategori;
    });
    state.subkategori.forEach(function (s) { s._produkList = produkBySub[s.id] || []; });

    /* kategori → subkategoriList */
    var subByKat = groupBy(state.subkategori, function (s) {
      return Array.isArray(s.kategori) ? s.kategori[0] : s.kategori;
    });
    state.kategori.forEach(function (k) { k._subkategoriList = subByKat[k.id] || []; });

    /* layanan → kategoriList */
    var katByLayanan = groupBy(state.kategori, function (k) {
      return Array.isArray(k.layanan) ? k.layanan[0] : k.layanan;
    });
    state.layanan.forEach(function (l) { l._kategoriList = katByLayanan[l.id] || []; });

    /* Tree siap-render */
    state.tree.layanan = state.layanan.slice().sort(function (a, b) {
      return (a.order || 999) - (b.order || 999);
    });
  }

  function buildFileUrl(collectionName, recordId, filename) {
    if (!filename) return null;
    var fname = Array.isArray(filename) ? filename[0] : filename;
    if (!fname) return null;
    if (/^(https?:|data:)/.test(fname)) return fname; /* sudah absolut / data URI */
    if (!pbUrl) return null;
    return pbUrl + '/api/files/' + encodeURIComponent(collectionName) + '/' + encodeURIComponent(recordId) + '/' + encodeURIComponent(fname);
  }

  function fileUrlToDataUri(svgString) {
    if (!svgString) return null;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
  }

  /* =================================================================
     4. Render
     ================================================================= */
  function renderHeroStats() {
    setStat('motif',       state.gambar.length);
    setStat('kategori',    state.kategori.length);
    setStat('subkategori', state.subkategori.length);
    setStat('produk',      state.produk.length);

    function setStat(key, val) {
      var node = document.querySelector('[data-count="' + key + '"]');
      if (node) node.textContent = val > 0 ? String(val) : '—';
    }
  }

  function renderFilters() {
    var html = '<button class="chip chip-active" data-filter="all" role="tab" aria-selected="true">Semua <span class="chip-count">' + state.produk.length + '</span></button>';
    state.layanan.forEach(function (l) {
      var count = l._kategoriList.reduce(function (acc, k) {
        return acc + k._subkategoriList.reduce(function (acc2, s) { return acc2 + s._produkList.length; }, 0);
      }, 0);
      html += '<button class="chip" data-filter="' + escAttr(l.id) + '" role="tab" aria-selected="false">' +
              escHtml(l.nama) + ' <span class="chip-count">' + count + '</span></button>';
    });
    els.filterBar.innerHTML = html;

    /* Bind click */
    Array.prototype.forEach.call(els.filterBar.querySelectorAll('.chip'), function (chip) {
      chip.addEventListener('click', function () {
        Array.prototype.forEach.call(els.filterBar.querySelectorAll('.chip'), function (c) {
          c.classList.remove('chip-active');
          c.setAttribute('aria-selected', 'false');
        });
        chip.classList.add('chip-active');
        chip.setAttribute('aria-selected', 'true');
        state.activeLayanan = chip.getAttribute('data-filter');
        renderMotifGrid();
      });
    });
  }

  function renderMotifGrid() {
    var produkList = filteredProduk();
    if (!produkList.length) {
      els.grid.innerHTML = '';
      els.stateEmpty.hidden = false;
      return;
    }
    els.stateEmpty.hidden = true;

    var html = '';
    produkList.forEach(function (p) {
      var sub = findById(state.subkategori, firstId(p.subkategori));
      var kat = sub ? findById(state.kategori, firstId(sub.kategori)) : null;
      var lay = kat ? findById(state.layanan, firstId(kat.layanan)) : null;

      var crumb = [lay, kat, sub].filter(Boolean).map(function (x) { return x.nama; }).join(' · ');
      var warnaCount = p._warnaList.length;
      var imgCount = p._warnaList.reduce(function (a, w) { return a + w._images.length; }, 0);

      html += '<article class="motif-card" data-produk-id="' + escAttr(p.id) + '" tabindex="0" role="button" aria-label="Lihat detail ' + escAttr(p.nama) + '">' +
        '<div class="motif-img-wrap">' +
          (p._thumb ? '<img src="' + escAttr(p._thumb) + '" alt="' + escAttr(p.nama) + '" class="motif-img" loading="lazy">' : '<div class="motif-img-placeholder">' + escHtml(p.nama) + '</div>') +
          (lay ? '<span class="motif-img-badge">' + escHtml(lay.nama) + '</span>' : '') +
        '</div>' +
        '<div class="motif-body">' +
          '<p class="motif-crumb">' + escHtml(crumb) + '</p>' +
          '<h3 class="motif-title">' + escHtml(p.nama) + '</h3>' +
          '<div class="motif-meta">' +
            (warnaCount > 0 ? '<span class="motif-meta-item">' + warnaCount + ' warna</span>' : '') +
            (imgCount > 0 ? '<span class="motif-meta-item">' + imgCount + ' foto</span>' : '') +
            (typeof p.harga === 'number' ? '<span class="motif-meta-item" style="margin-left:auto; font-weight:600; color:var(--color-primary);">' + formatRupiah(p.harga) + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</article>';
    });

    els.grid.innerHTML = html;
    Array.prototype.forEach.call(els.grid.querySelectorAll('.motif-card'), function (card) {
      card.addEventListener('click', function () { openDetail(card.getAttribute('data-produk-id')); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(card.getAttribute('data-produk-id')); }
      });
    });
  }

  function renderKontak() {
    var el = document.getElementById('kontakList');
    if (!el) return;
    if (!state.kontak.length) {
      el.innerHTML = '';
      return;
    }
    var html = '';
    state.kontak.forEach(function (k) {
      var initials = (k.nama || '').split(' ').map(function (s) { return s[0]; }).join('').slice(0, 2).toUpperCase();
      var waLink = formatWaLink(k.whatsapp);
      html += '<a class="kontak-card" href="' + escAttr(waLink) + '" target="_blank" rel="noopener">' +
        '<div class="kontak-avatar">' + escHtml(initials) + '</div>' +
        '<div class="kontak-info">' +
          '<div class="kontak-name">' + escHtml(k.nama) + '</div>' +
          '<div class="kontak-role">' + escHtml(k.role || '') + '</div>' +
          '<div class="kontak-wa">' + escHtml(k.whatsapp || '') + ' ↗</div>' +
        '</div>' +
      '</a>';
    });
    el.innerHTML = html;
  }

  function filteredProduk() {
    var list = state.produk.slice();
    /* Filter by layanan */
    if (state.activeLayanan && state.activeLayanan !== 'all') {
      var allowedKatIds = state.kategori
        .filter(function (k) { return firstId(k.layanan) === state.activeLayanan; })
        .map(function (k) { return k.id; });
      var allowedSubIds = state.subkategori
        .filter(function (s) { return allowedKatIds.indexOf(firstId(s.kategori)) !== -1; })
        .map(function (s) { return s.id; });
      list = list.filter(function (p) { return allowedSubIds.indexOf(firstId(p.subkategori)) !== -1; });
    }
    /* Filter by query */
    if (state.query) {
      var q = state.query;
      list = list.filter(function (p) {
        if ((p.nama || '').toLowerCase().indexOf(q) !== -1) return true;
        if ((p.deskripsi || '').toLowerCase().indexOf(q) !== -1) return true;
        var sub = findById(state.subkategori, firstId(p.subkategori));
        if (sub && (sub.nama || '').toLowerCase().indexOf(q) !== -1) return true;
        var kat = sub ? findById(state.kategori, firstId(sub.kategori)) : null;
        if (kat && (kat.nama || '').toLowerCase().indexOf(q) !== -1) return true;
        var lay = kat ? findById(state.layanan, firstId(kat.layanan)) : null;
        if (lay && (lay.nama || '').toLowerCase().indexOf(q) !== -1) return true;
        return false;
      });
    }
    return list;
  }

  /* =================================================================
     5. Detail modal & lightbox
     ================================================================= */
  function openDetail(produkId) {
    var p = findById(state.produk, produkId);
    if (!p) return;
    var sub = findById(state.subkategori, firstId(p.subkategori));
    var kat = sub ? findById(state.kategori, firstId(sub.kategori)) : null;
    var lay = kat ? findById(state.layanan, firstId(kat.layanan)) : null;

    var crumb = [lay, kat, sub].filter(Boolean).map(function (x) { return x.nama; }).join(' · ');
    els.detailCrumb.textContent  = crumb;
    els.detailTitle.textContent  = p.nama || '';
    els.detailMeta.textContent   = sub ? ('Subkategori: ' + sub.nama) : '';
    els.detailDesc.textContent   = p.deskripsi || 'Belum ada deskripsi untuk motif ini.';

    if (typeof p.harga === 'number' && p.harga > 0) {
      els.detailPrice.hidden = false;
      els.detailPrice.textContent = formatRupiah(p.harga);
    } else {
      els.detailPrice.hidden = true;
    }

    /* Gallery: kumpulkan semua gambar dari semua warna */
    var allImages = [];
    p._warnaList.forEach(function (w) {
      w._images.forEach(function (g) { allImages.push({ url: g._url, desc: g.deskripsi || w.nama, warnaId: w.id }); });
    });
    if (!allImages.length) {
      allImages.push({ url: fileUrlToDataUri(CFG.placeholderSvg), desc: p.nama, warnaId: null });
    }
    state.lightboxImages = allImages.map(function (x) { return x.url; });

    /* Main image + thumbnails */
    var galleryHtml = '<img src="' + escAttr(allImages[0].url) + '" alt="' + escAttr(p.nama) + '" class="detail-main-img" id="detailMainImg" data-zoom="0">';
    if (allImages.length > 1) {
      galleryHtml += '<div class="detail-thumbs">';
      allImages.forEach(function (img, i) {
        galleryHtml += '<img src="' + escAttr(img.url) + '" alt="' + escAttr(img.desc || '') + '" class="detail-thumb' + (i === 0 ? ' active' : '') + '" data-thumb-index="' + i + '">';
      });
      galleryHtml += '</div>';
    }
    els.detailGallery.innerHTML = galleryHtml;

    /* Bind thumb click + zoom */
    Array.prototype.forEach.call(els.detailGallery.querySelectorAll('.detail-thumb'), function (thumb) {
      thumb.addEventListener('click', function () {
        var i = parseInt(thumb.getAttribute('data-thumb-index'), 10) || 0;
        var main = document.getElementById('detailMainImg');
        if (main) { main.src = thumb.src; main.setAttribute('data-zoom', String(i)); }
        Array.prototype.forEach.call(els.detailGallery.querySelectorAll('.detail-thumb'), function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');
      });
    });
    var mainImg = document.getElementById('detailMainImg');
    if (mainImg) mainImg.addEventListener('click', function () { openLightbox(state.lightboxImages, parseInt(mainImg.getAttribute('data-zoom') || '0', 10)); });

    /* Warna chips */
    if (p._warnaList.length) {
      els.detailWarna.hidden = false;
      els.warnaList.innerHTML = p._warnaList.map(function (w, i) {
        return '<span class="warna-chip' + (i === 0 ? ' warna-chip-active' : '') + '" data-warna-id="' + escAttr(w.id) + '">' + escHtml(w.nama) + ' (' + w._images.length + ')</span>';
      }).join('');
      Array.prototype.forEach.call(els.warnaList.querySelectorAll('.warna-chip'), function (chip) {
        chip.addEventListener('click', function () {
          var wid = chip.getAttribute('data-warna-id');
          var w = findById(state.warna, wid);
          if (!w || !w._images.length) return;
          var imgs = w._images.map(function (g) { return g._url; });
          state.lightboxImages = imgs;
          var main = document.getElementById('detailMainImg');
          if (main) { main.src = imgs[0]; main.setAttribute('data-zoom', '0'); }
          Array.prototype.forEach.call(els.warnaList.querySelectorAll('.warna-chip'), function (c) { c.classList.remove('warna-chip-active'); });
          chip.classList.add('warna-chip-active');
        });
      });
    } else {
      els.detailWarna.hidden = true;
    }

    /* Action buttons → kontak WA */
    var desainer = state.kontak.find(function (k) { return (k.role || '').toLowerCase() === 'desainer'; });
    var pemasaran = state.kontak.find(function (k) { return (k.role || '').toLowerCase() === 'pemasaran'; });
    if (desainer || pemasaran) {
      els.detailActions.hidden = false;
      if (els.btnWaDesainer) {
        if (desainer) {
          els.btnWaDesainer.href = formatWaLink(desainer.whatsapp, formatWaMessage(p, 'desainer', desainer.nama));
          els.btnWaDesainer.style.display = '';
        } else {
          els.btnWaDesainer.style.display = 'none';
        }
      }
      if (els.btnWaPemasaran) {
        if (pemasaran) {
          els.btnWaPemasaran.href = formatWaLink(pemasaran.whatsapp, formatWaMessage(p, 'pemasaran', pemasaran.nama));
          els.btnWaPemasaran.style.display = '';
        } else {
          els.btnWaPemasaran.style.display = 'none';
        }
      }
    } else {
      els.detailActions.hidden = true;
    }

    /* Lock body scroll */
    document.body.style.overflow = 'hidden';
    els.modal.hidden = false;
    els.modal.scrollTop = 0;
  }

  function closeModal() {
    els.modal.hidden = true;
    document.body.style.overflow = '';
  }

  function openLightbox(images, index) {
    if (!images || !images.length) return;
    state.lightboxImages = images;
    state.lightboxIndex = Math.max(0, Math.min(index || 0, images.length - 1));
    els.lightboxImg.src = images[state.lightboxIndex];
    els.lightbox.hidden = false;
  }

  function closeLightbox() {
    els.lightbox.hidden = true;
  }

  function navigateLightbox(delta) {
    if (!state.lightboxImages.length) return;
    state.lightboxIndex = (state.lightboxIndex + delta + state.lightboxImages.length) % state.lightboxImages.length;
    els.lightboxImg.src = state.lightboxImages[state.lightboxIndex];
  }

  /* =================================================================
     6. Search toggle
     ================================================================= */
  function toggleSearch() {
    if (els.searchBar.hidden) {
      els.searchBar.hidden = false;
      els.searchInput.focus();
    } else {
      closeSearch();
    }
  }
  function closeSearch() {
    els.searchBar.hidden = true;
    els.searchInput.value = '';
    state.query = '';
    renderMotifGrid();
  }

  /* =================================================================
     7. UI states (loading / error / empty)
     ================================================================= */
  function showLoading(on) { els.stateLoading.hidden = !on; }
  function hideAllStates() {
    els.stateLoading.hidden = true;
    els.stateError.hidden   = true;
    els.stateEmpty.hidden   = true;
  }
  function showStateError(msg) {
    if (msg) els.stateErrorMsg.textContent = msg;
    els.stateError.hidden = false;
  }

  /* =================================================================
     8. Toast
     ================================================================= */
  var toastTimer = null;
  function showToast(text) {
    if (!els.toast) return;
    els.toast.textContent = text;
    els.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.hidden = true; }, 2400);
  }

  /* =================================================================
     9. Helpers
     ================================================================= */
  function indexBy(arr, key) {
    var map = {};
    (arr || []).forEach(function (x) { if (x && x[key]) map[x[key]] = x; });
    return map;
  }
  function findById(arr, id) {
    if (!arr || !id) return null;
    for (var i = 0; i < arr.length; i++) if (arr[i] && arr[i].id === id) return arr[i];
    return null;
  }
  function firstId(val) {
    if (!val) return '';
    return Array.isArray(val) ? (val[0] || '') : val;
  }
  function groupBy(arr, keyFn) {
    var out = {};
    (arr || []).forEach(function (x) {
      var k = keyFn(x);
      if (!k) return;
      (out[k] = out[k] || []).push(x);
    });
    return out;
  }
  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function escAttr(s) { return escHtml(s); }
  function formatRupiah(n) {
    if (typeof n !== 'number') return '';
    try {
      return 'Rp ' + n.toLocaleString('id-ID');
    } catch (e) { return 'Rp ' + String(n); }
  }
  function formatWaLink(num, msg) {
    if (!num) return '#';
    var n = String(num).replace(/[^0-9]/g, '');
    if (!n) return '#';
    var url = 'https://wa.me/' + n;
    if (msg) url += '?text=' + encodeURIComponent(msg);
    return url;
  }
  function formatWaMessage(produk, role, nama) {
    var tpl = (CFG && CFG.waFallbackMessage) || 'Halo, saya tertarik dengan motif {nama}.';
    return tpl
      .replace('{nama}', produk.nama || '')
      .replace('{role}', role || '')
      .replace('{kontak}', nama || '');
  }
})();
