## 1. Akar Masalah Utama (Root Cause)

### 📌 Kondisi data saat ini (dari screenshot DB)

Kolom `tags` berisi data seperti:

```text
["donghua"]
["drama"]
NULL
```

❗ **Tidak ada informasi negara (China, Korea, Japan, dll)**
❗ **Tidak ada genre spesifik yang terstruktur**
❗ Semua klasifikasi digantungkan ke `tags` yang **tidak konsisten**

---

## 2. Kenapa Drama China & Korea Kosong?

### Cara tab kamu bekerja (kemungkinan besar)

Contoh logic filter tab:

```ts
if (tab === 'china') {
  where country = 'China'
}

if (tab === 'korea') {
  where country = 'Korea'
}
```

Masalahnya:

* **Kolom `country` tidak ada / NULL**
* Atau **tidak pernah diisi saat ingest metadata**
* Akibatnya: query valid tapi **tidak ada row yang match**

➡️ **Hasil: kosong**

---

## 3. Kenapa Justru Masuk ke Tab Anime?

Biasanya logic Anime seperti ini:

```ts
if (tags includes 'donghua' || tags includes 'anime')
```

Karena:

* Drama China banyak yang bertag `donghua`
* Tapi **donghua ≠ anime Jepang**, hanya mirip secara format

➡️ Akhirnya:

* Drama China → dianggap Anime
* Drama Korea → tidak punya tag negara → hilang

---

## 4. Kesalahan Konseptual yang Terjadi

### ❌ Menggunakan `tags` untuk:

* Genre
* Negara
* Tipe konten (drama / anime)

Padahal seharusnya:

* `tags` = **tema cerita**
* Negara & tipe = **field terpisah**

---

## 5. Solusi yang BENAR (WAJIB Dilakukan)

### ✅ 1. Tambahkan Kolom Metadata Inti (Wajib)

Di tabel `contents` / `drama_metadata`:

```sql
ALTER TABLE contents ADD COLUMN content_type TEXT;
ALTER TABLE contents ADD COLUMN country TEXT;
ALTER TABLE contents ADD COLUMN language TEXT;
```

Contoh nilai:

```text
content_type: drama | anime | movie
country: China | Korea | Japan | Thailand
language: zh | ko | ja | en
```

---

### ✅ 2. Mapping Provider → Metadata (Saat Ingest)

Saat sync dari API:

#### DramaBox

```ts
content_type = 'drama'
country = 'China'
language = 'zh'
```

#### FlickReels (Korea)

```ts
content_type = 'drama'
country = 'Korea'
language = 'ko'
```

#### Anime

```ts
content_type = 'anime'
country = 'Japan'
language = 'ja'
```

❗ **Jangan bergantung ke `tags` untuk negara**

---

### ✅ 3. Gunakan `tags` HANYA untuk Tema Cerita

Contoh isi `tags` yang benar:

```json
["Balas Dendam", "CEO", "Reinkarnasi"]
```

❌ Jangan:

```json
["donghua", "drama", "china"]
```

---

## 6. Perbaikan Query Tab (Contoh)

### Drama China

```sql
WHERE content_type = 'drama'
AND country = 'China'
ORDER BY published_at DESC
```

### Drama Korea

```sql
WHERE content_type = 'drama'
AND country = 'Korea'
```

### Anime

```sql
WHERE content_type = 'anime'
```

---

## 7. Migrasi Data (WAJIB Agar Tidak Kosong)

Karena data lama sudah terlanjur masuk:

### Contoh migrasi cepat

```sql
UPDATE contents
SET content_type = 'anime', country = 'China'
WHERE tags @> '["donghua"]';
```

```sql
UPDATE contents
SET content_type = 'drama', country = 'China'
WHERE tags @> '["drama"]'
AND provider = 'dramabox';
```

---

## 8. Apakah Perlu Ubah Database?

### ✅ Jawaban tegas: **YA, WAJIB**

Tanpa ini:

* Tab akan selalu salah
* Explore page tidak scalable
* Search & filter makin kacau saat >5000 drama

---

## 9. Checklist Perbaikan (Prioritas Tinggi)

**WAJIB SEKARANG**

* [ ] Tambah kolom `content_type`
* [ ] Tambah kolom `country`
* [ ] Perbaiki logic ingest metadata
* [ ] Migrasi data lama
* [ ] Update query tab Explore

**OPSIONAL (Nanti)**

* [ ] Normalisasi country (ISO code)
* [ ] Table `countries` terpisah
* [ ] Analytics per country

---

## 10. Kesimpulan Singkat

> ❌ Masalahnya **bukan di UI**
>
> ❌ Bukan juga di infinite scroll
>
> ✅ **Masalah utama ada di struktur metadata database**
>
> Tanpa pemisahan:
>
> * `content_type`
> * `country`
> * `tags`
>
> Sistem Explore **tidak akan pernah akurat**

---