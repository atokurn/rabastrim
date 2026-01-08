# 📌 IMPLEMENTATION PLAN — ADDING RELEASE DATE & IMPROVED METADATA

## 🎯 Objective

Tujuan rencana ini adalah untuk memperkaya sistem metadata sehingga:

1. **Drama terbaru** benar-benar diprioritaskan menggunakan field tanggal rilis.
2. Semua filter (Drama China, Drama Korea, Anime, dsb) bekerja konsisten.
3. Sorting dan infinite scroll lebih akurat dan predictable.
4. Data lama tetap terjaga dan dimigrasikan sesuai kebutuhan.

---

## 🧠 ARCHITECTURE PRINCIPLES

### ❗ Perbedaan Penting

| Field           | Represents                                             |
| --------------- | ------------------------------------------------------ |
| `releaseDate`   | Tanggal rilis konten (mis. 2025-02-15)                 |
| `releaseYear`   | Tahun rilis jika tanggal lengkap tidak tersedia        |
| `releaseStatus` | Status rilis (released / upcoming / ongoing / unknown) |
| `createdAt`     | Waktu konten dimasukkan/diupdate di database           |
| `updatedAt`     | Waktu terakhir metadata diperbarui                     |

👉 **releaseDate ≠ createdAt**
`createdAt` = saat konten di-ingest ke local DB.
`releaseDate` = saat konten dirilis di provider.

---

## 🛠️ STEP 1: UPDATE DATABASE SCHEMA

### 🆕 Add fields to `contents` table

Tambahkan kolom berikut:

```ts
/**
 * Contents - Main metadata table with release date and rich classification
 */
export const contents = pgTable("contents", {
    ...,
    releaseDate: date("release_date"),
    releaseYear: integer("release_year"),
    releaseStatus: varchar("release_status", { length: 20 }).default("unknown"),
});
```

#### Field definitions

| Field           | Type      | Notes                                                        |
| --------------- | --------- | ------------------------------------------------------------ |
| `releaseDate`   | Date      | Preferable, if API provides yyyy-mm-dd                       |
| `releaseYear`   | Integer   | Fallback when only year available                            |
| `releaseStatus` | Enum/Text | Values: `'released'`, `'ongoing'`, `'upcoming'`, `'unknown'` |

---

## 🛠️ STEP 2: UPDATE PROVIDER NORMALIZERS

Supaya metadata rilis masuk ke DB, wajib update normalizers untuk semua provider.

### 🎯 Normalizer rules

#### Generic fallback logic

```ts
// Pseudocode (adapt to your project)
const normalizeReleaseInfo = (data) => {
  let releaseDate = null;
  let releaseYear = data.year ?? null;
  let releaseStatus = "unknown";

  if (data.release_date) {
    releaseDate = new Date(data.release_date);
    releaseYear = releaseDate.getFullYear();
    releaseStatus = releaseDate <= new Date() ? "released" : "upcoming";
  } else if (data.year) {
    releaseStatus = "released";
  }

  return { releaseDate, releaseYear, releaseStatus };
};
```

### ⚙️ Integrate into each normalizer

Contoh untuk `normalizeDramaBox`:

```ts
export function normalizeDramaBox(data, fetchedFrom) {
    const { releaseDate, releaseYear, releaseStatus } =
        normalizeReleaseInfo(data);

    return {
        provider: "dramabox",
        providerContentId: data.bookId,
        title: data.bookName || data.title || "Unknown Title",
        ...,
        releaseDate,
        releaseYear,
        releaseStatus,
        fetchedFrom,
        status: "active",
        popularityScore: 0,
        viewCount: 0,
    };
}
```

**Ulangi untuk semua normalizer** (`NetShort`, `Melolo`, `DramaQueen`, dll.)

---

## 🛠️ STEP 3: MIGRATE EXISTING DATA

Karena plan ini memperkenalkan kolom baru, konten lama harus dimigrasi.

### 🧹 Backfill releaseYear

Jika selama ini field `year` sudah ada:

```sql
UPDATE contents
SET releaseYear = year
WHERE releaseYear IS NULL AND year IS NOT NULL;
```

### 🧹 Set releaseStatus

```sql
UPDATE contents
SET releaseStatus = 'released'
WHERE releaseYear IS NOT NULL AND releaseStatus = 'unknown';
```

> Jika API/metadata lama tahu tanggal lengkap: update `releaseDate` juga.

### 🧑‍⚖️ Validasi

```sql
SELECT releaseDate, releaseYear, releaseStatus,
       COUNT(*) as count
FROM contents
GROUP BY releaseDate, releaseYear, releaseStatus
ORDER BY releaseYear DESC;
```

---

## 🛠️ STEP 4: UPDATE QUERY SORTING LOGIC

Setelah `releaseDate` ada, gunakan ini untuk sorting “Drama Terbaru”.

### 🆕 Query for newest dramas

```ts
.orderBy([
  desc(contents.releaseDate),
  desc(contents.createdAt)
])
```

**Prioritas:**

1. `releaseDate` (terbaru)
2. Jika `releaseDate` null → fallback pakai `createdAt`

---

## 🛠️ STEP 5: UPDATE EXPLORE API FILTERS

Sesuaikan endpoint `/api/explore/all-dramas` supaya pakai release fields saat sorting/labeling:

### 📍 Category: Release-based Sorting

```ts
if (category === "Latest Releases") {
  conditions.push(
    and(
      eq(contents.status, "active"),
      gt(contents.releaseDate, /* some date */)
    )
  );
}
```

Atau:

```ts
.orderBy(desc(contents.releaseDate), desc(contents.createdAt))
```

---

## 🛠️ STEP 6: UPDATE FRONTEND INTERFACES

Supaya data rilis ditampilkan:

### 🏷️ UI components

Tambahkan di card UI:

```tsx
{item.releaseDate ? (
  <Text>Rilis: {formatDate(item.releaseDate)}</Text>
) : (
  item.releaseYear && <Text>Tahun: {item.releaseYear}</Text>
)}
```

### 📌 Sorting UI (optional feature)

```tsx
<select>
  <option value="newest">Terbaru</option>
  <option value="popular">Terpopuler</option>
  <option value="year_asc">Tahun Terkecil</option>
  <option value="year_desc">Tahun Terbesar</option>
</select>
```

---

## 🛠️ STEP 7: OPTIONAL ENHANCEMENTS (NEXT PHASE)

### 🚀 A. Auto-Decay & Trending Logic

Dengan release date, kamu bisa hitung:

```ts
popularity * freshnessScore
```

Freshness score contohnya:

```
freshness = max(0, 30 − daysSinceRelease)
```

Ini berguna untuk rekomendasi “tren Minggu Ini”.

---

### 🚀 B. Release Status Tabs

Tambahkan di Explore:

* Upcoming
* Now Showing / Ongoing
* Completed

---

## 📁 Summary — Files to Update

| File                      | What to Add                               |
| ------------------------- | ----------------------------------------- |
| `schema.ts`               | Add releaseDate/releaseYear/releaseStatus |
| `provider-normalizers.ts` | Extract normal release info               |
| `content-repository.ts`   | Upsert migration of new fields            |
| `all-dramas/route.ts`     | Sorting with releaseDate                  |
| Frontend list views       | Show releaseDate/Year                     |
| Search & Suggest          | Optionally sort by releaseDate            |

---

## 📦 Example Snapshot: Final DB Schema

```ts
export const contents = pgTable("contents", {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: varchar("provider", { length: 50 }).notNull(),
    providerContentId: varchar("provider_content_id", { length: 100 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    releaseDate: date("release_date"),
    releaseYear: integer("release_year"),
    releaseStatus: varchar("release_status", { length: 20 }).default("unknown"),
    region: varchar("region", { length: 50 }),
    contentType: varchar("content_type", { length: 20 }),
    status: varchar("status", { length: 20 }).default("active"),
    // …rest of your fields
});
```

---

## 📅 Feature Map after Implementation

| Feature                        | Ready?     |
| ------------------------------ | ---------- |
| Explore sorted by release date | ✅          |
| Filter by country              | ✅          |
| “Drama Terbaru” section        | ✅          |
| Upcoming                       | ⚡ optional |
| Trending growth score          | ⚡ optional |
| Infinite scroll with cursor    | ✅          |

---

## 🎯 Final Notes

* **Migration:** release fields must be backfilled for existing data.
* **Display:** show release date if available; fallback ke release year.
* **Sorting:** always use release date first.