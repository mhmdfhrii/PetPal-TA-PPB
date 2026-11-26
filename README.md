# 🐾 PetPal - Platform Direktori & Adopsi Hewan Peliharaan

**PetPal** adalah aplikasi direktori dan adopsi hewan peliharaan berbasis *mobile* dan *web*. Aplikasi ini menghubungkan para pecinta hewan dengan shelter penampungan dan hewan-hewan yang membutuhkan rumah baru yang penuh kasih sayang.

---

## 📌 Daftar Isi
- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Folder](#-struktur-folder)
- [Skema & Relasi Database](#-skema--relasi-database)
- [Panduan Instalasi & Menjalankan Proyek](#-panduan-instalasi--menjalankan-proyek)
- [API Endpoints](#-api-endpoints)
- [Catatan Khusus Deployment](#-catatan-khusus-deployment)

---

## 🚀 Fitur Utama

### 👤 Pengguna (User)
1. **Autentikasi & Akun:**
   - Registrasi dan Login aman menggunakan Supabase Auth.
   - Manajemen Profil: ubah biodata (nama, no. telepon, alamat) dan unggah foto profil (tersinkronisasi otomatis antara Home dan Halaman Profil).
2. **Eksplorasi Hewan & Shelter:**
   - **Katalog Hewan:** Pencarian real-time berdasarkan nama atau ras, serta filter kategori (Dog, Cat, Rabbit, Bird).
   - **Filter & Sortir:** Modal pop-up filter terpadu untuk kategori hewan, filter lokasi shelter dinamis dari database, serta sortir nama shelter (A-Z / Z-A).
   - **Detail Hewan:** Menampilkan profil lengkap hewan, status ketersediaan (*Available/Adopted*), dan kartu shelter penampungannya.
   - **Direktori Shelter:** Menampilkan profil shelter, kontak, fasilitas, alamat, serta jumlah dan daftar hewan yang dirawat di shelter tersebut secara dinamis.
3. **Adopsi & Favorit:**
   - **Favorit (Wishlist):** Simpan hewan impian ke dalam daftar favorit.
   - **Formulir Pengajuan Adopsi:** Ajukan permohonan adopsi dengan menyertakan alasan dan komitmen.
   - **Riwayat Pengajuan:** Pantau status permohonan (*Menunggu/Pending*, *Diterima/Approved*, *Ditolak/Rejected*).
4. **Help & Support:**
   - Panduan lengkap adopsi, tata cara penggunaan, *Frequently Asked Questions* (FAQ) interaktif, dan kanal kontak resmi.

### 🛡️ Administrator (Admin Dashboard)
1. **Statistik Pengajuan Adopsi:**
   - Kartu statistik interaktif 2x2 (*Total Pengajuan, Menunggu, Diterima, Ditolak*) yang langsung memfilter daftar pengajuan saat ditekan.
2. **Kelola Data Hewan (CRUD):**
   - Tambah, perbarui, dan hapus data hewan peliharaan lengkap dengan foto dan relasi shelter penampungan.
3. **Kelola Data Shelter (CRUD):**
   - Tambah, perbarui informasi profil shelter, fasilitas, dan kelola penonaktifan shelter.
4. **Kelola Pengajuan Adopsi:**
   - Verifikasi pengajuan adopsi, ubah status pengajuan (*Pending / Approved / Rejected*).
   - **Sinkronisasi Otomatis:** Saat pengajuan disetujui (*Approved*), status hewan (`is_available`) otomatis diperbarui menjadi tidak tersedia agar tidak dapat diadopsi ganda.
5. **Kelola Pengguna:**
   - Pantau daftar pengguna terdaftar dan kelola peran (*role*: `user` / `admin`).

---

## 🛠️ Teknologi yang Digunakan

### Frontend
- **Framework:** React Native dengan [Expo SDK 58](https://expo.dev/)
- **Bahasa:** JavaScript (ES6+ / React 19)
- **Navigasi:** `@react-navigation/native` (Native Stack Navigator & Bottom Tabs)
- **Icons & UI:** `@expo/vector-icons` (Ionicons, MaterialCommunityIcons)
- **Image Picker & File:** `expo-image-picker`, `expo-file-system`
- **Penyimpanan Lokal:** `@react-native-async-storage/async-storage`

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js (v5)
- **File Upload:** Multer (penanganan multipart/form-data)
- **Middleware:** CORS, Dotenv, JWT Authentication Middleware

### Database & Cloud Storage
- **Database:** PostgreSQL via [Supabase](https://supabase.com/)
- **Authentication:** Supabase Auth (JWT token verification)
- **Storage Bucket:** Supabase Storage (penyimpanan foto avatar, hewan, dan shelter)

---

## 📂 Struktur Folder

```text
PetPal/
├── App.js                      # Root entry & navigasi utama (Auth, Admin, User)
├── package.json                # Dependensi & script Expo frontend
├── backend/                    # Layanan REST API Express.js
│   ├── config/
│   │   └── supabase.js         # Konfigurasi Supabase Client backend
│   ├── database/
│   │   ├── migration_shelter_relation.sql   # Migrasi relasi hewan ↔ shelter
│   │   └── migration_adoption_status.sql    # Migrasi status adopsi
│   ├── middleware/
│   │   ├── auth.js             # Middleware autentikasi token pengguna
│   │   └── adminAuth.js        # Middleware otorisasi hak akses admin
│   ├── routes/
│   │   ├── animalRoutes.js     # Endpoint data hewan
│   │   ├── shelterRoutes.js    # Endpoint data shelter & hitung hewan
│   │   └── adoptionRoutes.js   # Endpoint pengajuan adopsi & sync status
│   ├── server.js               # Entry point backend Express
│   └── package.json            # Dependensi backend
└── src/                        # Kode sumber frontend
    ├── config/
    │   └── supabase.js         # Konfigurasi Supabase Client frontend
    ├── context/
    │   ├── AuthContext.js      # Context state autentikasi, session, & profile
    │   └── FavoritesContext.js # Context daftar hewan favorit
    ├── screens/
    │   ├── admin/              # Layanan layar administrator
    │   ├── animals/            # Layanan katalog, detail, form & status adopsi
    │   ├── favorites/          # Layanan layar favorit
    │   ├── home/               # Layanan layar beranda & modal filter
    │   ├── profile/            # Layanan profil, bantuan (Help & Support), & About
    │   └── shelters/           # Layanan direktori & detail shelter
    └── services/
        └── api.js              # Integrasi HTTP Fetch ke Backend API
```

---

## 🗄️ Skema & Relasi Database

### Relasi Utama:
- **`animals` ↔ `shelters`**: Kolom `animals.shelter_id` berelasi *Many-to-One* ke `shelters.id` (`ON DELETE SET NULL`).
- **`adoption_requests` ↔ `animals`**: Berelasi ke `animals.id` (`ON DELETE CASCADE`).
- **`adoption_requests` ↔ `auth.users`**: Kolom `user_id` mengambil identitas dari JWT pengguna login.
- **`profiles` & `user_roles`**: Terhubung langsung dengan identitas `auth.users.id`.

### File Migrasi SQL
Tersedia pada folder `backend/database/`:
1. `migration_shelter_relation.sql`: Menambahkan kolom `shelter_id` pada tabel `animals` dan indeks relasi.
2. `migration_adoption_status.sql`: Menyesuaikan batasan status adopsi (`pending`, `approved`, `rejected`, `completed`, `cancelled`).

---

## 💻 Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat
- [Node.js](https://nodejs.org/) (versi 18 ke atas disarankan)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Perangkat fisik dengan aplikasi **Expo Go** atau browser modern untuk versi web

### 2. Setup Backend API
Masuk ke folder `backend`:
```bash
cd backend
npm install
```

Buat file `.env` di dalam folder `backend/` berisi konfigurasi Supabase Anda:
```env
PORT=5000
SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

Jalankan server backend:
```bash
# Mode development (auto-reload)
npm run dev

# Atau mode produksi
npm start
```
Server akan aktif di `http://localhost:5000` (atau port yang ditentukan).

### 3. Setup Frontend (Expo)
Buka terminal baru di root project:
```bash
npm install
```

> **Catatan Konfigurasi Alamat API (`src/services/api.js`):**  
> Pastikan variabel `BASE_URL` di `src/services/api.js` mengarah ke alamat IP server backend Anda:
> - Pengujian Web / Localhost: `http://localhost:5000/api`
> - Pengujian Fisik Mobile (Expo Go): `http://<IP-LOKAL-KOMPUTER-ANDA>:5000/api`

Jalankan aplikasi:
```bash
# Membuka Expo Dev Server
npm start

# Atau langsung membuka di browser (Web)
npm run web

# Atau membuka di Android emulator / iOS simulator
npm run android
npm run ios
```

---

## 📡 API Endpoints

### 🐾 Animals (`/api/animals`)
| Method | Endpoint | Akses | Keterangan |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/animals` | Publik | Mengambil semua hewan (bisa filter `?shelter_id=X`) |
| `GET` | `/api/animals/:id` | Publik | Mengambil detail spesifik hewan beserta data shelter |
| `POST` | `/api/animals/upload` | User / Admin | Unggah hewan peliharaan dengan foto |
| `POST` | `/api/animals/admin` | Admin | Tambah data hewan |
| `PUT` | `/api/animals/admin/:id` | Admin | Perbarui data hewan |
| `DELETE` | `/api/animals/admin/:id`| Admin | Hapus data hewan |

### 🏠 Shelters (`/api/shelters`)
| Method | Endpoint | Akses | Keterangan |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shelters` | Publik | Daftar shelter aktif lengkap dengan `pets_count` dinamis |
| `GET` | `/api/shelters/:id` | Publik | Detail shelter beserta daftar hewan yang dirawat di sana |
| `POST` | `/api/shelters/admin` | Admin | Tambah shelter baru |
| `PUT` | `/api/shelters/admin/:id` | Admin | Perbarui data shelter |
| `DELETE` | `/api/shelters/admin/:id`| Admin | Nonaktifkan data shelter |

### 📋 Adoptions (`/api/adoptions`)
| Method | Endpoint | Akses | Keterangan |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/adoptions/my-requests` | User (Auth) | Mengambil riwayat pengajuan milik user yang login |
| `POST` | `/api/adoptions` | User (Auth) | Mengajukan permohonan adopsi |
| `GET` | `/api/adoptions/admin` | Admin | Melihat seluruh pengajuan dari semua user |
| `PATCH` | `/api/adoptions/admin/:id/status`| Admin | Ubah status pengajuan & auto-update `is_available` hewan |
| `DELETE` | `/api/adoptions/admin/:id` | Admin | Hapus data pengajuan |

### 👥 Users & Roles (`/api/users`)
| Method | Endpoint | Akses | Keterangan |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/admin` | Admin | Daftar semua pengguna terdaftar |
| `PATCH` | `/api/users/admin/:id/role`| Admin | Perbarui role pengguna (`user` / `admin`) |

---

## 🌐 Catatan Khusus Deployment

### Kompatibilitas Multi-Platform (Web / Vercel & Mobile)
- **Cross-Platform Dialog Confirmation:**  
  Aplikasi telah dilengkapi penanganan `Platform.OS === 'web'` untuk dialog interaktif (seperti Logout, konfirmasi hapus data, dan update status adopsi). Di lingkungan web/Vercel digunakan `window.confirm`, sedangkan di mobile native menggunakan `Alert.alert`.
- **Resilient Auth State Cleanup:**  
  Fungsi keluar akun (*Sign Out*) pada `AuthContext` dilengkapi dengan blok `finally` guna memastikan sesi lokal selalu terhapus secara tuntas saat pengguna logout di browser maupun di perangkat Android/iOS.

---

## 📄 Lisensi
Proyek ini dikembangkan untuk tujuan edukasi dan portofolio pengembangan aplikasi adopsi hewan peliharaan **PetPal**.
