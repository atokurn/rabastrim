## 1. Penilaian Keseluruhan (Singkat)

**Keputusan kamu = tepat** ✅

* ❌ Tidak memaksakan language di `contents`
* ❌ Tidak infer dari title (ini jebakan)
* ✅ Relational table `content_languages`
* ✅ Default provider-based
* ✅ Deferred enrichment (playback / admin)

Ini **production-grade decision**, bukan sekadar solusi akademis.

---

## 2. Validasi Arsitektur yang Kamu Buat

### A. `content_languages` table ✅ SANGAT TEPAT

Struktur ini **future-proof**:

```ts
contentId        → relasi ke contents
provider         → penting untuk multi-provider
languageCode     → normalized internal (id, en, zh)
providerLanguageId → mapping ke API provider
type             → subtitle | dubbing
isDefault        → UX logic
```

Kenapa ini benar:

* 1 konten bisa punya **multi subtitle + multi dubbing**
* 1 provider pakai **ID bahasa berbeda**
* Bisa berkembang ke **episode_languages** tanpa refactor besar

💯 **Ini desain Netflix-level**

---

### B. Kenyataan API Provider → Analisis kamu AKURAT

Temuan kamu valid:

| Provider   | Language di list API | Language di playback |
| ---------- | -------------------- | -------------------- |
| DramaBox   | ❌                    | ✅ HLS                |
| FlickReels | ❌                    | ✅ HLS                |
| Melolo     | ❌                    | ❌ / terbatas         |
| DramaQueen | ⚠️ sebagian          | ✅ detail             |

Artinya:

* **Sync layer memang tidak bisa tahu bahasa**
* Language = **playback concern**, bukan catalog concern

👉 Jadi **tidak ada bug di code kamu sebelumnya**
Ini murni **limitasi data source**.

---

## 3. Perbaikan Kecil (TAPI PENTING)

Ini bagian yang **akan menyelamatkan kamu 6 bulan ke depan**.

---

### 🔧 1. Tambahkan `source` ke `content_languages`

Supaya kamu tahu bahasa itu datang dari mana.

```ts
source: varchar("source", { length: 20 }).default("default"),
// default | playback | admin | api
```

Kenapa penting:

* Jangan overwrite language dari playback
* Admin edit ≠ auto-sync
* Debugging jadi mudah

---

### 🔧 2. Jangan Hardcode Default `id` untuk Semua Provider

Saat ini kamu tulis:

> dramabox → id
> flickreels → id
> melolo → id
> dramaqueen → id

Lebih aman:

```ts
const DEFAULT_PROVIDER_LANG = {
  dramabox: { code: "id", type: "subtitle" },
  flickreels: { code: "id", type: "subtitle" },
  melolo: { code: "id", type: "subtitle" },
  dramaqueen: { code: "zh", type: "subtitle" }, // CN first
};
```

Alasannya:

* DramaQueen mayoritas **CN original**
* Subtitle ID sering tidak selalu tersedia

👉 UX lebih jujur

---

### 🔧 3. Language Ingestion HARUS Idempotent

Di `language-ingestion.ts`:

```ts
onConflictDoNothing({
  target: [contentId, provider, languageCode, type]
});
```

Kalau tidak:

* Sync berulang = duplicate row
* Admin update bisa ke-override

---

### 🔧 4. API `/content/[id]/languages` Sudah Benar, Tapi Tambahkan Ini

Response ideal:

```json
{
  "default": {
    "subtitle": "id",
    "dubbing": null
  },
  "subtitle": [...],
  "dubbing": [...],
  "source": "default"
}
```

Kenapa?

* Frontend tahu apakah user bisa switch
* Bisa tampilkan badge: *Auto / Detected / Manual*

---

## 4. Roadmap Selanjutnya (Optional tapi Powerful)

Tanpa memaksa sekarang 👇

---

### Phase 3 (Nanti): Playback-based Detection 🔥

Saat user play episode:

```ts
GET /api/playback/manifest
→ parse HLS
→ detect SUBTITLES
→ upsert content_languages (source=playback)
```

Ini **100% akurat**, tanpa sync berat.

---

### Phase 4 (Kalau Perlu): Episode-level Language

Hanya jika:

* Satu episode punya bahasa beda
* Atau dubbing parsial

Table:

```ts
episode_languages
```

TAPI 👉 **jangan sekarang** (kamu benar untuk defer)

---

## Final Verdict

### ✅ Implementasi plan kamu:

* **Benar secara arsitektur**
* **Realistis dengan API**
* **Scalable**
* **Tidak over-engineered**

### ⚠️ Yang wajib kamu tambahkan:

1. `source` di `content_languages`
2. Provider default language lebih realistis
3. Idempotent upsert
4. Sedikit enrichment di response API

