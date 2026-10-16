# Fauzia.IoT Portfolio

Portofolio statis responsif untuk Muhammad Fauzia. Tidak memerlukan proses build atau instalasi dependensi.

## Menjalankan secara lokal

Buka `index.html` di browser atau jalankan server statis lokal. Font dan grafik sensor memakai layanan CDN; konten utama tetap dapat dibaca tanpa layanan eksternal.

## Konten dan personalisasi

- Gambar profil saat ini adalah placeholder ilustratif, bukan foto asli. Ganti `assets/profile-illustration.svg` dengan foto yang telah disiapkan, lalu sesuaikan teks alternatif dan keterangan di `index.html`.
- Galeri menyediakan 8 ilustrasi per kategori. Ilustrasi, catatan, dan unduhan SVG HD bergaya vintage dibuat oleh `script.js`; semuanya ditandai sebagai ilustrasi, bukan dokumentasi foto nyata.
- Untuk menambahkan foto dokumentasi asli, perbarui sumber aset dan keterangan kategori di `script.js` dan `index.html`.
- Tambahkan file CV dengan nama `CV Muhammad Fauzia IPB University.pdf` agar tombol unduhan CV berfungsi.
- Perbarui tautan media sosial dan informasi kontak di `index.html` bila diperlukan.
- Set `CONFIG.githubUsername` di `script.js` untuk mengubah profil GitHub yang digunakan pada daftar repository publik.

## IoT Lab

Mode demo diberi label simulasi. Dashboard hanya menampilkan suhu dan kelembapan.

Untuk menghubungkan perangkat nyata, set `CONFIG.sensorEndpoint` di `script.js` ke endpoint JSON publik ber-HTTPS yang mendukung CORS dan mengembalikan:

```json
{
  "temperature": 27.4,
  "humidity": 58,
  "timestamp": "2026-01-30T12:00:00.000Z"
}
```

`timestamp` dapat diganti dengan `heartbeat`. Pembacaan yang kedaluwarsa atau di luar rentang valid tidak akan ditampilkan. Jangan masukkan kata sandi, token privat, atau rahasia ke kode frontend.

## Deploy GitHub Pages

Workflow `.github/workflows/pages.yml` akan mengunggah situs ke GitHub Pages setiap kali ada push ke branch `main`. Aktifkan **Settings → Pages → Build and deployment → Source: GitHub Actions** pada repository bila belum diaktifkan. URL publik muncul di ringkasan workflow setelah deployment berhasil.

Repository tujuan: <https://github.com/fauziamuhammad-oji/portofoliozee>
