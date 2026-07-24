/* =====================================================================
   MotifKain — PocketBase Migration Script (v0.22+)
   ---------------------------------------------------------------------
   Cara pakai (PocketBase Admin UI):

   1. Buka https://<PB_URL>/_/  (admin UI)
   2. Login sebagai admin.
   3. Buka menu "Settings" → "JS Hooks" (atau "Collections" → klik ikon </> di
      pojok kanan atas jika versi Anda lebih lama). Atau gunakan PB Admin
      "Settings" → "Backups" untuk import JSON.
   4. Klik "+ New hook" → pilih event "onBootstrap" atau gunakan console
      browser di DevTools (lihat cara B di bawah).

   CARA A — via DevTools console (PALING SEDERHANA):

     a. Buka https://<PB_URL>/_/ lalu login.
     b. Buka DevTools (F12) → Console.
     c. Paste SELURUH isi file ini, lalu enter. Akan muncul progress
        "creating collection: X" satu per satu. Tunggu sampai "DONE".
     d. Refresh halaman admin UI. Semua koleksi akan muncul.

   CARA B — via curl (jika Anda lebih suka terminal):

     $ curl -X POST http://127.0.0.1:8090/api/admins/auth-with-password \
         -H 'Content-Type: application/json' \
         -d '{"identity":"<admin-email>","password":"<admin-password>"}'
     # Simpan token dari response.

   CATATAN:
   - Script ini idempotent: koleksi yang sudah ada akan dilewati (tidak
     dibuat ulang). Aman dijalankan berulang.
   - Setelah koleksi dibuat, Anda tinggal login admin UI dan isi data
     (produk, warna, gambar). Frontend publik akan otomatis render.
   - API rules sudah diatur: publik bisa read, hanya admin (login) yang
     bisa create/update/delete.
   ===================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Endpoint & token — ambil dari argumen atau dari window.location
     ------------------------------------------------------------------ */
  var PB_URL = (typeof window !== 'undefined' && window.PB_URL) ||
               'https://katalog-production-104e.up.railway.app';
  var ADMIN_TOKEN = (typeof window !== 'undefined' && window.PB_ADMIN_TOKEN) || '';

  /* ------------------------------------------------------------------
     Definisi 8 koleksi (6 hierarki + 2 pendukung)
     ------------------------------------------------------------------ */
  var COLLECTIONS = [
    {
      name: 'layanan',
      schema: [
        { name: 'nama',  type: 'text',   required: true, options: { min: 1, max: 100 } },
        { name: 'order', type: 'number', required: false, options: { min: 0 } }
      ],
      listRule:   '',
      viewRule:   '',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""'
    },
    {
      name: 'kategori',
      schema: [
        { name: 'nama',    type: 'text',   required: true, options: { min: 1, max: 100 } },
        { name: 'layanan', type: 'relation', required: true, options: {
            collectionId: '__layanan__', cascadeDelete: false, minSelect: 1, maxSelect: 1
        }},
        { name: 'order',   type: 'number', required: false, options: { min: 0 } }
      ]
    },
    {
      name: 'subkategori',
      schema: [
        { name: 'nama',     type: 'text',   required: true, options: { min: 1, max: 100 } },
        { name: 'kategori', type: 'relation', required: true, options: {
            collectionId: '__kategori__', cascadeDelete: false, minSelect: 1, maxSelect: 1
        }},
        { name: 'order',    type: 'number', required: false, options: { min: 0 } }
      ]
    },
    {
      name: 'produk',
      schema: [
        { name: 'nama',        type: 'text',   required: true, options: { min: 1, max: 200 } },
        { name: 'subkategori', type: 'relation', required: true, options: {
            collectionId: '__subkategori__', cascadeDelete: false, minSelect: 1, maxSelect: 1
        }},
        { name: 'harga',       type: 'number', required: false, options: { min: 0 } },
        { name: 'deskripsi',   type: 'text',   required: false, options: { max: 5000 } }
      ]
    },
    {
      name: 'warna',
      schema: [
        { name: 'nama',   type: 'text',   required: true, options: { min: 1, max: 100 } },
        { name: 'produk', type: 'relation', required: true, options: {
            collectionId: '__produk__', cascadeDelete: false, minSelect: 1, maxSelect: null
        }}
      ]
    },
    {
      name: 'gambar',
      schema: [
        { name: 'gambar',    type: 'file', required: true, options: {
            maxSelect: 1, maxSize: 10485760, mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        }},
        { name: 'deskripsi', type: 'text', required: false, options: { max: 500 } },
        { name: 'warna',     type: 'relation', required: true, options: {
            collectionId: '__warna__', cascadeDelete: false, minSelect: 1, maxSelect: null
        }}
      ]
    },
    {
      name: 'portofolio',
      schema: [
        { name: 'judul',     type: 'text', required: true, options: { min: 1, max: 200 } },
        { name: 'kategori',  type: 'text', required: false, options: { max: 100 } },
        { name: 'deskripsi', type: 'text', required: false, options: { max: 5000 } },
        { name: 'image',     type: 'file', required: false, options: {
            maxSelect: 1, maxSize: 10485760, mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        }},
        { name: 'images',    type: 'file', required: false, options: {
            maxSelect: 10, maxSize: 10485760, mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        }}
      ]
    },
    {
      name: 'kontak',
      schema: [
        { name: 'nama',     type: 'text', required: true, options: { min: 1, max: 100 } },
        { name: 'role',     type: 'select', required: true, options: {
            maxSelect: 1, values: ['desainer', 'pemasaran']
        }},
        { name: 'whatsapp', type: 'text', required: true, options: { min: 8, max: 20, pattern: '^[0-9]+$' } }
      ]
    }
  ];

  /* Default API rules — public read, admin-only write */
  var DEFAULT_RULES = {
    listRule:   '',
    viewRule:   '',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""'
  };

  /* ------------------------------------------------------------------
     HTTP helpers
     ------------------------------------------------------------------ */
  function http(method, path, body) {
    var opts = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': ADMIN_TOKEN ? ADMIN_TOKEN : (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('pb_admin_token')) || ''
      }
    };
    if (ADMIN_TOKEN === '' && typeof window !== 'undefined' && window.localStorage) {
      var t = window.localStorage.getItem('pb_admin_token');
      if (t) opts.headers['Authorization'] = t;
    }
    if (body !== undefined) opts.body = JSON.stringify(body);
    return fetch(PB_URL.replace(/\/+$/, '') + path, opts).then(function (r) {
      return r.json().then(function (j) { return { ok: r.ok, status: r.status, body: j }; });
    });
  }

  /* ------------------------------------------------------------------
     Main runner
     ------------------------------------------------------------------ */
  function log(msg, ok) {
    var prefix = ok === true ? '[OK]   ' : ok === false ? '[FAIL] ' : '[...]  ';
    console.log(prefix + msg);
  }

  function run() {
    log('PocketBase migration dimulai... target: ' + PB_URL, undefined);

    /* Step 1: ambil koleksi yang sudah ada */
    return http('GET', '/api/collections?perPage=200').then(function (r) {
      if (!r.ok) {
        log('Tidak bisa mengambil koleksi. Apakah Anda sudah login admin? Buka DevTools di ' + PB_URL + '/_/ lalu paste ulang script ini.', false);
        return;
      }
      var existing = (r.body && r.body.items) || [];
      var byName = {};
      existing.forEach(function (c) { byName[c.name] = c; });
      log('Ditemukan ' + existing.length + ' koleksi existing.', true);

      /* Step 2: buat koleksi yang belum ada, urut sesuai COLLECTIONS (hierarki dulu) */
      var createdIds = {};
      var promises = COLLECTIONS.map(function (def) {
        if (byName[def.name]) {
          log('SKIP — koleksi "' + def.name + '" sudah ada (id: ' + byName[def.name].id + ').', true);
          createdIds[def.name] = byName[def.name].id;
          return Promise.resolve();
        }

        /* Resolve relasi target ke collection id */
        var schema = JSON.parse(JSON.stringify(def.schema));
        schema.forEach(function (field) {
          if (field.type === 'relation') {
            var target = field.options.collectionId.replace(/^__|__$/g, '');
            if (createdIds[target]) {
              field.options.collectionId = createdIds[target];
            } else if (byName[target]) {
              field.options.collectionId = byName[target].id;
            } else {
              log('Target koleksi "' + target + '" belum ada — skip relasi pada field "' + field.name + '" di "' + def.name + '". Mungkin perlu dibuat manual.', false);
            }
          }
        });

        var payload = {
          name: def.name,
          type: 'base',
          schema: schema,
          listRule:   def.listRule   !== undefined ? def.listRule   : DEFAULT_RULES.listRule,
          viewRule:   def.viewRule   !== undefined ? def.viewRule   : DEFAULT_RULES.viewRule,
          createRule: def.createRule !== undefined ? def.createRule : DEFAULT_RULES.createRule,
          updateRule: def.updateRule !== undefined ? def.updateRule : DEFAULT_RULES.updateRule,
          deleteRule: def.deleteRule !== undefined ? def.deleteRule : DEFAULT_RULES.deleteRule,
          indexes: [],
          system: false
        };

        log('Creating collection: ' + def.name + '...', undefined);
        return http('POST', '/api/collections', payload).then(function (resp) {
          if (resp.ok && resp.body && resp.body.id) {
            createdIds[def.name] = resp.body.id;
            log('Created "' + def.name + '" (id: ' + resp.body.id + ').', true);
          } else {
            log('Gagal membuat "' + def.name + '": ' + JSON.stringify(resp.body), false);
          }
        });
      });

      return Promise.all(promises).then(function () {
        log('============================================================', true);
        log('DONE. Refresh halaman admin UI PocketBase untuk melihat koleksi baru.', true);
        log('Jika ada field relasi yang "skip", buat koleksi target dulu secara manual lalu tambahkan field-nya.', true);
        log('============================================================', true);
      });
    });
  }

  /* ------------------------------------------------------------------
     Entry
     ------------------------------------------------------------------ */
  if (typeof window !== 'undefined') {
    /* Browser: jalankan otomatis */
    if (!ADMIN_TOKEN) {
      /* Coba ambil token dari cookie/localStorage PB Admin */
      try {
        var m = document.cookie.match(/(?:^|;\s*)pb_admin_token=([^;]+)/);
        if (m) ADMIN_TOKEN = decodeURIComponent(m[1]);
      } catch (e) {}
    }
    window.motifkainMigration = { run: run, COLLECTIONS: COLLECTIONS };
    run();
  } else if (typeof module !== 'undefined') {
    module.exports = { COLLECTIONS: COLLECTIONS, run: run };
  }
})();
