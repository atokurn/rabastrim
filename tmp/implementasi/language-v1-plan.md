> **Subtitle / bahasa TIDAK sebaiknya disimpan di tabel `contents`**,
> tapi **dipisahkan ke tabel relasional khusus**, karena:
>
> * multi-provider
> * multi-bahasa
> * level episode (bukan hanya drama)
> * dan sering berubah / beda format antar API

Di bawah ini aku jelaskan **arsitektur yang paling aman + scalable**, disesuaikan dengan contoh API yang kamu kirim.

---

## Prinsip Dasar (Wajib Dipahami Dulu)

### 1. Level mana subtitle itu?

Subtitle **bukan metadata drama global**, tapi:

* bisa **beda per episode**
* bisa **beda per provider**
* bisa **beda format kode bahasa**

👉 Jadi **subtitle ≠ contents**

---

### 2. Apa yang *sebenarnya* perlu disimpan?

Bukan file subtitle atau URL (karena biasanya HLS / runtime),
tapi:

* **bahasa apa saja yang tersedia**
* **bahasa default**
* **mapping bahasa provider → bahasa internal**

---

## Rekomendasi Arsitektur (Best Practice)

### ✅ Tabel Utama Tetap: `contents`

**TIDAK berubah**

```ts
contents
- id
- provider
- providerContentId
- title
- ...
```

---

## 🔑 Tabel Baru (WAJIB): `content_languages`

### Tujuan

Menyimpan **daftar bahasa yang tersedia untuk 1 konten (drama)**

### Skema

```ts
content_languages
- id (uuid)
- content_id (FK → contents.id)
- provider
- language_code        // internal: id, en, zh, ja, ko
- provider_language_id // "1", "6", "id-ID", "en-US"
- is_default (boolean)
- type                 // subtitle | dubbing
- created_at
```

### Contoh Data

| content_id | provider   | language_code | provider_language_id | is_default | type     |
| ---------- | ---------- | ------------- | -------------------- | ---------- | -------- |
| xxx        | dramabox   | id            | "4"                  | true       | subtitle |
| xxx        | dramabox   | en            | "3"                  | false      | subtitle |
| xxx        | flickreels | id            | "6"                  | true       | subtitle |
| xxx        | dramawave  | zh            | "zh-CN"              | false      | subtitle |

---

## 🎬 Kalau Mau Lebih Akurat (Level Episode)

Jika ke depan **1 episode bisa beda subtitle**, buat tabel ini:

### `episode_languages`

```ts
episode_languages
- id
- episode_id (FK → episodes_metadata.id)
- provider
- language_code
- provider_language_id
- is_default
```

👉 Tapi **boleh ditunda**, mayoritas short drama bahasanya sama per drama.

---

## 🔄 Normalisasi Bahasa (WAJIB)

Karena tiap API beda format:

### Buat satu map global

```ts
const LANGUAGE_MAP = {
  "id": ["id-ID", "id", "6", "Indonesian"],
  "en": ["en-US", "en", "1", "English"],
  "zh": ["zh-CN", "zh-Hans", "1", "Chinese"],
  "zh-TW": ["zh-TW", "zh-Hant", "2"],
  "ja": ["ja-JP", "7", "Japanese"],
  "ko": ["ko-KR", "8", "Korean"],
}
```

### Normalizer

```ts
function normalizeLanguage(providerCode: string): string {
  for (const [internal, aliases] of Object.entries(LANGUAGE_MAP)) {
    if (aliases.includes(providerCode)) return internal
  }
  return "unknown"
}
```

---

## Bagaimana Mapping dari API yang Kamu Kirim?

### ✅ StartShort

```json
"4": "Indonesian"
```

➡️ simpan:

```ts
language_code = "id"
provider_language_id = "4"
```

---

### ✅ FlickReels

```json
"id": "6"
```

➡️ simpan:

```ts
language_code = "id"
provider_language_id = "6"
```

---

### ✅ DramaWave

```json
"default": "id-ID"
```

➡️ simpan:

```ts
language_code = "id"
provider_language_id = "id-ID"
is_default = true
```

---

## ❌ Kenapa Jangan Disimpan di `contents.tags` atau JSON?

❌ Sulit query
❌ Tidak bisa index
❌ Susah filter (subtitle Indonesia)
❌ Tidak scalable kalau ada dubbing + subtitle

---

## Cara Dipakai di Frontend (UI yang Kamu Tunjukkan)

### API contoh

```http
GET /api/content/{id}/languages
```

### Response

```json
{
  "default": "id",
  "subtitle": [
    { "code": "id", "label": "Bahasa Indonesia" },
    { "code": "en", "label": "English" },
    { "code": "zh", "label": "Chinese" }
  ],
  "dubbing": [
    { "code": "zh", "label": "Mandarin" }
  ]
}
```

👉 UI **Subtitle / Dubbing / Bahasa** bisa langsung pakai ini.

---
