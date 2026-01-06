# 📘 IMPLEMENTATION PLAN

## Local Metadata Storage (Hybrid DB + API)

---

## 🎯 TUJUAN UTAMA

1. Menghilangkan ketergantungan API eksternal untuk:

   * Homepage
   * Explore
   * Search Suggest
2. Menjadikan database lokal sebagai **source of truth metadata**
3. Tetap menggunakan API eksternal **hanya untuk playback & fallback**
4. Memastikan sistem:

   * Cepat
   * Konsisten
   * Scalable
   * Mudah dirawat

---

## 🧠 KONSEP ARSITEKTUR (RINGKAS)

```
[ User ]
   ↓
[ Frontend ]
   ↓
[ API Backend ]
   ↓
[ Local DB (Neon) ]  ← PRIMARY (metadata)
   ↓
[ External APIs ]    ← SECONDARY (sync & playback)
```

---

## 🧩 1. KLASIFIKASI DATA (WAJIB)

### A. Metadata (DISIMPAN PERMANEN)

Digunakan oleh:

* Homepage
* Explore
* Search
* Search Suggest

### B. Playback Data (ON-DEMAND)

Digunakan hanya saat user menekan tombol play.

---

## 🗄️ 2. DATABASE SCHEMA (NEON)

### 2.1 `contents` (TABEL UTAMA)

```ts
contents {
  id: uuid (PK)

  provider: 'dramabox' | 'netshort' | 'melolo' | 'flickreels'
  provider_content_id: string

  title: string
  alt_titles: string[] | null
  description: text | null
  poster_url: string | null

  year: int | null
  region: string | null
  tags: string[] | null

  is_series: boolean
  episode_count: int | null

  source: 'trending' | 'home' | 'search' | 'manual'
  status: 'hidden' | 'active'

  popularity_score: int
  discovered_at: timestamp
  updated_at: timestamp

  UNIQUE (provider, provider_content_id)
}
```

---

### 2.2 `episodes` (OPSIONAL, RINGAN)

```ts
episodes {
  id: uuid
  content_id: uuid (FK)
  episode_number: int
  duration: int | null
}
```

❗ **Jangan simpan stream URL permanen**

---

## 🔄 3. DATA INGESTION FLOW (INTI IMPLEMENTASI)

### 3.1 INGEST DARI HOME / TRENDING / FOR YOU

**Digunakan untuk bootstrap catalog**

```
CRON / Worker
↓
Fetch provider home/trending
↓
Normalize response
↓
Upsert ke contents
↓
source = 'home' | 'trending'
status = 'active'
```

⏱ Jadwal:

* Trending: 30–60 menit
* Home / ForYou: 3–6 jam

---

### 3.2 INGEST DARI SEARCH (CONTROLLED)

**Digunakan untuk long-tail expansion**

```
User search "Drama X"
↓
Search DB lokal
↓
Jika kurang hasil:
  → call API provider search
↓
Filter hasil valid
↓
Upsert ke contents
↓
source = 'search'
status = 'hidden'
```

📌 **Tidak langsung tampil di homepage**

---

## 🧠 4. ATURAN STATUS & VISIBILITAS

### `status = hidden`

* Digunakan untuk:

  * search result
  * search suggest
* Tidak muncul di homepage/explore

### `status = active`

Konten boleh muncul jika:

* Pernah ditonton
* Pernah difavoritkan
* Popularity score ≥ threshold

---

## ⭐ 5. POPULARITY SCORING (SIMPLE & EFEKTIF)

Contoh aturan awal:

| Event                  | Score |
| ---------------------- | ----- |
| Disimpan dari trending | +10   |
| Ditonton               | +3    |
| Favorit                | +5    |
| Dicari                 | +1    |

Jika:

```ts
popularity_score >= 10
```

➡️ otomatis:

```ts
status = 'active'
```

---

## 🔍 6. SEARCH & SEARCH SUGGEST FLOW

### 6.1 Search Suggest (SUPER CEPAT)

```
GET /search/suggest?q=put
↓
Query DB lokal
↓
Jika hasil < N:
  → fallback API
↓
Upsert hasil baru (hidden)
↓
Return suggestion
```

Query DB:

```sql
SELECT id, title, provider
FROM contents
WHERE status IN ('active', 'hidden')
AND title ILIKE 'put%'
ORDER BY popularity_score DESC
LIMIT 8;
```

---

### 6.2 Full Search

```
GET /search?q=putri
↓
DB search
↓
Jika kurang:
  → API fallback
↓
Store & return
```

---

## 🧩 7. HOMEPAGE & EXPLORE (100% DARI DB)

### Homepage

```sql
SELECT * FROM contents
WHERE status = 'active'
ORDER BY popularity_score DESC
LIMIT 20;
```

### Explore (infinite scroll)

```sql
SELECT * FROM contents
WHERE provider = 'dramabox'
AND status = 'active'
ORDER BY popularity_score DESC
LIMIT 20 OFFSET 40;
```

🚀 **Tidak ada API eksternal di sini**

---

## 🎬 8. PLAYBACK FLOW (TETAP API)

```
User klik play
↓
Fetch stream URL dari provider API
↓
Cache singkat (Redis)
↓
Play
```

❗ **Jangan simpan URL ke DB**

---

## 🧱 9. INFRA & BIAYA (REALISTIS)

| Komponen      | Fungsi                |
| ------------- | --------------------- |
| Neon          | Metadata storage      |
| Redis         | Cache search & stream |
| Cron / Worker | Sync data             |
| API Provider  | Sync & playback       |

➡️ Biaya **lebih rendah** dibanding hit API terus-menerus.

---
