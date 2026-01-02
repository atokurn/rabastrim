## 🧠 MASALAH UTAMA YANG HARUS DISELESAIKAN

Kalau kamu langsung:

```ts
Promise.all([
  fetch(dramabox),
  fetch(flickreels),
  fetch(netshort),
  fetch(melolo)
])
```

➡️ **Ini buruk** karena:

* Lambat (menunggu provider paling lambat)
* Tidak stabil (kalau 1 gagal, hero rusak)
* Tidak scalable (nambah provider = makin berat)
* Tidak bisa dikontrol (sorting, priority, fallback)

---

## ✅ SOLUSI YANG BENAR (PRODUCTION GRADE)

### 🔥 1. Konsep: **Hero Aggregator Layer**

Buat **1 endpoint khusus** untuk homepage hero:

```
GET /api/home/hero
```

Endpoint ini **TIDAK langsung menampilkan semua data**, tapi:

* Mengambil **pilihan terbaik** dari setiap provider
* Menggabungkan & menyaring
* Mengembalikan **1–5 konten terbaik saja**

---

## 🧩 2. Arsitektur yang Disarankan

```
[ Frontend ]
      ↓
/api/home/hero
      ↓
---------------------------------
| Hero Aggregator Service       |
|                               |
| - getFeaturedFromDramabox()   |
| - getFeaturedFromFlickreels() |
| - getFeaturedFromNetShort()   |
| - getFeaturedFromMelolo()     |
---------------------------------
      ↓
Normalize → Rank → Cache → Return
```

---

## 🔧 3. Strategi Pengambilan Data (PENTING)

### ❌ Jangan:

* Ambil 20–50 item dari tiap provider
* Render semua ke UI

### ✅ Lakukan:

Ambil **1–3 item terbaik per provider**

Contoh:

```ts
const heroCandidates = await Promise.all([
  getDramaboxTrending(1),   // top 1
  getFlickReelsTrending(1),
  getNetShortTrending(1),
  getMeloloTrending(1),
])
```

Lalu gabungkan:

```ts
const heroList = normalizeAndSort(heroCandidates)
```

---

## 🧠 4. Normalisasi Data (PENTING)

Setiap provider beda struktur → buat **format tunggal**

```ts
type HeroItem = {
  id: string
  title: string
  poster: string
  backdrop?: string
  provider: "dramabox" | "flickreels" | "netshort" | "melolo"
  score?: number
  episodeCount?: number
}
```

Semua API harus dipetakan ke struktur ini.

---

## ⚡ 5. Caching Strategy (WAJIB)

Gunakan cache supaya homepage cepat:

### Rekomendasi:

* **Redis / Upstash**
* TTL: 5–10 menit

```ts
cache.set("hero:home", data, 600)
```

Fallback jika API error → tampilkan cache lama.

---

## 🧠 6. Penentuan Urutan (Ranking Logic)

Contoh bobot:

```ts
score =
  popularity * 0.4 +
  freshness * 0.3 +
  provider_priority * 0.2 +
  random_factor * 0.1
```

Sehingga:

* Drama baru muncul
* Tapi drama populer tetap stabil

---

## 🧩 7. Tampilan UI (Hero Section)

Rekomendasi struktur:

```tsx
<Hero>
  <HeroBackground />
  <HeroTitle />
  <HeroActions />
  <HeroMeta />
</Hero>
```

Dengan:

* Auto rotate tiap 10–15 detik
* Skeleton loading
* Graceful fallback

---

## 🧠 8. Bagaimana dengan Tab "For You", "Drama", dll?

Gunakan **konsep yang sama**, tapi:

* `Hero`: hanya 1–3 item
* `List Section`: ambil data per kategori (paginated)

---

## 🚀 Ringkasan Solusi Final

| Masalah              | Solusi                     |
| -------------------- | -------------------------- |
| Data terlalu sedikit | Ambil dari banyak provider |
| Performa lambat      | Aggregator + cache         |
| Data tidak konsisten | Normalisasi response       |
| Sulit scaling        | Layer abstraction          |
| UI berat             | Preload + lazy load        |

---