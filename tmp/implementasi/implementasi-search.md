# 📌 IMPLEMENTATION PLAN – SEARCH SYSTEM (PRODUCTION READY)

## 🎯 TUJUAN

Membangun fitur **search cepat, akurat, scalable**, yang:

* Real-time (autocomplete)
* Tidak membebani API utama
* Bisa menangani ribuan–jutaan konten
* Mendukung UX seperti iQIYI / Netflix

---

# 1️⃣ ARSITEKTUR UMUM

```
User Input
   ↓
Search UI (Debounce)
   ↓
Search API (Backend)
   ↓
Search Engine (Index)
   ↓
Return Result
```

❗ **Search tidak langsung query database utama**

---

# 2️⃣ KOMPONEN SISTEM

## A. Search Index (WAJIB)

Gunakan:

* ✅ **Meilisearch** (rekomendasi)
* Alternatif: Typesense / Elasticsearch

### Alasan:

* Fast (<50ms)
* Full-text search
* Ranking otomatis
* Fuzzy search

---

## B. Struktur Data Index

```json
{
  "id": "string",
  "title": "string",
  "alt_titles": ["string"],
  "type": "drama | movie",
  "year": 2024,
  "genres": ["romance", "fantasy"],
  "thumbnail": "url",
  "popularity": 87,
  "source": "dramabox"
}
```

📌 **Field yang di-index**

* title
* alt_titles
* tags
* cast
* genre

📌 **Field non-index**

* synopsis panjang
* episode list

---

## 3️⃣ ALUR DATA (END TO END)

### 🔹 1. Data Ingestion (Background Job)

```
External API → Normalizer → Database → Search Index
```

* Sync tiap 5–10 menit
* Update hanya yang berubah
* Bisa pakai cron / worker

---

### 🔹 2. Search Flow (Client Side)

```text
User ketik → debounce 300ms
↓
GET /search?q=keyword
↓
Search Index
↓
Return 10–20 result
```

Contoh:

```http
GET /api/search?q=silent
```

---

### 🔹 3. Search Result Behavior

* Tampilkan judul + cover
* Highlight keyword
* Klik → navigate ke detail page
* Tidak reload halaman

---

## 4️⃣ ENDPOINT DESIGN

### 🔹 GET /api/search

**Query Params**

```ts
q: string
limit?: number
page?: number
```

**Response**

```json
{
  "results": [
    {
      "id": "123",
      "title": "Silent Love",
      "thumbnail": "https://...",
      "type": "drama"
    }
  ],
  "total": 128
}
```

---

## 5️⃣ UI / UX FLOW

### Desktop

* Search bar di header
* Dropdown suggestion
* Tekan Enter → halaman hasil

### Mobile

* Full screen search
* List scrollable
* Tap → detail

---

## 6️⃣ PERFORMANCE OPTIMIZATION

| Teknik    | Fungsi          |
| --------- | --------------- |
| Debounce  | Kurangi request |
| Caching   | Respon cepat    |
| Indexing  | Query cepat     |
| Preload   | UX halus        |
| Lazy load | Hemat resource  |

---

## 7️⃣ ERROR HANDLING

* No result → tampilkan rekomendasi
* Timeout → retry
* Empty query → show trending

---

## 8️⃣ KEAMANAN

* Rate limit API
* Sanitasi input
* Limit result per request
* Protect index endpoint

---

## 9️⃣ IMPLEMENTATION TIMELINE (REKOMENDASI)

| Hari | Task                       |
| ---- | -------------------------- |
| 1    | Setup Meilisearch + schema |
| 2    | Sync data dari API         |
| 3    | Build search API           |
| 4    | Build frontend UI          |
| 5    | Optimization & QA          |

---

# Update REVIEW Walktrough

## ✅ PENILAIAN UMUM (RINGKAS)

| Aspek                      | Penilaian                      |
| -------------------------- | ------------------------------ |
| Arsitektur                 | ✅ Sangat baik                  |
| Pemisahan UI / API         | ✅ Tepat                        |
| UX Flow (mobile & desktop) | ✅ Sangat mirip platform besar  |
| Search scalability         | ✅ Sudah benar arahnya          |
| Performa & caching         | ⚠️ Perlu sedikit penyempurnaan |
| Future-proof               | ✅ Siap dikembangkan            |

---

## 1️⃣ Struktur Search: SUDAH TEPAT

Yang kamu lakukan sudah **benar dan profesional**:

### ✔ Search terpisah dari homepage

* `/search` page
* Tidak mengganggu halaman utama
* Bisa di-cache
* Cocok untuk SEO & analytics

### ✔ Search suggestions (autocomplete)

* Dipanggil saat user mengetik
* Limit 5–10 item
* Debounce ✔

Ini **sudah sesuai praktik Netflix / iQIYI / WeTV**.

---

## 2️⃣ Arsitektur API — Sudah Ideal

### Endpoint yang kamu buat:

```
GET /api/search?q=
GET /api/search/suggestions
GET /api/search/popular
```

✔ Ini sudah best practice
✔ Tidak membebani API utama
✔ Mudah di-cache

### Saran kecil:

Tambahkan parameter ini:

```ts
?limit=10
&offset=0
&type=drama|movie
```

Agar scalable ke depan.

---

## 3️⃣ Saran Penting: Layer Caching (WAJIB)

Saat ini (dari dokumenmu) belum terlihat jelas strategi caching.

### Rekomendasi:

Gunakan **Redis / Upstash**:

```text
Key: search:{query}
TTL: 60–300 detik
```

Untuk:

* Query populer
* Autocomplete
* Trending search

⚡ Dampak:

* Mengurangi hit ke database
* Respons < 50ms
* Lebih hemat biaya

---

## 4️⃣ UX SEARCH — SUDAH BENAR, TINGGAL DIPERHALUS

### Yang sudah bagus:

✔ Instant search
✔ Search history
✔ Suggestion list
✔ Auto navigate

### Saran tambahan (opsional tapi powerful):

* Highlight keyword di hasil
* Tampilkan kategori (Drama / Movie)
* Tampilkan “Popular searches” saat input kosong
* Skeleton loading (bukan spinner)

---

## 5️⃣ Apakah perlu halaman `/search` terpisah?

### Jawaban: **YA, tapi dengan dua mode**

| Mode           | Fungsi                          |
| -------------- | ------------------------------- |
| Overlay Search | Quick search (desktop / mobile) |
| `/search?q=`   | Full page result                |

Ini seperti:

* Netflix
* iQIYI
* YouTube

Dan **ini persis seperti yang kamu implementasikan sekarang** — jadi sudah benar.

---

## 6️⃣ Arsitektur Ideal (Final)

```
User Input
  ↓
Debounce (300ms)
  ↓
Search API (Edge / Serverless)
  ↓
Cache (Redis)
  ↓
Search Index (Meilisearch)
  ↓
Return results
```

------

# Update 3 pertanyaan

## ✅ 1. Redis Caching – Perlu atau Tidak?

**JAWABAN: YA, PERLU.**

### Kenapa?

Karena:

* Search adalah endpoint **paling sering dipanggil**
* Tanpa cache → beban API & latency tinggi
* Dengan Redis → respons < 50ms

### Implementasi yang BENAR:

* **Gunakan Upstash Redis**
* Cache berdasarkan query

Contoh:

```
Key: search:keyword
TTL: 60–300 detik
```

📌 **Keputusan:**
➡️ **SETUJUI dan IMPLEMENTASI Redis Cache**

---

## ✅ 2. Search Index (Meilisearch) – Perlu Sekarang atau Nanti?

**Jawaban: YA, TAPI BERTAHAP.**

### Penjelasan:

Saat ini kamu **boleh tetap pakai API DramaBox** sebagai sumber data utama, **TAPI**:

* Struktur sistem harus siap menerima Meilisearch
* Jangan hardcode logic pencarian ke API DramaBox saja

### Strategi yang benar:

```txt
Phase 1 (sekarang):
Frontend → API → DramaBox

Phase 2:
Frontend → Search API → Meilisearch → Multiple Sources
```

📌 **Kesimpulan**

> Jangan langsung wajib Meilisearch, tapi desain harus siap ke sana.

---

## ✅ 3. Parameter Tambahan (limit, offset, type)

**YA, SANGAT PERLU.**

### Minimal parameter:

```ts
/search?q=keyword
&limit=20
&page=1
&type=drama
```

### Manfaat:

* Pagination
* Infinite scroll
* Filter kategori
* Lebih scalable

📌 **Ini wajib ditambahkan sekarang**, meskipun backend awal belum memanfaatkannya penuh.

---
