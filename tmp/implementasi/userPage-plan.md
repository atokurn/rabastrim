# 📘 IMPLEMENTATION PLAN — USER PAGE

## 🎯 Tujuan Utama

Membangun **halaman user** yang:

* Bisa digunakan **tanpa login (guest)**
* Mendukung **login Google & Telegram**
* Menyimpan **riwayat, favorit, dan preferensi**
* Terintegrasi dengan sistem **explore + player**
* Siap berkembang ke fitur premium di masa depan

---

## 🧩 1. ARSITEKTUR UMUM

```
Frontend (Next.js)
│
├── Auth Layer (Clerk + Custom Telegram Auth)
│
├── User Service (API)
│   ├── profile
│   ├── favorites
│   ├── watch-history
│   ├── preferences
│
└── Data Storage
    ├── Users
    ├── Sessions
    ├── Favorites
    ├── WatchHistory
```

---

## 2️⃣ TIPE USER YANG DIDUKUNG

| Tipe User | Deskripsi                        |
| --------- | -------------------------------- |
| Guest     | Tidak login, data disimpan lokal |
| Logged-in | Login via Google / Telegram      |
| Hybrid    | Guest → Login (data digabung)    |

---

## 3️⃣ FLOW AUTENTIKASI

### A. Guest User (Default)

* Saat user pertama kali buka website:

  * Generate `guest_id`
  * Simpan di cookie / localStorage
* Digunakan untuk:

  * history
  * favorite
  * continue watching

### B. Login (Google / Telegram)

1. User klik login
2. OAuth / Telegram Login
3. Backend verifikasi
4. Jika user sudah punya `guest_id`:

   * Merge data
5. Buat `user_id` permanen
6. Hapus guest session

---

## 4️⃣ STRUKTUR DATABASE (Sederhana & Scalable)

### `users`

```ts
id: string
email?: string
username?: string
provider: 'google' | 'telegram'
createdAt
```

### `user_sessions`

```ts
id
user_id
device_id
last_active
```

### `watch_history`

```ts
id
user_id
content_id
progress
updated_at
```

### `favorites`

```ts
id
user_id
content_id
created_at
```

### `user_preferences`

```ts
user_id
language
auto_play
```

---

## 5️⃣ API ENDPOINT DESIGN

### Auth

```
POST /auth/telegram
POST /auth/google
POST /auth/logout
```

### User

```
GET  /user/me
GET  /user/history
POST /user/history
GET  /user/favorites
POST /user/favorites
```

---

## 6️⃣ FRONTEND FLOW (RECOMMENDED)

### Saat halaman dibuka:

1. Cek apakah user login
2. Jika tidak → buat `guest_id`
3. Ambil data:

   * history
   * favorites
4. Render UI

### Saat user login:

1. Merge guest data → akun
2. Refresh user state
3. Sync ulang history & favorites

---

## 7️⃣ UX FLOW (BEST PRACTICE)

```
User masuk
 ↓
Browse konten
 ↓
Klik video → auto save progress
 ↓
Klik ❤️ → simpan favorite
 ↓
Login (opsional)
 ↓
Data tetap ada
```

---

Baik. Di bawah ini aku jelaskan **IMPLEMENTASI AUTHENTICATION YANG REAL & SIAP PRODUKSI**, bukan konsep umum — tapi **alur teknis yang benar-benar bisa kamu implementasikan langsung** di project kamu.

Fokus:

* ✔ Guest → Login
* ✔ Login Google & Telegram
* ✔ Persistent session
* ✔ Aman, scalable, production-ready
* ✔ Cocok untuk arsitektur yang sudah kamu bangun

---

# ARSITEKTUR AUTHENTICATION (FINAL)

## 1️⃣ Prinsip Dasar (WAJIB DIPAHAMI)

### Tujuan sistem auth kamu:

* Pengguna bisa **pakai aplikasi tanpa login**
* Saat login, **data tidak hilang**
* Bisa login via **Google / Telegram**
* Sistem **aman, scalable, dan future-proof**

---

## 2️⃣ ENTITAS UTAMA (DATABASE)

### `users`

```ts
id: string               // UUID
email?: string
username?: string
avatar?: string
created_at: Date
```

### `auth_providers`

```ts
id: string
user_id: string
provider: 'google' | 'telegram'
provider_user_id: string
```

### `user_sessions`

```ts
id: string
user_id: string
session_token: string
expires_at: Date
```

### `user_devices`

```ts
id: string
user_id: string
device_id: string
last_active: Date
```

### `user_watch_progress`

```ts
id: string
user_id: string
content_id: string
episode_id: string
progress: number
updated_at: Date
```

---

## 3️⃣ ALUR AUTH YANG BENAR (END-TO-END)

### A. Guest User (Tanpa Login)

1. User buka website
2. Sistem buat `guest_id`
3. Simpan di:

   * `localStorage`
   * cookie (httpOnly optional)
4. Semua aktivitas pakai `guest_id`

```ts
const guestId = localStorage.getItem("guest_id") ?? generateUUID()
```

---

### B. Login via Google

1. User klik "Login with Google"
2. Google OAuth success → dapat token
3. Backend:

   * Verifikasi token
   * Cek apakah email sudah ada
   * Jika belum → buat user baru
4. Jika ada `guest_id`:

   * Merge data (watch history, favorites)
5. Buat session → kirim ke client

---

### C. Login via Telegram (Custom Flow)

1. User klik Telegram Login
2. Telegram kirim payload + hash
3. Backend verifikasi signature
4. Cari user dengan `telegram_id`
5. Jika tidak ada → buat user baru
6. Buat session & login

---

## 4️⃣ SESSION MANAGEMENT (WAJIB)

### Opsi terbaik:

* **JWT + HTTP-only Cookie**

Contoh:

```http
Set-Cookie: session=jwt_token; HttpOnly; Secure; SameSite=Lax
```

Keuntungan:

* Aman dari XSS
* Tidak perlu simpan token di localStorage

---

## 5️⃣ MERGE GUEST → USER (PENTING)

Saat user login:

```ts
if (guest_id && user_id) {
  mergeGuestData(guest_id, user_id)
}
```

Yang di-merge:

* watch_history
* favorites
* preferences

Setelah itu:

* Hapus guest record
* Update semua referensi ke user_id

---

## 6️⃣ API ENDPOINT YANG DIBUTUHKAN

```txt
POST   /auth/login/google
POST   /auth/login/telegram
POST   /auth/logout

GET    /user/me
GET    /user/history
POST   /user/history
GET    /user/favorites
POST   /user/favorites
```

---

## 7️⃣ FLOW LOGIN (SIMPLE DIAGRAM)

```
[ Client ]
   |
   v
[ Login Button ]
   |
   v
[ Auth Provider ]
   |
   v
[ Backend Verify ]
   |
   v
[ Create Session ]
   |
   v
[ User Logged In ]
```

---

## 8️⃣ BEST PRACTICES

✔ Simpan session di cookie (HttpOnly)
✔ Jangan simpan token di localStorage
✔ Selalu validasi token di backend
✔ Gunakan short-lived tokens
✔ Gunakan refresh token (opsional)

---
