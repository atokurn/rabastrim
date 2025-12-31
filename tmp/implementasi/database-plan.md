# 📘 DATABASE SCHEMA — STREAMING PLATFORM

> Database: **PostgreSQL (Neon)**
> Fokus: cepat, scalable, mudah di-maintain

---

## 🧩 1. Entity Relationship Overview

```
User
 ├── WatchHistory
 ├── Favorites
 └── Progress

Drama
 ├── Episodes
 ├── Genres
 └── Tags

Episode
 └── VideoSource
```

---

# 🧑‍💻 2. Tabel USERS

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  name VARCHAR(100),
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

> 🔹 Bisa dihubungkan ke Auth (Clerk / NextAuth)

---

# 🎬 3. Tabel DRAMA

```sql
CREATE TABLE dramas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  poster_url TEXT,
  banner_url TEXT,
  year INT,
  rating FLOAT,
  is_vip BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 🎞️ 4. Tabel EPISODES

```sql
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drama_id UUID REFERENCES dramas(id) ON DELETE CASCADE,
  episode_number INT,
  title VARCHAR(255),
  duration INT, -- dalam detik
  video_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 📺 5. Tabel VIDEO SOURCE (Optional – jika multi source)

```sql
CREATE TABLE video_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID REFERENCES episodes(id),
  provider VARCHAR(50),
  quality VARCHAR(10),
  url TEXT
);
```

---

# 🧠 6. Tabel WATCH HISTORY (Resume)

```sql
CREATE TABLE watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  episode_id UUID REFERENCES episodes(id),
  last_position INT,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, episode_id)
);
```

---

# ⭐ 7. FAVORITES / BOOKMARK

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  drama_id UUID REFERENCES dramas(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, drama_id)
);
```

---

# 🔎 8. GENRES & TAGS

```sql
CREATE TABLE genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50)
);

CREATE TABLE drama_genres (
  drama_id UUID REFERENCES dramas(id),
  genre_id UUID REFERENCES genres(id),
  PRIMARY KEY (drama_id, genre_id)
);
```

---

# 🔥 9. TRENDING & RECOMMENDATION (Optional Cache)

```sql
CREATE TABLE trending_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drama_id UUID REFERENCES dramas(id),
  score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 🧠 10. INDEXING (WAJIB UNTUK PERFORMANCE)

```sql
CREATE INDEX idx_drama_title ON dramas USING gin(to_tsvector('simple', title));
CREATE INDEX idx_episode_drama ON episodes(drama_id);
CREATE INDEX idx_watch_user ON watch_history(user_id);
```

---

# 🚀 11. Contoh Query Penting

### 🔹 Ambil Home Page

```sql
SELECT * FROM dramas ORDER BY created_at DESC LIMIT 10;
```

### 🔹 Resume Episode

```sql
SELECT * FROM watch_history 
WHERE user_id = $1 AND episode_id = $2;
```

### 🔹 Ambil Episode Drama

```sql
SELECT * FROM episodes 
WHERE drama_id = $1 ORDER BY episode_number;
```


# UPDATE FOR IMPLEMENTATION PLAN

# 🔍 REVIEW DETAIL PER BAGIAN

## 1️⃣ Struktur Database – SUDAH BENAR (dengan sedikit improvement)

### ✅ Yang sudah tepat

* Pemisahan `dramas`, `episodes`, `watch_history`
* `watch_history` menyimpan `last_position`
* Relasi jelas dan scalable

### ⚠️ Saran Perbaikan

Tambahkan **field pendukung performa & analytics**:

```sql
ALTER TABLE episodes ADD COLUMN duration INT;
ALTER TABLE episodes ADD COLUMN episode_index INT;

ALTER TABLE dramas ADD COLUMN total_episode INT;
ALTER TABLE dramas ADD COLUMN is_completed BOOLEAN DEFAULT false;
```

👉 Ini sangat membantu untuk:

* Auto-next episode
* Tampilkan progress bar
* Sorting cepat tanpa join berat

---

## 2️⃣ Watch History (PENTING)

Saat ini kamu hanya menyimpan `last_position`.

### ⚠️ Masalah:

* Tidak tahu apakah user sudah selesai menonton
* Sulit hitung “lanjutkan menonton”

### ✅ Saran Struktur Ideal:

```sql
CREATE TABLE watch_history (
  user_id UUID,
  episode_id UUID,
  last_position INT,
  duration INT,
  is_completed BOOLEAN DEFAULT false,
  updated_at TIMESTAMP,
  PRIMARY KEY (user_id, episode_id)
);
```

Dengan ini kamu bisa:

* Resume tepat
* Auto lanjut episode
* Tampilkan progress bar di UI

---

## 3️⃣ API Layer – Sudah Benar, Tapi Tambahkan Ini

### 🔹 Endpoint yang wajib ada (tambahan)

```http
GET /api/home
GET /api/drama/:id
GET /api/episode/:id
POST /api/progress
GET /api/recommendation
```

### Contoh body `/api/progress`

```json
{
  "episodeId": "uuid",
  "position": 320,
  "duration": 1400
}
```

---

## 4️⃣ Auto Next Episode Logic (Perlu Penegasan)

**Flow yang ideal:**

```ts
if (currentTime >= duration - 10) {
   markEpisodeComplete()
   play(nextEpisode)
}
```

Tambahkan:

* Countdown 5 detik
* Cancel button
* Auto-skip bisa dimatikan user

---

## 5️⃣ Caching Strategy (WAJIB DIIMPLEMENTASI)

### Redis Key Pattern

```
home:default
drama:{id}
episode:{id}
```

TTL:

* Home → 60s
* Drama → 5 menit
* Episode → 30 menit

❗ Tanpa ini, API kamu akan berat saat traffic naik.

---

## 6️⃣ Hal yang Perlu Ditambahkan (Penting)

### A. Background Job

Untuk:

* Update trending
* Sinkronisasi episode
* Cleanup cache

Gunakan:

* Cron + Serverless
* atau QStash / BullMQ

---

### B. Feature Flags (Opsional)

Agar bisa enable/disable fitur tanpa deploy.


# UPDATE IMPLEMENTATION PLAN 2

# 🔍 REVIEW & SARAN PER BAGIAN

## 1️⃣ Arsitektur Umum – ✅ SUDAH TEPAT

Struktur:

* Frontend (Next.js)
* API Aggregator
* Database (Neon)
* Cache (Upstash)
* CDN (Cloudflare)

➡️ **Sudah ideal**, tidak perlu diubah.

**Saran kecil:**

* Pisahkan konsep **API Aggregator** dan **Business Logic Service**

  * Aggregator = gabung data
  * Service = logic (recommendation, progress, history)

Ini akan memudahkan scaling nanti.

---

## 2️⃣ Database Design – 🟢 BAGUS, TINGGAL DIHALUSKAN

Kamu sudah benar memisahkan:

* `dramas`
* `episodes`
* `watch_history`

### 🔧 Perbaikan minor yang sangat disarankan:

#### Tambahkan ke `episodes`

```sql
is_free BOOLEAN DEFAULT true,
sort_order INT,
```

➡️ Berguna untuk:

* Episode premium
* Auto next episode (lebih stabil daripada episode_number)

---

### Tambahkan ke `watch_history`

```sql
is_completed BOOLEAN DEFAULT false
```

Alasannya:

* Lebih cepat menentukan “lanjutkan nonton”
* Tidak perlu hitung `position >= duration` terus

---

## 3️⃣ API DESIGN – SUDAH BAGUS, TINGGAL DIPERKUAT

### Endpoint inti sudah benar:

* `/api/home`
* `/api/drama/:id`
* `/api/play/:episodeId`
* `/api/progress`

### Saran tambahan:

Tambahkan endpoint ringan untuk UX:

```
GET /api/continue-watching
GET /api/recommendation
```

Ini akan:

* Mengurangi payload `/home`
* Lebih fleksibel untuk layout berbeda (mobile vs desktop)

---

## 4️⃣ Auto Play & Resume — SUDAH BENAR, TAPI…

Yang kamu rancang sudah tepat, tinggal **satu improvement penting**:

### Tambahkan “grace threshold”

Contoh:

```ts
if (last_position > duration * 0.9) {
  markAsCompleted()
  playNextEpisode()
}
```

Ini mencegah bug ketika user berhenti di detik terakhir.

---

## 5️⃣ Caching Strategy – SUDAH BENAR (TAMBAH 1 HAL)

Cache yang kamu rancang sudah oke.
Tambahkan **versioning key** agar cache bisa direset cepat:

```
home:v1
drama:{id}:v1
```

Kalau struktur berubah → tinggal naikkan versi.

