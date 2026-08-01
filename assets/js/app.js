/* =====================================================================
   MotifKain — Katalog Publik (vanilla JS, no build)
   Alur:
     1. Boot → load hierarki 6 koleksi PocketBase (parallel)
     2. Bangun tree: layanan → kategori → subkategori → produk → warna → gambar
     3. Render: search, filter chips, produk grid, kontak, footer year
     4. Interaksi: search, filter, modal detail, lightbox zoom
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
    layanan: [], kategori: [], subkategori: [], produk: [],
    warna: [], gambar: [], kontak: [],
    tree: { layanan: [] },
    activeLayanan: 'all',
    query: '',
    lightboxImages: [],
    lightboxCaptions: [],
    lightboxIndex: 0,
    currentProdukId: null,
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
      renderFilters();
      renderGrid();
      renderKontak();
      showLoading(false);
    }).catch(function (err) {
      console.warn('[MotifKain] PocketBase unreachable, using sample fallback:', err && err.message);
      useSampleFallback();
      buildTree();
      renderFilters();
      renderGrid();
      renderKontak();
      showLoading(false);
    });
  });

  /* =================================================================
     2. Cache DOM elements
     ================================================================= */
  function cacheElements() {
    els.grid         = document.getElementById('motifGrid');
    els.filterBar    = document.getElementById('filterBar');
    els.searchInput  = document.getElementById('searchInput');
    els.searchInputBig = document.getElementById('searchInputBig');
    els.resultCount  = document.getElementById('resultCount');
    els.stateLoading = document.getElementById('stateLoading');
    els.stateEmpty   = document.getElementById('stateEmpty');
    els.stateError   = document.getElementById('stateError');
    els.stateErrorMsg = document.getElementById('stateErrorMsg');
    els.stateRetry   = document.getElementById('stateRetry');
    els.modal        = document.getElementById('modalDetail');
    els.detailGallery = document.getElementById('detailGallery');
    els.detailCrumb  = document.getElementById('detailCrumb');
    els.detailTitle  = document.getElementById('modalDetailTitle');
    els.detailMeta   = document.getElementById('detailMeta');
    els.detailPrice  = document.getElementById('detailPrice');
    els.detailDesc   = document.getElementById('detailDesc');
    els.detailWarna  = document.getElementById('detailWarna');
    els.warnaList    = document.getElementById('warnaList');
    els.detailActions = document.getElementById('detailActions');
    els.btnWaDesainer  = document.getElementById('btnWaDesainer');
    els.btnWaPemasaran = document.getElementById('btnWaPemasaran');
    els.lightbox     = document.getElementById('lightbox');
    els.lightboxImg  = document.getElementById('lightboxImg');
    els.lightboxCaption = document.getElementById('lightboxCaption');
    els.lightboxCounter = document.getElementById('lightboxCounter');
    els.toast        = document.getElementById('toast');
    els.adminLink    = document.getElementById('headerAdmin');
  }

  /* =================================================================
     3. Bind events
     ================================================================= */
  function bindEvents() {
    /* Sync both search inputs */
    function handleSearch(e) {
      state.query = (e.target.value || '').trim().toLowerCase();
      if (els.searchInputBig) els.searchInputBig.value = state.query;
      if (els.searchInput) els.searchInput.value = state.query;
      renderGrid();
    }
    if (els.searchInput) els.searchInput.addEventListener('input', handleSearch);
    if (els.searchInputBig) els.searchInputBig.addEventListener('input', handleSearch);

    /* Modal close */
    if (els.modal) {
      els.modal.addEventListener('click', function (e) {
        if (e.target.hasAttribute('data-close')) closeModal();
      });
    }

    /* Keyboard */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (els.lightbox && !els.lightbox.hidden) closeLightbox();
        else if (els.modal && !els.modal.hidden) closeModal();
      }
      if (els.lightbox && !els.lightbox.hidden) {
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
      }
    });

    /* Lightbox */
    if (els.lightbox) {
      var closeBtn = els.lightbox.querySelector('.lightbox-close');
      var prevBtn  = els.lightbox.querySelector('.lightbox-prev');
      var nextBtn  = els.lightbox.querySelector('.lightbox-next');
      if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
      if (prevBtn)  prevBtn.addEventListener('click', function () { navigateLightbox(-1); });
      if (nextBtn)  nextBtn.addEventListener('click', function () { navigateLightbox(1); });
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
          buildTree(); renderFilters(); renderGrid(); renderKontak();
          showLoading(false);
        }).catch(function () {
          showLoading(false);
          showError('Tidak dapat terhubung ke server.');
        });
      });
    }

    /* Admin link */
    if (els.adminLink) els.adminLink.hidden = false;
  }

  /* =================================================================
     4. PocketBase fetch
     ================================================================= */
  function pbFetch(path) {
    return fetch(pbUrl + path, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function fetchCollection(name) {
    var path = '/api/collections/' + encodeURIComponent(name) + '/records?perPage=' + perPage + '&sort=order,nama,created';
    return pbFetch(path).then(function (j) { return j.items || []; });
  }

  function loadAllData() {
    var lists = CFG.fetchList || ['layanan','kategori','subkategori','produk','warna','gambar','kontak'];
    var promises = lists.map(function (name) {
      return fetchCollection(name).then(function (items) { return { name: name, items: items }; });
    });
    return Promise.all(promises).then(function (results) {
      results.forEach(function (r) {
        if (state.hasOwnProperty(r.name)) state[r.name] = r.items;
      });
      var total = results.reduce(function (sum, r) { return sum + r.items.length; }, 0);
      if (total === 0 && CFG.sample) useSampleFallback();
    });
  }

  function useSampleFallback() {
    var s = CFG.sample || {};
    state.layanan     = s.layanan     || [];
    state.kategori   = s.kategori   || [];
    state.subkategori = s.subkategori || [];
    state.produk     = s.produk     || [];
    state.warna      = s.warna      || [];
    state.gambar     = s.gambar     || [];
    state.kontak     = s.kontak     || [];
  }

  /* =================================================================
     5. Build tree
     ================================================================= */
  function buildTree() {
    /* Index by id */
    var idx = {
      layanan:    indexBy(state.layanan, 'id'),
      kategori:   indexBy(state.kategori, 'id'),
      subkategori: indexBy(state.subkategori, 'id'),
      produk:     indexBy(state.produk, 'id'),
    };

    /* Gambar → warna ids */
    state.gambar.forEach(function (g) {
      var ids = Array.isArray(g.warna) ? g.warna : (g.warna ? [g.warna] : []);
      g._warnaIds = ids;
      g._url = buildFileUrl(CFG.collections.gambar, g.id, g.gambar);
    });

    /* Warna → produk */
    var warnaByProduk = {};
    state.warna.forEach(function (w) {
      var pIds = Array.isArray(w.produk) ? w.produk : (w.produk ? [w.produk] : []);
      w._produkIds = pIds;
      (warnaByProduk[w.produk] = warnaByProduk[w.produk] || []).push(w);
      w._images = state.gambar.filter(function (g) { return g._warnaIds.indexOf(w.id) !== -1; });
    });

    /* Produk → warna + thumbnail */
    state.produk.forEach(function (p) {
      p._warnaList = warnaByProduk[p.id] || [];
      var firstImg = null;
      for (var i = 0; i < p._warnaList.length; i++) {
        if (p._warnaList[i]._images.length) {
          firstImg = p._warnaList[i]._images[0];
          break;
        }
      }
      p._thumb = firstImg ? firstImg._url : fileUrlToDataUri(CFG.placeholderSvg);
      p._totalImages = p._warnaList.reduce(function (a, w) { return a + w._images.length; }, 0);
    });

    /* Subkategori → produkList */
    var produkBySub = groupBy(state.produk, function (p) {
      return firstId(p.subkategori);
    });
    state.subkategori.forEach(function (s) { s._produkList = produkBySub[s.id] || []; });

    /* Kategori → subkategoriList */
    var subByKat = groupBy(state.subkategori, function (s) { return firstId(s.kategori); });
    state.kategori.forEach(function (k) { k._subkategoriList = subByKat[k.id] || []; });

    /* Layanan → kategoriList */
    var katByLayanan = groupBy(state.kategori, function (k) { return firstId(k.layanan); });
    state.layanan.forEach(function (l) { l._kategoriList = katByLayanan[l.id] || []; });

    state.tree.layanan = state.layanan.slice().sort(function (a, b) {
      return (a.order || 999) - (b.order || 999);
    });
  }

  /* =================================================================
     6. Render
     ================================================================= */
  function renderFilters() {
    var totalProduk = state.produk.length;
    var html = '<button class="chip chip-active" data-filter="all" role="tab" aria-selected="true">Semua</button>';
    state.layanan.forEach(function (l) {
      var count = l._kategoriList.reduce(function (acc, k) {
        return acc + k._subkategoriList.reduce(function (acc2, s) { return acc2 + s._produkList.length; }, 0);
      }, 0);
      html += '<button class="chip" data-filter="' + escAttr(l.id) + '" role="tab" aria-selected="false">' +
              escHtml(l.nama) + '</button>';
    });
    els.filterBar.innerHTML = html;

    Array.prototype.forEach.call(els.filterBar.querySelectorAll('.chip'), function (chip) {
      chip.addEventListener('click', function () {
        Array.prototype.forEach.call(els.filterBar.querySelectorAll('.chip'), function (c) {
          c.classList.remove('chip-active');
          c.setAttribute('aria-selected', 'false');
        });
        chip.classList.add('chip-active');
        chip.setAttribute('aria-selected', 'true');
        state.activeLayanan = chip.getAttribute('data-filter');
        renderGrid();
      });
    });
  }

  function renderGrid() {
    var list = filteredProduk();
    var total = list.length;

    /* Update result count */
    if (els.resultCount) {
      if (state.query || state.activeLayanan !== 'all') {
        els.resultCount.textContent = total + ' motif ditemukan';
        els.resultCount.classList.add('visible');
      } else {
        els.resultCount.classList.remove('visible');
      }
    }

    /* States */
    if (state.query || els.stateEmpty.hidden === false) {
      // keep showing
    }

    if (total === 0) {
      els.grid.innerHTML = '';
      els.stateEmpty.hidden = false;
      els.stateError.hidden = true;
      return;
    }
    els.stateEmpty.hidden = true;

    var html = '';
    list.forEach(function (p) {
      html += buildCardHTML(p);
    });
    els.grid.innerHTML = html;

    /* Bind card clicks */
    Array.prototype.forEach.call(els.grid.querySelectorAll('.produk-card'), function (card) {
      card.addEventListener('click', function () {
        openDetail(card.getAttribute('data-id'));
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(card.getAttribute('data-id')); }
      });
    });
  }

  function buildCardHTML(p) {
    var sub = findById(state.subkategori, firstId(p.subkategori));
    var kat = sub ? findById(state.kategori, firstId(sub.kategori)) : null;
    var lay = kat ? findById(state.layanan, firstId(kat.layanan)) : null;
    var thumb = p._thumb || '';
    var imgCount = p._totalImages || 0;
    var harga = typeof p.harga === 'number' && p.harga > 0 ? formatRupiah(p.harga) : '';

    var imgHtml;
    if (thumb) {
      imgHtml = '<img src="' + escAttr(thumb) + '" alt="' + escAttr(p.nama) + '" class="card-img" loading="lazy">';
    } else {
      imgHtml = '<div class="card-img-placeholder">' +
        '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>' +
        '<span>Tidak ada gambar</span></div>';
    }

    var badgeHtml = '';
    if (imgCount > 1) {
      badgeHtml = '<div class="card-img-badge">' +
        '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h.01M15 9h.01"/></svg>' +
        imgCount + ' foto' +
        '</div>';
    }

    var layananBadge = lay ? '<div class="card-layanan">' +
      '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>' +
      escHtml(lay.nama) + '</div>' : '';

    return '<article class="produk-card" data-id="' + escAttr(p.id) + '" tabindex="0" role="button" aria-label="Lihat detail ' + escAttr(p.nama) + '">' +
      '<div class="card-img-wrap">' + imgHtml + badgeHtml + '</div>' +
      '<div class="card-info">' +
        '<div class="card-nama">' + escHtml(p.nama) + '</div>' +
        (harga ? '<div class="card-harga">' + harga + '</div>' : '') +
        layananBadge +
      '</div>' +
    '</article>';
  }

  function renderKontak() {
    var el = document.getElementById('kontakList');
    if (!el || !state.kontak.length) return;
    var html = '';
    state.kontak.forEach(function (k) {
      var initials = (k.nama || '').split(' ').map(function (s) { return s[0] || ''; }).join('').slice(0, 2).toUpperCase();
      var waLink = formatWaLink(k.whatsapp);
      html += '<a class="kontak-card" href="' + escAttr(waLink) + '" target="_blank" rel="noopener">' +
        '<div class="kontak-avatar">' + escHtml(initials) + '</div>' +
        '<div>' +
          '<div class="kontak-name">' + escHtml(k.nama) + '</div>' +
          '<div class="kontak-role">' + escHtml(k.role || '') + '</div>' +
          '<div class="kontak-wa">' +
            '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
            escHtml(k.whatsapp || '') + '</div>' +
        '</div>' +
      '</a>';
    });
    el.innerHTML = html;
  }

  /* =================================================================
     7. Detail modal
     ================================================================= */
  function openDetail(produkId) {
    var p = findById(state.produk, produkId);
    if (!p) return;
    state.currentProdukId = produkId;

    var sub = findById(state.subkategori, firstId(p.subkategori));
    var kat = sub ? findById(state.kategori, firstId(sub.kategori)) : null;
    var lay = kat ? findById(state.layanan, firstId(kat.layanan)) : null;

    var crumb = [lay, kat, sub].filter(Boolean).map(function (x) { return x.nama; }).join(' · ');
    els.detailCrumb.textContent  = crumb;
    els.detailTitle.textContent  = p.nama || '';
    els.detailMeta.textContent  = sub ? sub.nama : '';

    if (typeof p.harga === 'number' && p.harga > 0) {
      els.detailPrice.hidden = false;
      els.detailPrice.textContent = formatRupiah(p.harga);
    } else {
      els.detailPrice.hidden = true;
    }
    els.detailDesc.textContent = p.deskripsi || 'Belum ada deskripsi.';

    /* Gallery */
    var allImages = [];
    var allCaptions = [];
    p._warnaList.forEach(function (w) {
      w._images.forEach(function (g) {
        allImages.push(g._url || fileUrlToDataUri(CFG.placeholderSvg));
        allCaptions.push(g.deskripsi || w.nama);
      });
    });
    if (!allImages.length) {
      allImages.push(fileUrlToDataUri(CFG.placeholderSvg));
      allCaptions.push(p.nama);
    }
    state.lightboxImages = allImages;
    state.lightboxCaptions = allCaptions;
    state.lightboxIndex = 0;

    renderDetailGallery(allImages, allCaptions);

    /* Warna chips */
    if (p._warnaList.length) {
      els.detailWarna.hidden = false;
      els.warnaList.innerHTML = p._warnaList.map(function (w, i) {
        return '<span class="warna-chip' + (i === 0 ? ' warna-chip-active' : '') + '" data-warna-id="' + escAttr(w.id) + '">' +
               escHtml(w.nama) + ' (' + w._images.length + ')</span>';
      }).join('');
      Array.prototype.forEach.call(els.warnaList.querySelectorAll('.warna-chip'), function (chip) {
        chip.addEventListener('click', function () {
          var wid = chip.getAttribute('data-warna-id');
          var w = findById(state.warna, wid);
          if (!w || !w._images.length) return;
          var imgs = w._images.map(function (g) { return g._url || fileUrlToDataUri(CFG.placeholderSvg); });
          var caps = w._images.map(function (g) { return g.deskripsi || w.nama; });
          state.lightboxImages = imgs;
          state.lightboxCaptions = caps;
          state.lightboxIndex = 0;
          renderDetailGallery(imgs, caps);
          Array.prototype.forEach.call(els.warnaList.querySelectorAll('.warna-chip'), function (c) { c.classList.remove('warna-chip-active'); });
          chip.classList.add('warna-chip-active');
        });
      });
    } else {
      els.detailWarna.hidden = true;
    }

    /* WA buttons */
    var desainer  = state.kontak.find(function (k) { return (k.role || '').toLowerCase() === 'desainer'; });
    var pemasaran = state.kontak.find(function (k) { return (k.role || '').toLowerCase() === 'pemasaran'; });
    if (desainer || pemasaran) {
      els.detailActions.hidden = false;
      if (els.btnWaDesainer) {
        if (desainer) {
          els.btnWaDesainer.href = formatWaLink(desainer.whatsapp, 'Halo, saya tertarik dengan motif "' + (p.nama || '') + '".');
          els.btnWaDesainer.style.display = '';
        } else {
          els.btnWaDesainer.style.display = 'none';
        }
      }
      if (els.btnWaPemasaran) {
        if (pemasaran) {
          els.btnWaPemasaran.href = formatWaLink(pemasaran.whatsapp, 'Halo, saya ingin info tentang motif "' + (p.nama || '') + '".');
          els.btnWaPemasaran.style.display = '';
        } else {
          els.btnWaPemasaran.style.display = 'none';
        }
      }
    } else {
      els.detailActions.hidden = true;
    }

    document.body.style.overflow = 'hidden';
    els.modal.hidden = false;
    els.modal.scrollTop = 0;
  }

  function renderDetailGallery(images, captions) {
    var mainSrc = images[0] || fileUrlToDataUri(CFG.placeholderSvg);
    var html = '<img src="' + escAttr(mainSrc) + '" alt="" class="detail-main-img" id="detailMainImg" data-zoom="0">';
    if (images.length > 1) {
      html += '<div class="detail-thumbs">';
      images.forEach(function (src, i) {
        html += '<img src="' + escAttr(src) + '" alt="' + escAttr(captions[i] || '') + '" class="detail-thumb' + (i === 0 ? ' active' : '') + '" data-thumb-index="' + i + '">';
      });
      html += '</div>';
    }
    els.detailGallery.innerHTML = html;

    /* Thumb click */
    Array.prototype.forEach.call(els.detailGallery.querySelectorAll('.detail-thumb'), function (thumb) {
      thumb.addEventListener('click', function () {
        var i = parseInt(thumb.getAttribute('data-thumb-index'), 10) || 0;
        var main = document.getElementById('detailMainImg');
        if (main) { main.src = images[i] || images[0]; main.setAttribute('data-zoom', String(i)); }
        Array.prototype.forEach.call(els.detailGallery.querySelectorAll('.detail-thumb'), function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');
      });
    });

    /* Main img zoom */
    var mainImg = document.getElementById('detailMainImg');
    if (mainImg) mainImg.addEventListener('click', function () {
      var i = parseInt(mainImg.getAttribute('data-zoom') || '0', 10);
      openLightbox(images, i, captions);
    });
  }

  function closeModal() {
    els.modal.hidden = true;
    document.body.style.overflow = '';
  }

  /* =================================================================
     8. Lightbox
     ================================================================= */
  function openLightbox(images, index, captions) {
    if (!images || !images.length) return;
    state.lightboxImages  = images;
    state.lightboxCaptions = captions || [];
    state.lightboxIndex   = Math.max(0, Math.min(index || 0, images.length - 1));
    updateLightboxUI();
    els.lightbox.hidden = false;
  }

  function updateLightboxUI() {
    if (!els.lightbox) return;
    var src  = state.lightboxImages[state.lightboxIndex] || '';
    var cap  = state.lightboxCaptions[state.lightboxIndex] || '';
    var tot  = state.lightboxImages.length;
    if (els.lightboxImg)      els.lightboxImg.src = src;
    if (els.lightboxCaption)  els.lightboxCaption.textContent = cap;
    if (els.lightboxCounter)  els.lightboxCounter.textContent = (tot > 1) ? (state.lightboxIndex + 1) + ' / ' + tot : '';
  }

  function closeLightbox() {
    els.lightbox.hidden = true;
  }

  function navigateLightbox(delta) {
    if (!state.lightboxImages.length) return;
    state.lightboxIndex = (state.lightboxIndex + delta + state.lightboxImages.length) % state.lightboxImages.length;
    updateLightboxUI();
  }

  /* =================================================================
     9. UI states
     ================================================================= */
  function showLoading(on) {
    if (els.stateLoading) els.stateLoading.hidden = !on;
    if (on) { hideAllStates(); }
  }
  function hideAllStates() {
    if (els.stateLoading) els.stateLoading.hidden = true;
    if (els.stateEmpty)   els.stateEmpty.hidden = true;
    if (els.stateError)   els.stateError.hidden = true;
  }
  function showError(msg) {
    hideAllStates();
    if (els.stateError) {
      if (els.stateErrorMsg) els.stateErrorMsg.textContent = msg;
      els.stateError.hidden = false;
    }
  }

  /* =================================================================
     10. Toast
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
     11. Helpers
     ================================================================= */
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

  function buildFileUrl(collectionName, recordId, filename) {
    if (!filename) return null;
    var fname = Array.isArray(filename) ? filename[0] : filename;
    if (!fname) return null;
    if (/^(https?:|data:)/.test(fname)) return fname;
    if (!pbUrl) return null;
    return pbUrl + '/api/files/' + encodeURIComponent(collectionName) + '/' + encodeURIComponent(recordId) + '/' + encodeURIComponent(fname);
  }

  function fileUrlToDataUri(svgString) {
    if (!svgString) return '';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
  }

  function setFooterYear() {
    var el = document.getElementById('yearNow');
    if (el) el.textContent = String(new Date().getFullYear());
  }

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
    try { return 'Rp ' + n.toLocaleString('id-ID'); } catch (e) { return 'Rp ' + String(n); }
  }
  function formatWaLink(num, msg) {
    if (!num) return '#';
    var n = String(num).replace(/[^0-9]/g, '');
    if (!n) return '#';
    var url = 'https://wa.me/' + n;
    if (msg) url += '?text=' + encodeURIComponent(msg);
    return url;
  }
})();
