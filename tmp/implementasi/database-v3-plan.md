## 1️⃣ Prinsip Arsitektur (Ringkas tapi Krusial)

Untuk skala >5.000 data, **aturan utamanya**:

> ❌ Jangan pernah load semua data
> ✅ Selalu query **paged + indexed + sorted**

Dan **fungsi DB lokal** di sini adalah:

* Source of truth untuk **“Semua Drama”**
* Cache jangka panjang untuk metadata
* Basis untuk search, suggestion, popularity lokal

---

## 2️⃣ Skema Database (WAJIB di-upgrade)

### 🔹 Tabel utama: `contents`

Tambahkan kolom **khusus sorting & scale**:

```ts
contents {
  id                UUID (PK)
  provider           ENUM('dramabox','flickreels','melolo',...)
  provider_content_id STRING
  title               TEXT
  synopsis            TEXT
  poster_url          TEXT
  episode_count       INT
  language            TEXT
  release_year        INT

  created_at          TIMESTAMP  // waktu ingest
  updated_at          TIMESTAMP
  published_at        TIMESTAMP  // jika ada dari API
  last_synced_at      TIMESTAMP

  popularity_score    FLOAT      // lokal
  is_active           BOOLEAN    // soft hide
}
```

### 🔹 Index yang **WAJIB ada**

```sql
CREATE INDEX idx_contents_created_at_desc
ON contents (created_at DESC);

CREATE INDEX idx_contents_provider_created
ON contents (provider, created_at DESC);

CREATE INDEX idx_contents_active_created
ON contents (is_active, created_at DESC);
```

👉 Ini kunci agar **5.000–50.000 data tetap cepat**.

---

## 3️⃣ Definisi “Drama Terbaru” (Jelas & Konsisten)

Gunakan **satu aturan global**:

```
Drama terbaru = ORDER BY created_at DESC
```

❗ Bukan:

* popularity
* trending
* random

👉 `created_at` = waktu **masuk ke database**, bukan waktu rilis di provider
Ini penting agar:

* Drama hasil search yang baru ditemukan bisa langsung muncul
* Sinkron lintas provider tetap konsisten

---

## 4️⃣ Endpoint Backend: “Semua Drama”

### 🔹 API utama

```
GET /api/explore/all-dramas
```

### 🔹 Query Params

```ts
?cursor=2025-01-01T10:00:00Z
&limit=24
&provider=dramabox | flickreels | all
```

### 🔹 SQL (Cursor-based pagination – WAJIB)

```sql
SELECT *
FROM contents
WHERE is_active = true
  AND created_at < $cursor
ORDER BY created_at DESC
LIMIT $limit;
```

📌 **Kenapa cursor, bukan page?**

* Page-based pagination **rusak** di data besar
* Cursor:

  * stabil
  * tidak lompat
  * cocok infinite scroll

---

## 5️⃣ Infinite Scroll Strategy (Frontend)

### 🔹 State minimal

```ts
{
  items: Content[],
  cursor: string | null,
  hasMore: boolean,
  loading: boolean
}
```

### 🔹 Flow

1. Page load

   ```
   GET /api/explore/all-dramas?limit=24
   ```
2. User scroll ke bawah

   ```
   GET /api/explore/all-dramas?cursor=lastItem.created_at
   ```
3. Append data
4. Stop saat `hasMore=false`

📌 **Tidak pernah reload list**

---

## 6️⃣ Struktur Halaman Explore (Final & Ideal)

### Per tab provider (DramaBox / FlickReels / dll)

```
[ Trending ]        → API provider
[ Rekomendasi ]     → API provider
[ Terbaru ]         → API provider
----------------------------
[ Semua Drama ]     → DATABASE (infinite scroll)
```

✔ Trending/rekomendasi = API (fresh & curated)
✔ Semua Drama = DB (lengkap & scalable)

---

## 7️⃣ Saat Data > 5.000 (Optimasi WAJIB)

### ✅ Backend

* Cursor pagination
* Index di `created_at`
* Batasi `limit` (20–30)

### ✅ Frontend

* **Virtualized grid** (react-virtual / react-window)
* Lazy image loading
* Skeleton loader

### ❌ Jangan

* Render 1.000 DOM node
* Fetch page=1..200
* Sorting di frontend

---

## 8️⃣ Sinkronisasi & Update Data

### 🔹 Ingestion Rules

* Trending / Search / Explore API → **UPSERT**
* Jangan delete data lama
* Gunakan `last_synced_at`

```ts
upsert contents
ON (provider, provider_content_id)
```

### 🔹 Drama baru otomatis:

* Masuk ke DB
* `created_at = now()`
* Muncul di paling atas “Semua Drama”

---

## 9️⃣ Popularity Lokal (Opsional tapi Powerful)

Hitung dari:

* view
* favorite
* watch_time
* search hits

Disimpan di:

```ts
popularity_score FLOAT
```

Bisa dipakai untuk:

* Sorting alternatif
* Future recommendation
* Auto-promote content

---

## 🔟 Summary Arsitektur (Ringkas)

| Masalah | Solusi |
| ------- | ------ |

> 5.000+ drama | Cursor pagination + index |
> Drama terbaru di atas | ORDER BY created_at DESC |
> Explore cepat | API untuk curated, DB untuk full list |
> Infinite scroll | Cursor + virtual list |
> Multi-provider | Unified contents table |

---