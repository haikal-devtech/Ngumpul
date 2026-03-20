# 🗓️ Ngumpul — Product Requirements Document

> Aplikasi Penjadwalan Ketemuan Bareng yang Cerdas

| | |
|---|---|
| **Versi** | 1.0 |
| **Tanggal** | Maret 2026 |
| **Status** | Draft |
| **Platform** | Web App (Mobile-Friendly) |
| **Target Rilis MVP** | Q3 2026 |

---

## 1. Overview Produk

### 1.1 Ringkasan Eksekutif

Ngumpul adalah aplikasi web penjadwalan ketemuan yang membantu kelompok orang menemukan waktu terbaik untuk berkumpul bersama. Pengguna dapat mengisi ketersediaan waktu mereka, dan sistem secara otomatis menganalisis serta menampilkan waktu yang paling cocok untuk semua anggota.

### 1.2 Masalah yang Diselesaikan

- Terlalu banyak bolak-balik pesan di WhatsApp hanya untuk menentukan jadwal
- Susah menyatukan jadwal dari banyak orang sekaligus
- Tidak ada platform penjadwalan yang mudah dipakai dan berbahasa Indonesia
- Tidak ada visibilitas jadwal semua anggota dalam satu tampilan

### 1.3 Solusi

Ngumpul menyediakan platform yang memungkinkan siapa saja — tanpa harus membuat akun — untuk bergabung ke sebuah event, mengisi ketersediaan waktu lewat tampilan grid yang intuitif, dan melihat waktu terbaik secara visual melalui heatmap. Host dapat mengkonfirmasi waktu final dan semua anggota akan mendapat notifikasi.

### 1.4 Tujuan Produk

- Mengurangi waktu yang terbuang untuk koordinasi jadwal
- Menjadi referensi utama penjadwalan kelompok di Indonesia
- Mencapai 10.000 pengguna aktif dalam 6 bulan pertama
- Net Promoter Score (NPS) minimal 40 dalam 3 bulan pertama

---

## 2. Target Pengguna

### 2.1 Segmen Pengguna

| Segmen | Karakteristik | Use Case Utama |
|---|---|---|
| Mahasiswa | 18–25 tahun, aktif di grup, sering ngumpul bareng | Jadwal kumpul kelompok tugas / nongkrong |
| Pekerja Muda | 22–35 tahun, jadwal padat, digital savvy | Jadwal meeting tim atau arisan |
| Komunitas / Organisasi | Kelompok 10–50 orang, kegiatan rutin | Rapat anggota, event komunitas |
| Keluarga | Berbagai usia, koordinasi acara keluarga | Jadwal reuni, arisan keluarga |

### 2.2 User Persona Utama

#### Persona 1 — Raka (Mahasiswa, 21 tahun)
- Sering jadi koordinator kelompok kuliah
- Frustrasi dengan tanya-tanya jadwal via WhatsApp
- Ingin solusi cepat tanpa perlu download app
- Biasa pakai HP untuk semua aktivitas digital

#### Persona 2 — Dinda (HR Staff, 28 tahun)
- Sering mengkoordinir jadwal meeting tim
- Butuh solusi yang bisa diintegrasikan dengan Google Calendar
- Menghargai fitur reminder otomatis
- Terbiasa dengan tools produktivitas modern

---

## 3. Fitur & Spesifikasi

### 3.1 Feature List & Prioritas

| ID | Fitur | Deskripsi | Fase | Prioritas |
|---|---|---|---|---|
| F-01 | Buat Event | Host buat event dengan nama, deskripsi, rentang tanggal & jam, dan batas pengisian | MVP | 🔴 Wajib |
| F-02 | Share via Link | Setiap event punya link unik yang bisa dibagikan tanpa login | MVP | 🔴 Wajib |
| F-03 | Input Availabilitas | Grid jam × hari, klik/drag untuk pilih waktu yang bisa | MVP | 🔴 Wajib |
| F-04 | Heatmap Waktu Terbaik | Visualisasi overlap jadwal semua anggota, makin gelap = makin cocok | MVP | 🔴 Wajib |
| F-05 | Guest Mode | Bergabung dan isi jadwal hanya dengan nama, tanpa buat akun | MVP | 🔴 Wajib |
| F-06 | Konfirmasi Waktu Final | Host memilih dan mengkonfirmasi waktu yang disepakati | MVP | 🔴 Wajib |
| F-07 | Sistem Akun | Registrasi & login via Google atau email | V1 | 🟡 Penting |
| F-08 | Notifikasi Email | Reminder ke anggota yang belum isi, notif waktu final | V1 | 🟡 Penting |
| F-09 | Riwayat Event | Pengguna dengan akun bisa lihat event yang pernah diikuti | V1 | 🟡 Penting |
| F-10 | Google Calendar Integration | Tambah event ke Google Calendar dengan satu klik | V2 | 🟢 Nice to have |
| F-11 | ICS Export | Download file .ics untuk semua platform kalender | V2 | 🟢 Nice to have |
| F-12 | Push Notification | Notifikasi browser untuk pengguna dengan akun | V2 | 🟢 Nice to have |
| F-13 | Filter Minimum Anggota | Host bisa set minimal X orang harus bisa hadir | V2 | 🟢 Nice to have |
| F-14 | Lokasi Opsional via Maps | Host bisa pilih lokasi event lewat Google Maps atau skip sama sekali | V1 | 🟡 Penting |
| F-15 | Autocomplete Pencarian Tempat | Input lokasi dengan Google Places Autocomplete — ketik nama tempat, langsung muncul saran | V1 | 🟡 Penting |
| F-16 | Tampilkan Peta di Halaman Event | Embed peta Google Maps di halaman event untuk semua anggota | V1 | 🟡 Penting |
| F-17 | Jarak & Waktu Tempuh Anggota | Anggota bisa input lokasi mereka, sistem hitung estimasi jarak & waktu tempuh ke lokasi event | V2 | 🟢 Nice to have |

### 3.2 Detail Fitur MVP

#### F-01: Buat Event
- Input: Nama event (wajib), Deskripsi (opsional), Lokasi (opsional)
- Pilih rentang tanggal: minimal 1 hari, maksimal 30 hari
- Pilih rentang jam: default 08.00–22.00, bisa dikustomisasi per jam
- Timezone: default WIB, bisa diubah
- Batas waktu pengisian (deadline) opsional

#### F-03: Input Availabilitas
- Tampilan grid: sumbu X = tanggal, sumbu Y = jam
- Interaksi: klik untuk toggle satu slot, drag untuk pilih banyak sekaligus
- Warna: hijau = bisa, merah = tidak bisa, abu = belum diisi
- Responsive untuk mobile (touch-friendly)
- Auto-save saat pengguna klik/drag

#### F-04: Heatmap Waktu Terbaik
- Overlay heatmap di atas grid yang sama
- Warna gradasi: putih (0 orang) → ungu gelap (semua orang bisa)
- Tooltip: hover/tap untuk lihat siapa saja yang bisa di slot tersebut
- Badge highlight 3 slot terbaik secara otomatis

#### F-14 & F-15: Lokasi Opsional + Autocomplete
- Field lokasi **tidak wajib diisi** — host bisa skip jika event online atau belum ditentukan
- Jika diisi, gunakan **Google Places Autocomplete** — ketik nama tempat, muncul daftar saran
- Setelah dipilih, simpan: nama tempat, alamat lengkap, koordinat (lat/lng), dan place_id
- Tampilan: input teks biasa dengan dropdown saran di bawahnya

#### F-16: Tampilkan Peta di Halaman Event
- Jika lokasi diisi, tampilkan embed **Google Maps** dengan marker di titik lokasi
- Tombol "Buka di Google Maps" untuk navigasi langsung
- Jika lokasi kosong, section ini tidak ditampilkan sama sekali

#### F-17: Jarak & Waktu Tempuh Anggota
- Anggota bisa (opsional) input lokasi asal mereka
- Sistem hitung estimasi jarak & waktu tempuh menggunakan **Google Distance Matrix API**
- Tampilkan di halaman event: kartu kecil tiap anggota berisi estimasi waktu tempuh
- Mode transportasi: default driving, bisa ganti ke transit atau walking

---

## 4. User Flow

### 4.1 Flow Host (Pembuat Event)

```
Buka Ngumpul
  → Klik "Buat Event"
  → Isi detail event (nama, deskripsi, rentang tanggal & jam)
  → Sistem generate link unik
  → Bagikan link ke anggota
  → Pantau siapa yang sudah isi
  → Lihat heatmap overlap jadwal
  → Klik "Konfirmasi Waktu"
  → Pilih slot terbaik
  → Anggota mendapat notifikasi waktu final
```

### 4.2 Flow Anggota (Guest)

```
Terima link dari host
  → Buka link
  → Masukkan nama
  → Lihat grid availabilitas
  → Klik/drag slot yang bisa
  → Klik Simpan
  → Selesai ✓
  (Bisa kembali ke link yang sama untuk edit sebelum deadline)
```

### 4.3 Flow Anggota (Dengan Akun)

```
Login dengan Google / email
  → Buka link event
  → Availabilitas otomatis tersimpan ke akun
  → Isi jadwal → Simpan
  → Terima notifikasi email saat waktu final dikonfirmasi
  → Klik "Tambah ke Google Calendar"
```

---

## 5. Rekomendasi Tech Stack

### 5.1 Frontend

| Teknologi | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js 14** (App Router) | Full-stack dalam satu repo, SSR untuk SEO, file-based routing yang clean |
| Styling | **Tailwind CSS** | Utility-first, cepat develop, cocok untuk grid & heatmap component |
| State Management | **Zustand** | Ringan, simple, cukup untuk kompleksitas Ngumpul |
| UI Components | **shadcn/ui** | Komponen siap pakai, customizable, aksesibel, tidak opinionated |
| Animasi | **Framer Motion** | Smooth interaction untuk drag grid & transisi UI |
| Date/Time | **date-fns + dayjs** | Manipulasi tanggal ringan dan timezone-aware |

### 5.2 Backend

| Teknologi | Pilihan | Alasan |
|---|---|---|
| API | **Next.js Route Handlers** | Satu repo dengan frontend, serverless-ready, mudah deploy ke Vercel |
| Database | **PostgreSQL** (via Supabase) | Relational cocok untuk data event & user, Supabase kasih real-time out of the box |
| ORM | **Prisma** | Type-safe, migration otomatis, DX yang sangat bagus |
| Auth | **NextAuth.js** (Auth.js v5) | Google OAuth + email magic link, mudah diintegrasikan |
| Email | **Resend + React Email** | Modern, developer-friendly, template email dengan React |
| Real-time | **Supabase Realtime** | Update heatmap live saat anggota mengisi jadwal |
| Calendar | **Google Calendar API** | Integrasi langsung ke kalender pengguna |
| Maps | **Google Maps Platform** | Places Autocomplete, Maps Embed, Distance Matrix API |

### 5.3 Infrastruktur & DevOps

| Layer | Pilihan | Keterangan |
|---|---|---|
| Hosting | **Vercel** | Deploy otomatis dari GitHub, edge network global, free tier cukup untuk MVP |
| Database Hosting | **Supabase** | PostgreSQL managed, free tier 500MB, dashboard yang bagus |
| Storage | **Supabase Storage** | Untuk foto profil & aset future feature |
| Monitoring | **Vercel Analytics + Sentry** | Performance monitoring & error tracking |
| CI/CD | **GitHub Actions** | Automated testing & deployment pipeline |

---

## 6. Arsitektur Sistem

### 6.1 Struktur Database

| Tabel | Field Utama | Relasi |
|---|---|---|
| `users` | id, name, email, image, created_at | 1:N ke events, 1:N ke availabilities |
| `events` | id, title, desc, **location_name, location_address, lat, lng, place_id** (semua nullable), host_id, date_range, time_range, timezone, deadline, confirmed_slot, slug | N:1 ke users, 1:N ke participants |
| `participant_locations` | id, participant_id, event_id, location_name, lat, lng (opsional, untuk hitung jarak) | N:1 ke participants |
| `participants` | id, event_id, user_id (nullable), guest_name, token | N:1 ke events, 1:N ke availabilities |
| `availabilities` | id, participant_id, event_id, slot_datetime, is_available | N:1 ke participants |

### 6.2 Struktur Folder Project

```
ngumpul/
├── app/
│   ├── (auth)/          # Halaman login & register
│   ├── (dashboard)/     # Halaman dashboard user
│   ├── event/
│   │   ├── new/         # Buat event baru
│   │   └── [slug]/      # Halaman event & input availabilitas
│   └── api/
│       ├── auth/        # NextAuth endpoints
│       ├── events/      # CRUD event
│       └── availability/ # Input & fetch availabilitas
├── components/
│   ├── grid/            # Komponen grid & heatmap
│   ├── event/           # Komponen card event
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── prisma.ts        # Prisma client
│   ├── utils.ts         # Utility functions
│   └── calendar.ts      # Google Calendar helpers
├── emails/              # React Email templates
├── hooks/               # Custom React hooks
└── prisma/
    └── schema.prisma    # Database schema
```

---

## 7. Roadmap Pengembangan

| Fase | Timeline | Scope |
|---|---|---|
| **MVP** | Minggu 1–6 | Buat event, share link, input availabilitas (guest & akun), heatmap, konfirmasi waktu final |
| **V1** | Minggu 7–10 | Sistem akun (Google OAuth), notifikasi email, riwayat event, **lokasi opsional + Places Autocomplete + embed Maps** |
| **V2** | Minggu 11–14 | Google Calendar integration, ICS export, push notification, filter minimum anggota, **hitung jarak & waktu tempuh anggota** |
| **V3** | Minggu 15+ | Mobile app (React Native), recurring event, analytics dashboard untuk host |

---

## 8. Metrik Keberhasilan

| Metrik | Target MVP (Bulan 1–3) | Target Jangka Panjang (Bulan 6) |
|---|---|---|
| Pengguna Aktif Bulanan | 1.000 MAU | 10.000 MAU |
| Event Dibuat per Bulan | 500 events | 5.000 events |
| Tingkat Penyelesaian | Min. 70% event dapat waktu final | Min. 80% |
| Rata-rata Anggota per Event | Min. 4 orang | Min. 6 orang |
| NPS Score | Min. 30 | Min. 45 |
| Waktu Load Halaman | < 2 detik | < 1.5 detik |

---

## 9. Risiko & Mitigasi

| Risiko | Tingkat | Mitigasi |
|---|---|---|
| Adoption rendah — pengguna malas isi jadwal | 🔴 Tinggi | Guest mode tanpa login, UI semudah mungkin, mobile-first |
| Skalabilitas real-time saat banyak user | 🟡 Sedang | Supabase Realtime + optimistic updates di frontend |
| Integrasi Google Calendar ditolak review | 🟡 Sedang | Sediakan ICS export sebagai fallback, submit OAuth verification lebih awal |
| Kompetitor (when2meet, Doodle) | 🟢 Rendah | Diferensiasi: Bahasa Indonesia, UX lebih modern, heatmap real-time |
| Biaya infrastruktur membengkak | 🟢 Rendah | Mulai dengan free tier, scale bertahap sesuai growth |
| Biaya Google Maps API melebihi free tier | 🟡 Sedang | Pasang billing alert, cache hasil Distance Matrix, batasi request per user |

---

## 10. Asumsi & Dependensi

### 10.1 Asumsi
- Pengguna memiliki akses internet dan browser modern
- Host event bersedia berbagi link kepada anggota
- Email notifikasi tidak masuk ke folder spam
- Google OAuth approval dapat diperoleh sebelum V1

### 10.2 Di Luar Scope (untuk saat ini)
- Aplikasi mobile native (iOS/Android) — direncanakan di V3
- Integrasi kalender non-Google (Outlook, Apple Calendar) — V3+
- Fitur pembayaran / monetisasi — belum ditentukan
- Multitenancy / white-label untuk enterprise

---

*— Akhir Dokumen — v1.0 | Maret 2026*
