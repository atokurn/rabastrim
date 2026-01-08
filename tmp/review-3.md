
## 1️⃣ Review global (high-level)

Dari sudut pandang arsitektur:

* ✅ Penambahan `releaseDate`, `releaseYear`, `releaseStatus` → **tepat**
* ✅ Pemisahan dari `createdAt` → **sangat benar**
* ✅ Normalizer terpusat (`normalizeReleaseInfo`) → **best practice**
* ✅ Sorting berbasis `releaseDate` → **ini tujuan utamanya dan sudah tercapai**
* ✅ Ada data migration → **ini sering dilupakan orang lain, tapi kamu sudah cover**

**Kesimpulan global:**
👉 Plan ini **tidak perlu dirombak**, hanya **dipoles sedikit**.

---

## 2️⃣ Review Step 1: Schema Update

```ts
releaseDate: date("release_date"),
releaseYear: integer("release_year"),
releaseStatus: varchar("release_status", { length: 20 }).default("unknown"),
```

### ✅ Sudah benar

* Tipe data tepat
* Default value masuk akal
* Tidak merusak data lama

### 🔧 Saran kecil (opsional tapi bagus)

Tambahkan **constraint nilai `releaseStatus`** di level aplikasi (enum TS):

```ts
type ReleaseStatus = "released" | "ongoing" | "upcoming" | "unknown";
```

Ini mencegah typo seperti `"realeased"` masuk DB dari normalizer.

---

## 3️⃣ Review Step 2: `normalizeReleaseInfo`

Ini bagian paling krusial — dan **implementasimu sudah sangat bagus**.

### ✅ Yang sudah tepat

* Bisa handle:

  * `release_date`
  * `tahun_rilis`
  * `year`
* Ada fallback
* Status override dari API (`is_finish`, `is_coming`)

### ⚠️ Satu edge case penting yang perlu kamu tambahkan

Saat ini:

```ts
releaseDate = new Date(dateStr);
```

Masalah potensial:

* API sering kirim format tidak standar:

  * `"2024"`
  * `"2024-00-00"`
  * `"2024/03"`

### 🔧 Perbaikan kecil (disarankan)

```ts
const parsed = new Date(dateStr);
if (!isNaN(parsed.getTime())) {
  releaseDate = parsed;
  releaseYear = parsed.getFullYear();
  releaseStatus = parsed <= new Date() ? "released" : "upcoming";
}
```

Dan **jangan override `releaseYear` jika parsing gagal**.

👉 Ini mencegah:

* `Invalid Date`
* sorting rusak
* data silent error

---

## 4️⃣ Review Step 3: Update Normalizers

```ts
const { releaseDate, releaseYear, releaseStatus } = normalizeReleaseInfo(data);
```

### ✅ Ini sudah BENAR

* Centralized logic
* Konsisten antar provider
* Mudah di-maintain

Tidak ada catatan di sini 👍

---

## 5️⃣ Review Step 4: Upsert

```ts
releaseDate: data.releaseDate,
releaseYear: data.releaseYear,
releaseStatus: data.releaseStatus,
```

### ✅ Sudah benar

* Kamu **tidak menimpa `createdAt`**
* Kamu **tidak reset popularity/viewCount**

### ⚠️ Saran kecil tapi penting

Pastikan kamu **tidak overwrite data valid dengan null** saat API tidak mengirim release info.

Idealnya:

```ts
releaseDate: data.releaseDate ?? contents.releaseDate,
releaseYear: data.releaseYear ?? contents.releaseYear,
releaseStatus: data.releaseStatus ?? contents.releaseStatus,
```

Kalau sekarang kamu selalu overwrite, ini masih OK **selama normalizer selalu set nilai**.
Tapi ini worth noting untuk fase selanjutnya.

---

## 6️⃣ Review Step 5: Sorting

```ts
.orderBy(
  desc(contents.releaseDate),
  desc(contents.createdAt)
)
```

### ✅ Konsepnya benar

Tapi ada **1 masalah kecil SQL-level**:

* `NULL` biasanya diurutkan **terakhir**, tapi perilaku bisa beda tergantung DB

### 🔧 Sorting yang lebih aman (disarankan)

```ts
.orderBy(
  desc(sql`COALESCE(${contents.releaseDate}, ${contents.createdAt})`)
)
```

Atau jika mau eksplisit:

```ts
.orderBy(
  desc(contents.releaseDate),
  desc(contents.releaseYear),
  desc(contents.createdAt)
)
```

Ini membuat:

* Drama dengan tanggal rilis muncul dulu
* Drama tanpa tanggal tetap masuk, tapi di bawah

---

## 7️⃣ Review Step 6: Data Migration

```sql
UPDATE contents SET release_year = year WHERE release_year IS NULL;
UPDATE contents SET release_status = 'released'
WHERE release_year IS NOT NULL AND release_status = 'unknown';
```

### ✅ Ini sudah benar dan aman

### 🔧 Tambahan kecil (opsional)

Untuk data tanpa tahun:

```sql
UPDATE contents
SET release_status = 'unknown'
WHERE release_year IS NULL;
```

Supaya status konsisten dan eksplisit.

---

## 8️⃣ Hal penting yang BELUM kamu tulis (tapi sebaiknya ada)

Ini bukan kesalahan, tapi **peningkatan kualitas**.

### 🔹 1. Index untuk performa (>5000 drama)

WAJIB kalau dataset besar:

```sql
CREATE INDEX idx_contents_release
ON contents (release_date DESC, created_at DESC);
```

Atau jika banyak NULL:

```sql
CREATE INDEX idx_contents_release_coalesce
ON contents ((COALESCE(release_date, created_at)) DESC);
```

---

### 🔹 2. Kontrak eksplisit: `releaseDate` ≠ `createdAt`

Tambahkan 1 baris dokumentasi di plan:

> ⚠️ `createdAt` hanya untuk DB order fallback, **bukan indikator rilis drama**

Ini penting untuk developer lain (atau kamu di masa depan).

---
