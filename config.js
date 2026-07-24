/* =====================================================================
   MotifKain — Config publik
   Sumber tunggal untuk URL backend PocketBase dan nama koleksi.
   Diedit sebelum deploy (atau override via window.MOTIFKAIN_CONFIG).
   ===================================================================== */
(function (global) {
  'use strict';

  var config = {
    /* Backend PocketBase (Railway production).
       Ganti ke http://127.0.0.1:8090 untuk development lokal. */
    pocketbaseUrl: 'https://katalog-production-104e.up.railway.app',

    /* Hierarki 6 koleksi */
    collections: {
      layanan:     'layanan',
      kategori:    'kategori',
      subkategori: 'subkategori',
      produk:      'produk',
      warna:       'warna',
      gambar:      'gambar'
    },

    /* Pendukung */
    extras: {
      portofolio: 'portofolio',
      kontak:     'kontak'
    },

    /* Daftar koleksi yang di-fetch publik (read-only).
       Bisa ditambah/dikurangi tanpa ubah kode app.js. */
    fetchList: ['layanan', 'kategori', 'subkategori', 'produk', 'warna', 'gambar', 'kontak'],

    /* Pagination default */
    perPage: 500,

    /* Gambar placeholder saat PocketBase kosong atau gagal.
       Pakai SVG inline batik-style agar tidak bergantung pada CDN. */
    placeholderSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
      '<defs>' +
        '<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" stop-color="#5D4037"/>' +
          '<stop offset="100%" stop-color="#A47148"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<rect width="200" height="200" fill="url(#g)"/>' +
      '<g fill="none" stroke="#C9A961" stroke-width="0.8" opacity="0.55">' +
        '<circle cx="100" cy="100" r="55"/>' +
        '<circle cx="100" cy="100" r="35"/>' +
        '<circle cx="100" cy="100" r="15"/>' +
        '<path d="M100 45 L100 155 M45 100 L155 100"/>' +
      '</g>' +
      '<text x="100" y="195" text-anchor="middle" fill="#FAF7F2" ' +
        'font-family="Cormorant Garamond, serif" font-size="11" font-style="italic">MotifKain</text>' +
    '</svg>',

    /* Sample fallback (digunakan bila PocketBase tidak reachable dan koleksi kosong).
       Memperlihatkan hierarki penuh sehingga UI tetap bisa dievaluasi. */
    sample: {
      layanan: [
        { id: 'sample-l-1', nama: 'Jasa Desain', order: 1 },
        { id: 'sample-l-2', nama: 'Kain Printing', order: 2 },
        { id: 'sample-l-3', nama: 'Pakaian Jadi', order: 3 },
        { id: 'sample-l-4', nama: 'Asesoris', order: 4 }
      ],
      kategori: [
        { id: 'sample-k-1', nama: 'Batik', layanan: 'sample-l-1', order: 1 },
        { id: 'sample-k-2', nama: 'Tenun', layanan: 'sample-l-2', order: 2 },
        { id: 'sample-k-3', nama: 'Songket', layanan: 'sample-l-2', order: 3 },
        { id: 'sample-k-4', nama: 'Sasirangan', layanan: 'sample-l-2', order: 4 }
      ],
      subkategori: [
        { id: 'sample-s-1', nama: 'Motif Klasik',  kategori: 'sample-k-1', order: 1 },
        { id: 'sample-s-2', nama: 'Motif Bunga',   kategori: 'sample-k-1', order: 2 },
        { id: 'sample-s-3', nama: 'Motif Geometris', kategori: 'sample-k-2', order: 1 },
        { id: 'sample-s-4', nama: 'Kain Polos',    kategori: 'sample-k-2', order: 2 }
      ],
      produk: [
        { id: 'sample-p-1', nama: 'Parang Klasik',       subkategori: 'sample-s-1', harga: 150000, deskripsi: 'Motif parang adalah salah satu motif batik paling tua dan sakral, penuh filosofi tentang kesinambungan hidup.' },
        { id: 'sample-p-2', nama: 'Mega Mendung',       subkategori: 'sample-s-1', harga: 175000, deskripsi: 'Motif awan dan hujan dari Cirebon — simbol ketenangan dan kesuburan.' },
        { id: 'sample-p-3', nama: 'Truntum',            subkategori: 'sample-s-2', harga: 165000, deskripsi: 'Motif bunga kecil-kecil yang tidak pernah layu — simbol cinta abadi.' },
        { id: 'sample-p-4', nama: 'Lurik Tenun',        subkategori: 'sample-s-3', harga: 125000, deskripsi: 'Tenun lurik khas Yogyakarta dengan garis-garis yang menenangkan.' },
        { id: 'sample-p-5', nama: 'Songket Palembang',  subkategori: 'sample-s-4', harga: 450000, deskripsi: 'Songket dengan benang emas yang ditenun tangan oleh perajin Palembang.' },
        { id: 'sample-p-6', nama: 'Sasirangan Banjarmasing', subkategori: 'sample-s-4', harga: 185000, deskripsi: 'Kain sasirangan khas Kalimantan Selatan dengan pewarna alami.' }
      ],
      warna: [
        { id: 'sample-w-1', nama: 'Soga Klasik',  produk: 'sample-p-1' },
        { id: 'sample-w-2', nama: 'Indigo Tua',   produk: 'sample-p-1' },
        { id: 'sample-w-3', nama: 'Biru Laut',    produk: 'sample-p-2' },
        { id: 'sample-w-4', nama: 'Hijau Tua',    produk: 'sample-p-2' },
        { id: 'sample-w-5', nama: 'Merah Maroon', produk: 'sample-p-3' },
        { id: 'sample-w-6', nama: 'Cokelat Tua',  produk: 'sample-p-4' },
        { id: 'sample-w-7', nama: 'Emas Antik',   produk: 'sample-p-5' },
        { id: 'sample-w-8', nama: 'Hijau Daun',   produk: 'sample-p-6' }
      ],
      gambar: [],
      kontak: []
    },

    /* Pesan WA default (saat kontak belum tersedia) */
    waFallbackMessage: 'Halo, saya tertarik dengan motif {nama} dari katalog MotifKain.'
  };

  global.MOTIFKAIN_CONFIG = config;
})(window);
