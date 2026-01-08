## 3️⃣ Review Implementasi Plan yang Kamu Buat

Dari implementasi plan yang kamu kirim (berdasarkan deskripsi):

### ✅ Yang sudah BENAR

* Kamu **mengembalikan pemisahan Drama China & Korea berbasis negara**
* Tab Anime dipisahkan
* Tidak mencampur logic frontend

Ini **keputusan yang tepat**

---

### ⚠️ Yang perlu diperjelas / diperbaiki di plan

Aku rekomendasikan **struktur klasifikasi yang lebih eksplisit**:

---

## 4️⃣ Rekomendasi Arsitektur Klasifikasi (Final & Aman)

### 🔑 Prinsip utama

> **Gunakan MULTI-DIMENSION classification**, bukan satu parameter

---

### 📦 1. Tambahkan field eksplisit di DB (jika belum)

Pastikan `contents` punya:

```ts
content_type: 'drama' | 'anime' | 'movie'
origin_country: 'CN' | 'KR' | 'JP' | 'US' | null
```

> Jangan pakai `category` atau `type` mentah dari API langsung

---

### 🧠 2. Normalisasi saat ingestion (PENTING)

Saat simpan metadata ke DB:

```ts
if (provider === 'anime_api') {
  content_type = 'anime'
} else {
  content_type = 'drama'
}

origin_country = normalizeCountry(api.country || api.region)
```

Contoh normalisasi:

* China Daratan → `CN`
* Mainland China → `CN`
* Korea Selatan → `KR`
* South Korea → `KR`

---

### 🧭 3. Definisi tab yang JELAS (ini kunci)

Gunakan rule ini:

#### Tab Drama China

```sql
WHERE content_type = 'drama'
AND origin_country = 'CN'
```

#### Tab Drama Korea

```sql
WHERE content_type = 'drama'
AND origin_country = 'KR'
```

#### Tab Anime

```sql
WHERE content_type = 'anime'
```

👉 **JANGAN pakai country untuk Anime**
👉 **JANGAN pakai type untuk Drama Asia**

---

### 🧯 4. Fallback rule (biar tidak kosong)

Tambahkan rule pengaman:

```ts
if (content_type is null && origin_country in [CN, KR]) {
  content_type = 'drama'
}
```

Ini mencegah:

* Drama “nyasar” ke Anime
* Tab kosong padahal data ada

---