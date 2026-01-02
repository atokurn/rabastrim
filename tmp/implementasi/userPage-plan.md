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