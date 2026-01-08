# ✅ IMPLEMENTATION PLAN — Enhanced Release Date & Cursor Pagination

📌 **Goal:**
Meningkatkan sistem sorting & pagination supaya:

* sorting berdasarkan `releaseDate` tertinggi dulu
* pagination stabil tanpa duplikasi/skip
* data besar (>5000 drama) tetap performa tinggi
* release data tetap bisa di‐fallback ke createdAt
* future features (upcoming/ongoing) bisa dibangun

---

## 🧱 1. Database Enhancements (Schema + Index)

### 1.1. Add new columns — already done

Pastikan di schema:

```ts
releaseDate: date("release_date"),
releaseYear: integer("release_year"),
releaseStatus: varchar("release_status", { length: 20 }).default("unknown"),
contentType: varchar("content_type", { length: 20 }),
region: varchar("region", { length: 50 }),
```

---

### 1.2. Add indexing (performance critical)

**Why:**
Tanpa index, `ORDER BY releaseDate` pada tabel besar akan lambat.

**Add:**

```sql
CREATE INDEX idx_contents_release_date ON contents (release_date DESC NULLS LAST);
CREATE INDEX idx_contents_release_year ON contents (release_year DESC);
CREATE INDEX idx_contents_release_status ON contents (release_status);
CREATE INDEX idx_contents_region ON contents (region);
CREATE INDEX idx_contents_content_type ON contents (content_type);
```

Jika DB besar nanti, kamu bisa eksperimen index composite:

```sql
CREATE INDEX idx_contents_release_composite
ON contents ((COALESCE(release_date, created_at)) DESC);
```

---

## 📐 2. Cursor Pagination Using Composite Cursor

### Why composite cursor?

Karena:

* `releaseDate` bisa sama untuk banyak item
* `createdAt` juga bisa sama
* `id` bisa jadi tiebreaker terakhir

### 2.1. Add cursor fields in API schema

Pada response API:

```ts
interface PaginatedResponse {
  data: NormalizedItem[];
  nextCursor?: string; // encoded cursor
  hasMore: boolean;
}
```

Cursor encoded di client mesti berisi:

```
releaseDate|createdAt|id
```

Contoh:

```
2025-02-14|2025-02-18T10:30:00Z|uuid-123
```

---

## 📊 3. Update Backend Pagination Logic

### 3.1. Build composite cursor condition

Di `GET /api/explore/all-dramas` route:

```ts
const cursor = searchParams.get("cursor"); 
```

Parse cursor:

```ts
let cursorReleaseDate, cursorCreatedAt, cursorId;

if (cursor) {
  [cursorReleaseDate, cursorCreatedAt, cursorId] = cursor.split("|");
}
```

### 3.2. Modify WHERE clause

Tambahkan composite cursor logic:

```ts
if (cursor) {
  conditions.push(
    or(
      sql`
        (${contents.releaseDate} < ${cursorReleaseDate})
      `,
      and(
        sql`${contents.releaseDate} = ${cursorReleaseDate}`,
        sql`${contents.createdAt} < ${cursorCreatedAt}`
      ),
      and(
        sql`${contents.releaseDate} = ${cursorReleaseDate}`,
        sql`${contents.createdAt} = ${cursorCreatedAt}`,
        sql`${contents.id} < ${cursorId}`
      )
    )
  );
}
```

Ini memastikan:

* semua dengan releaseDate lebih baru muncul dulu
* kalau sama releaseDate → compare createdAt
* kalau sama createdAt → compare id (unique)

---

## 📈 4. Update ORDER BY Clause

Gunakan composite sort:

```ts
.orderBy(
  desc(contents.releaseDate),
  desc(contents.createdAt),
  desc(contents.id)
)
```

atau jika kamu pakai COALESCE:

```ts
.orderBy(
  desc(sql`COALESCE(${contents.releaseDate}, ${contents.createdAt})`),
  desc(contents.createdAt),
  desc(contents.id)
)
```

---

## 🍿 5. Fallback & Edge Case Handling

### 5.1. Fallback when no releaseDate

Karena API bisa:

* hanya punya year
* tidak punya release info

Gunakan `createdAt` sebagai fallback:

* releaseDate = null → treated as older than any real date
* createdAt used for pagination & sorting

---

## 🧪 6. Migration Script Additions

Pastikan semua data lama punya:

✔ `releaseYear`
✔ `releaseStatus`

Migration SQL (enhanced):

```sql
-- Backfill releaseYear from year
UPDATE contents
SET release_year = year
WHERE release_year IS NULL AND year IS NOT NULL;

-- Mark releaseStatus accordingly
UPDATE contents
SET release_status = 'released'
WHERE release_year IS NOT NULL AND release_status = 'unknown';

-- If content likely ongoing
UPDATE contents
SET release_status = 'ongoing'
WHERE status = 'active' AND release_date > NOW();

-- If future releaseDate
UPDATE contents
SET releaseStatus = 'upcoming'
WHERE release_date > NOW();
```

---

## 📦 7. Update API Response

Return `releaseDate` and `releaseStatus` to frontend:

```json
{
  "id": "uuid",
  "title": "Drama A",
  "image": "...",
  "provider": "dramabox",
  "releaseDate": "2025-02-14",
  "releaseStatus": "released",
}
```

Frontend can then use:

* “Baru Rilis” label
* “Akan Tayang” highlight
* “Sedang Tayang” tag

---

## 🧠 8. Update Frontend Behavior

### 8.1. Sorting UI

Add drop-down:

```
– Newest
– Oldest
– Trending (popularity)
– Upcoming
```

### 8.2. Infinite scroll

Store cursor as:

```tsx
const cursor = `${releaseDate}|${createdAt}|${id}`;
```

---

## 🧪 9. Testing Checklist

Before merging:

### Backend

* [ ] Cursor pagination works across multiple pages
* [ ] Sorting respects releaseDate primary
* [ ] ReleaseStatus logic correct (released/upcoming/ongoing)
* [ ] Fallback works when releaseDate null

### Frontend

* [ ] Infinite scroll loads correctly
* [ ] UI labels based on `releaseStatus`
* [ ] Sorting UI triggers correct behavior

---

## 🧾 10. Monitoring & Logging

Add logs for:

* ingested record with missing release info
* fallback API usage
* pagination breaks (debug info)

This helps future debugging.

---

## 📌 Summary: What This Plan Gives You

| Feature                                | Ready?       |
| -------------------------------------- | ------------ |
| Real release-based sorting             | ✅            |
| Stable cursor pagination (no dupes)    | ✅            |
| Multi-provider normalized release info | ✅            |
| Upcoming/ongoing support               | ⚡ (ready)    |
| Sorting UI                             | ⚡ (needs FE) |
| Trending by freshness                  | ⚡ (future)   |

---