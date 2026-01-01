## 🎯 Tujuan

Mengganti sistem **filter global (genre, negara, tahun)** menjadi:

> **Section-based Explore Page**
>
> Setiap provider menampilkan beberapa section berdasarkan endpoint yang memang mereka sediakan.

Ini adalah pendekatan yang **realistis, scalable, dan stabil**, sesuai dengan keterbatasan API eksternal.

---

## 1️⃣ Struktur UI Akhir (FINAL)

### Tab Atas (Provider)

```
[ DramaBox ] [ FlickReels ] [ NetShort ] [ Melolo ] [ Anime ]
```

Saat user memilih tab → hanya data dari provider tersebut yang ditampilkan.

---

### Isi Tab (Contoh: DramaBox)

```text
🔥 Trending
🎯 Recommended
🆕 Latest
⭐ VIP / Exclusive
🎬 Popular / Ranking
```

Setiap section = 1 API call berbeda
Setiap section = horizontal scroll

📌 **Tidak ada filter global lagi**
📌 **Tidak ada mixing data antar provider**

---

## 2️⃣ Mapping API → Section (WAJIB)

### 🔹 DramaBox

| Section UI  | API                   |
| ----------- | --------------------- |
| Trending    | `/dramabox/trending`  |
| Rekomendasi | `/dramabox/recommend` |
| Terbaru     | `/dramabox/latest`    |
| VIP         | `/dramabox/vip`       |
| Ranking     | `/dramabox/ranking`   |
| Search      | `/dramabox/search`    |

---

### 🔹 FlickReels

| Section UI | API                   |
| ---------- | --------------------- |
| Home       | `/flickreels/home`    |
| For You    | `/flickreels/foryou`  |
| Ranking    | `/flickreels/ranking` |
| Search     | `/flickreels/search`  |

---

### 🔹 NetShort

| Section UI | API                 |
| ---------- | ------------------- |
| For You    | `/netshort/foryou`  |
| Theater    | `/netshort/theater` |
| Search     | `/netshort/search`  |

---

### 🔹 Melolo

| Section UI | API                |
| ---------- | ------------------ |
| Latest     | `/melolo/latest`   |
| Trending   | `/melolo/trending` |
| Search     | `/melolo/search`   |

---

## 3️⃣ Struktur Folder (REKOMENDASI FINAL)

```
src/
 ├─ app/
 │   └─ explore/
 │       ├─ page.tsx           # layout + tabs
 │       ├─ section.tsx        # reusable section renderer
 │       ├─ provider/
 │       │   ├─ dramabox.ts
 │       │   ├─ flickreels.ts
 │       │   ├─ netshort.ts
 │       │   └─ melolo.ts
 │       └─ types.ts
 │
 ├─ services/
 │   ├─ dramabox.ts
 │   ├─ flickreels.ts
 │   ├─ melolo.ts
 │   └─ netshort.ts
```

---

## 4️⃣ Contoh Implementasi Section

```tsx
<Section
  title="Trending"
  fetcher={() => fetchDramaboxTrending()}
/>

<Section
  title="Rekomendasi"
  fetcher={() => fetchDramaboxRecommend()}
/>

<Section
  title="Terbaru"
  fetcher={() => fetchDramaboxLatest()}
/>
```

Masing-masing:

* lazy loaded
* cache dengan SWR / React Query
* infinite scroll optional

---

## 5️⃣ Kenapa Ini Jauh Lebih Baik

| Masalah Lama               | Solusi Baru             |
| -------------------------- | ----------------------- |
| Data kosong                | Tidak tergantung filter |
| API beda struktur          | Dipisah per provider    |
| Tidak bisa infinite scroll | Bisa (per section)      |
| UI berat                   | Render per section      |
| Hard to scale              | Modular & extensible    |

---

## 6️⃣ Jawaban Langsung untuk Pertanyaanmu

> Apakah pendekatan ini benar?

✅ **YA, 100% benar dan optimal.**

> Apakah ini lebih baik dari filter universal?

✅ **Jauh lebih baik** — karena API kamu memang **tidak dibuat untuk global filter**.

> Apakah bisa scalable ke 10+ provider?

✅ Ya. Cukup tambah:

```
/providers/[name]/index.ts
```

---

## 7️⃣ Langkah Selanjutnya (Rekomendasi)

1. Implement `SectionRenderer` reusable
2. Pindahkan semua filter → per-provider
3. Tambahkan skeleton loader per section
4. Gunakan `React Query` / `SWR` cache
5. Lazy load section saat viewport masuk

---