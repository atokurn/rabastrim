# 📘 IMPLEMENTATION PLAN

## Feature: Explore Page (Multi-Source Content Discovery)

---

## 🎯 Tujuan Utama

Menyediakan halaman eksplorasi konten yang:

* Cepat & responsif
* Bisa menampilkan konten dari **berbagai sumber API** (Dramabox, FlickReels, NetShort, dll)
* Memiliki **filter dinamis per sumber**
* Mudah dikembangkan (scalable)
* Tidak bergantung pada satu struktur API

---

## 🧱 1. Arsitektur Umum

### 📌 Konsep Utama

Setiap **source (provider)** memiliki:

* Endpoint sendiri
* Filter sendiri
* Struktur data sendiri

Frontend bertugas:

* Menyatukan hasil
* Menyamakan tampilan (normalize)
* Mengatur interaksi UI

```
Explore Page
 ├── Tabs (Sources)
 │   ├─ Dramabox
 │   ├─ FlickReels
 │   ├─ Melolo
 │   └─ NetShort
 │
 ├── Filters (dynamic per source)
 └── Content Grid
```

---

## 🧩 2. Struktur API (Backend)

### Endpoint utama

```http
GET /api/explore?source=dramabox
GET /api/explore?source=flickreels
GET /api/explore?source=melolo
```

### Optional Query

```
?category=
&year=
&region=
&sort=
&page=
&limit=
```

### Contoh:

```
/api/explore?source=dramabox&category=romance&sort=popular&page=1
```

---

## 🧠 3. Data Normalization Layer

Setiap provider memiliki response berbeda → perlu distandarisasi.

### Interface Standard

```ts
interface ExploreItem {
  id: string
  title: string
  poster: string
  episodes?: number
  tags?: string[]
  source: "dramabox" | "flickreels" | "melolo"
  isVip?: boolean
  year?: number
}
```

### Mapper per Provider

```ts
function mapDramabox(item) {}
function mapFlickReels(item) {}
function mapMelolo(item) {}
```

> 🔥 Ini kunci agar UI bisa konsisten walaupun data beda-beda.

---

## ⚡ 4. Caching Strategy (Wajib)

### Redis Keys

```
explore:{source}:{category}:{page}
```

### TTL Rekomendasi:

| Data Type     | TTL      |
| ------------- | -------- |
| Trending      | 10 menit |
| Filtered List | 5 menit  |
| Popular       | 30 menit |

### Contoh:

```ts
cacheKey = `explore:dramabox:popular:page1`
```

---

## 🔍 5. UI / UX Behavior

### Tab Navigation

* Default tab: **Dramabox**
* Tab change → fetch source data
* State disimpan di URL (`?source=dramabox`)

### Filter Behavior

* Filter hanya mempengaruhi source aktif
* Reset filter saat pindah source
* Lazy load (infinite scroll)

### Skeleton Loading

* Saat tab berubah → tampilkan skeleton
* Jangan clear halaman lama sampai data baru siap

---

## 🧠 6. Performance Optimization

| Teknik          | Keterangan             |
| --------------- | ---------------------- |
| Debounce        | Filter input           |
| Cache           | Redis + SWR            |
| Pagination      | Infinite Scroll        |
| Preload         | Preload tab berikutnya |
| AbortController | Batalkan request lama  |

---

## 🧩 7. Struktur Folder (Disarankan)

```
/app
 ├─ explore/
 │   ├─ page.tsx
 │   ├─ components/
 │   │   ├─ ExploreTabs.tsx
 │   │   ├─ FilterBar.tsx
 │   │   ├─ ContentGrid.tsx
 │   │   └─ CardItem.tsx
 │   ├─ hooks/
 │   │   ├─ useExploreData.ts
 │   │   └─ useExploreFilters.ts
 │   ├─ services/
 │   │   ├─ dramabox.ts
 │   │   ├─ flickreels.ts
 │   │   └─ melolo.ts
 │   └─ types.ts
```

---

## 🧪 8. Testing Strategy

* ✅ API response validation
* ✅ Empty state handling
* ✅ Slow network simulation
* ✅ Scroll + pagination
* ✅ Cache hit/miss validation

---

## 🧭 9. Roadmap (Next Step)

1. ✅ Implement per-source search (DONE)
2. 🔄 Implement unified explore page
3. ⏳ Add prefetch on hover
4. ⏳ Add recommendation scoring
5. ⏳ Add personalization (history-based)

---

# Update Explore Page


## 1️⃣ **Menu Desktop: Pakai Kategori atau Provider?**

### 🔹 Jawaban Singkat:

**Ganti dengan provider names**

---

## 2️⃣ **Caching Strategy – Redis atau SWR?**

### Jawaban Singkat:

👉 **Gunakan KEDUANYA (berbeda layer)**

---

### 🧠 Arsitektur yang Disarankan

#### 🔹 Layer 1 – Server Cache (Redis)

Digunakan untuk:

* Search result
* Explore list
* Popular / Trending
* Data dari API eksternal

**Kenapa?**

* Menghindari spam ke API pihak ketiga
* Stabil untuk trafik tinggi
* Bisa TTL (30–300 detik)

```ts
Key: explore:dramabox:popular
TTL: 120s
```

---

#### 🔹 Layer 2 – Client Cache (SWR / React Query)

Digunakan untuk:

* Navigasi cepat antar tab
* Menghindari refetch saat user balik ke tab sebelumnya
* Smooth UX

```ts
useSWR(
  `/api/explore?source=dramabox`,
  fetcher,
  { revalidateOnFocus: false }
)
```

---

### ⚠️ Jangan pilih salah satu saja

| Hanya Redis             | Hanya SWR                      |
| ----------------------- | ------------------------------ |
| ❌ Beban server tinggi   | ❌ Tidak scalable               |
| ❌ Tidak cache di client | ❌ API bisa overload            |
| ❌ UX lambat             | ❌ Data tidak shared antar user |

➡️ **Kombinasi keduanya adalah solusi terbaik.**

---

## 3️⃣ **Struktur URL – Mana yang Paling Tepat?**

### Opsi A: `/explore?category=drama`

### Opsi B: `/drama`

### ✅ Rekomendasi: **Hybrid Approach (BEST PRACTICE)**

| Use Case         | URL                                       |
| ---------------- | ----------------------------------------- |
| Navigasi utama   | `/explore?category=drama`                 |
| SEO / share link | `/drama`                                  |
| Filter lanjutan  | `/explore?category=drama&source=dramabox` |

#### Implementasi:

```ts
// /drama
redirect('/explore?category=drama')
```

Ini memberi:

* URL cantik
* SEO bagus
* Logic backend tetap satu

---

