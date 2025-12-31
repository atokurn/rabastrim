## 🔍 MASALAH UTAMA YANG TERJADI

> **Search suggestion hanya mengambil data dari satu sumber (Dramabox)**
> sementara konten seperti **"Putri yang Terlupakan"** berasal dari **FlickReels / Melolo**.

Akibatnya:

* Search **hasil utama (search result)** → benar (karena kamu query semua source)
* **Search suggestion (autocomplete)** → *tidak lengkap* (karena hanya ambil dari satu source)

Ini **100% normal** kalau backend-nya memang seperti itu.

---

## 🔍 KENAPA INI TERJADI?

Biasanya struktur saat ini seperti ini:

```txt
/search          -> agregasi semua provider
/search/suggest  -> hanya Dramabox (fast & ringan)
```

Kenapa developer sering melakukan ini?

* Suggest harus **super cepat (<50ms)**
* Query pendek & realtime
* Tidak boleh memanggil banyak API eksternal

Namun efek sampingnya:

> Judul dari provider lain (Melolo, NetShort) tidak muncul di suggestion.

---

## ✅ SOLUSI TERBAIK (REKOMENDASI PROFESIONAL)

### 🥇 Solusi 1 — Unified Suggest Index (REKOMENDASI UTAMA)

**Buat index khusus untuk search suggestion**, terpisah dari API provider.

#### Konsep:

* Ambil data judul dari **SEMUA provider**
* Simpan di satu index ringan (Redis / Meilisearch / SQLite)
* Digunakan khusus untuk *autocomplete*

```
[User Input]
   ↓
[Suggestion Index]  ← cepat
   ↓
Show dropdown results
```

🔹 Isinya cukup:

* title
* provider
* slug / id
* poster (optional)

📦 Update bisa dilakukan:

* via cron job (tiap 6–12 jam)
* atau webhook jika ada data baru

---

### 🟢 Contoh Implementasi (Pseudo)

```ts
// /api/search/suggest
const suggestions = await redis.zrangebyscore(
  `suggest:${normalizedQuery}`,
  0,
  10
);
```

---

## 🔥 Rekomendasi Final (Best Practice)

| Komponen    | Solusi                                   |
| ----------- | ---------------------------------------- |
| Search bar  | Unified suggestion index                 |
| Result page | Multi-provider merge                     |
| API         | Tetap terpisah                           |
| Cache       | Redis (TTL 5–10 menit)                   |
| UX          | Instant suggestion, full search on enter |

---
