# 📘 IMPLEMENTATION PLAN – EXPLORE PAGE (FINAL)

## 🎯 Tujuan

Membuat halaman **Explore** yang:

* Menggabungkan banyak sumber (DramaBox, FlickReels, NetShort, dll)
* Memiliki filter dinamis (kategori, negara, tahun, dll)
* Cepat (infinite scroll + cache)
* Tidak membebani client
* Mudah dikembangkan ke provider baru

---

## 1️⃣ Arsitektur Umum (WAJIB)

```
Frontend (Next.js)
   |
   |-- /api/explore (Backend Aggregator)
          |
          |-- Dramabox Adapter
          |-- FlickReels Adapter
          |-- NetShort Adapter
          |-- Melolo Adapter
          |
          +-- Cache Layer (Redis / Memory)
```

**Prinsip utama:**

* Frontend ❌ TIDAK memanggil API vendor langsung
* Backend jadi satu-satunya gateway
* Semua response dinormalisasi

---

## 2️⃣ Struktur URL (Final)

### 2.1 Endpoint Utama

```
GET /api/explore
```

### 2.2 Query Parameters

| Parameter | Contoh   | Keterangan       |
| --------- | -------- | ---------------- |
| provider  | dramabox | sumber data      |
| page      | 1        | pagination       |
| limit     | 20       | item per page    |
| region    | china    | wilayah          |
| category  | romance  | genre            |
| year      | 2024     | filter tahun     |
| sort      | popular  | popular / newest |
| lang      | id       | bahasa UI        |

### Contoh

```
/api/explore?provider=dramabox&page=1&category=romance&region=china
```

---

## 3️⃣ Struktur Response (Standar Tunggal)

```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "hasNext": true,
    "total": 120
  },
  "filters": {
    "categories": ["Romance", "Action", "Historical"],
    "regions": ["China", "Korea", "Thailand"],
    "years": ["2025", "2024", "2023"]
  },
  "items": [
    {
      "id": "db_123",
      "title": "Fated Hearts",
      "poster": "https://...",
      "episodes": 40,
      "tags": ["Romance", "Historical"],
      "provider": "dramabox"
    }
  ]
}
```

---

## 4️⃣ Backend Logic (Penting)

### 4.1 Provider Adapter Pattern

```ts
interface ProviderAdapter {
  fetchList(params): Promise<NormalizedResult[]>
}
```

Contoh:

```ts
class DramaBoxProvider implements ProviderAdapter {
  async fetchList(params) {
    const res = await fetch(...)
    return normalizeDramaBox(res)
  }
}
```

➡️ Semua provider diperlakukan sama.

---

## 5️⃣ Caching Strategy (WAJIB)

| Layer         | Tujuan       | TTL         |
| ------------- | ------------ | ----------- |
| Memory Cache  | Ultra cepat  | 30–60 detik |
| Redis Cache   | Shared cache | 5–10 menit  |
| Browser Cache | UX           | 30 detik    |

Key contoh:

```
explore:dramabox:page:1:category=romance
```

---

## 6️⃣ Infinite Scroll (Frontend)

### Flow:

1. Page load → fetch page 1
2. User scroll → threshold 80%
3. Fetch page 2
4. Append ke list (bukan replace)
5. Stop saat `hasNext=false`

Pseudocode:

```ts
if (isNearBottom && hasNext) {
  loadNextPage();
}
```

---

## 7️⃣ Filter System (Dynamic)

### Filter diambil dari backend

```
GET /api/explore/filters?provider=dramabox
```

Response:

```json
{
  "regions": ["China", "Korea", "Japan"],
  "genres": ["Romance", "Action"],
  "years": [2025, 2024, 2023]
}
```

Frontend hanya render berdasarkan response → tidak hardcode.

---

## 8️⃣ Performa & UX Optimasi

✅ Virtualized list (react-virtual / react-window)
✅ Skeleton loading
✅ Debounced filter changes
✅ Lazy image loading
✅ IntersectionObserver

---

## 9️⃣ Mengapa Pendekatan Ini Benar?

✔ Bisa menangani 10.000+ konten
✔ Mudah menambah provider baru
✔ Tidak bergantung API tertentu
✔ UX cepat seperti iQIYI / Netflix
✔ Skalabel & maintainable

---

## 10️⃣ Checklist Implementasi

* [x] Unified API
* [x] Pagination
* [x] Cache Layer
* [x] Filter dynamic
* [x] Infinite scroll
* [x] Provider abstraction
* [x] UI konsisten

---

# Update Explore improve plan 2

## ✅ MASALAH UTAMA YANG TERJADI

### 1. **Kenapa hasil “Trending” sedikit?**

Karena:

* Endpoint `/dramabox/trending` **hanya mengembalikan data teratas (ranking)**
* API ini **bukan endpoint katalog penuh**
* Parameter `page` **tidak berarti "semua data"**, tapi hanya pagination pada daftar *trending*

➡️ Jadi **bukan bug**, tapi **perilaku API memang seperti itu**.

---

### 2. **Kenapa filter (kategori, wilayah, dll) tidak bekerja optimal?**

Karena:

* Endpoint `/trending` **tidak mendukung filter kompleks**
* Filter seperti *genre, region, year* hanya tersedia di endpoint **browse/listing**, bukan trending
* Kamu saat ini mencampur:

  * `Trending API` → untuk highlight
  * `Browse API` → untuk eksplorasi

Dan itu **harus dipisahkan secara arsitektur**.

---

## 🔥 SOLUSI YANG BENAR (REKOMENDASI ARSITEKTUR)

### 🧠 Prinsip Utama

> **Trending ≠ Explore**
>
> Trending → curated list
> Explore → full catalog + filter

---

## 🧩 ARSITEKTUR YANG DIREKOMENDASIKAN

### 1️⃣ Home / Trending Page (Ringan & Cepat)

Gunakan endpoint:

```
GET /dramabox/trending
```

**Fungsi:**

* Menampilkan “yang lagi ramai”
* Digunakan untuk homepage
* BUKAN untuk filter / infinite scroll

**Ciri:**

* Data sedikit (10–20 item)
* Cache lama (1–6 jam)
* Tidak paginasi panjang

---

### 2️⃣ Explore Page (HALAMAN UTAMA KATALOG)

Gunakan endpoint yang mendukung **pagination & filter penuh**

Contoh:

```
GET /dramabox/home
GET /dramabox/list
GET /dramabox/search
```

> Inilah endpoint yang **harus digunakan** untuk:
>
> * Infinite scroll
> * Filter kategori
> * Filter region
> * Filter tahun
> * Sorting

---

## 📐 STRUKTUR FILTER YANG BENAR

### UI (Frontend)

```
[ Provider Tabs ]
DramaBox | FlickReels | NetShort | Melolo

[ Filter Bar ]
• Region: China | Korea | Japan | dll
• Category: Romance, Revenge, CEO, dll
• Year
• Language
• Sort: Popular | Latest

[ Infinite List ]
```

---

### API Mapping (Contoh)

```ts
GET /api/explore
  ?provider=dramabox
  &page=1
  &limit=20
  &region=china
  &genre=romance
  &sort=hot
```

Backend menerjemahkan ini menjadi:

```ts
if (provider === "dramabox") {
  return fetch(
    `/dramabox/list?tag=romance&page=1`
  )
}
```

---

## 🧠 Kenapa Tidak Bisa 1 API Untuk Semua?

Karena:

* **Setiap provider beda struktur**
* `tagId`, `category`, `region` tidak konsisten
* Ada yang pakai `tag_id`, ada yang `genre_id`
* Bahkan pagination beda (`page`, `offset`, `cursor`)

➡️ Solusi: **adapter layer**

---

## 🧱 Arsitektur yang Dianjurkan

```
/api/explore
 ├── provider = dramabox | flickreels | netshort
 ├── filters
 │    ├── category
 │    ├── region
 │    ├── year
 │    └── sort
 └── page
```

Backend:

```
ExploreController
 ├── resolveProvider()
 ├── mapFilters()
 ├── fetchFromSource()
 ├── normalizeResult()
```

---

## 🚀 Rekomendasi Akhir

✔ Gunakan **Trending** hanya untuk homepage
✔ Gunakan **Explore Page** khusus untuk browsing & filter
✔ Pisahkan logic per provider
✔ Gunakan **server-side aggregation**
✔ Infinite scroll + pagination
✔ Cache hasil per filter (Redis)

---
