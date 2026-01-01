# 🧠 TUJUAN UTAMA

Membuat **filter dinamis berbasis provider** (DramaBox, FlickReels, NetShort, Melolo, dll) yang:

* Tidak hardcoded
* Bisa berbeda antar provider
* Cepat (cache + lazy load)
* Mudah dikembangkan
* Konsisten dengan UX mobile/web

---

# 🧩 ARSITEKTUR GLOBAL

```
[ UI Filter ]
     ↓
[ Filter Adapter (Frontend) ]
     ↓
[ Unified Filter API ]
     ↓
[ Provider Adapter ]
     ↓
[ External APIs ]
```

---

# 1️⃣ STRUKTUR DATA FILTER (STANDARDIZED)

Setiap provider boleh berbeda, tapi **frontend hanya mengenal satu format standar**.

### 🔹 Standard Filter Schema (Frontend)

```ts
interface FilterGroup {
  key: string            // contoh: "region", "genre", "year"
  label: string          // "Wilayah", "Genre", "Tahun"
  type: "single" | "multi"
  options: FilterOption[]
}

interface FilterOption {
  label: string
  value: string
}
```

---

# 2️⃣ BACKEND: FILTER API DESIGN

### Endpoint

```
GET /api/filters/:provider
```

### Contoh:

```
/api/filters/dramabox
/api/filters/flickreels
/api/filters/melolo
```

### Response contoh (standar)

```json
{
  "provider": "dramabox",
  "filters": [
    {
      "key": "region",
      "label": "Wilayah",
      "type": "single",
      "options": [
        { "label": "China", "value": "china" },
        { "label": "Korea", "value": "korea" }
      ]
    },
    {
      "key": "category",
      "label": "Kategori",
      "type": "multi",
      "options": [
        { "label": "Romantis", "value": "romance" },
        { "label": "Sejarah", "value": "history" }
      ]
    },
    {
      "key": "year",
      "label": "Tahun",
      "type": "single",
      "options": ["2025", "2024", "2023"]
    }
  ]
}
```

---

# 3️⃣ BACKEND – STRATEGI IMPLEMENTASI

### Folder Structure

```
/services
 ├─ dramabox/
 │   ├─ filters.ts
 │   ├─ search.ts
 ├─ flickreels/
 │   ├─ filters.ts
 │   ├─ search.ts
 ├─ melolo/
```

### Contoh `filters.ts`

```ts
export async function getDramaboxFilters() {
  return {
    region: ["China", "Korea", "Japan"],
    category: ["Romance", "Historical", "Modern"],
    year: ["2025", "2024", "2023"]
  }
}
```

---

# 4️⃣ FRONTEND LOGIC

### Step 1 — Load Filter Saat Tab Dipilih

```ts
useEffect(() => {
  fetch(`/api/filters/${provider}`)
    .then(res => res.json())
    .then(setFilters)
}, [provider])
```

### Step 2 — Render Dinamis

```tsx
{filters.map(f => (
  <FilterGroup key={f.key} title={f.label} options={f.options} />
))}
```

---

# 5️⃣ QUERY BUILDING (PENTING)

Saat user memilih filter:

```ts
const params = {
  provider: "dramabox",
  region: selected.region,
  category: selected.category,
  year: selected.year,
}
```

⚠️ Jangan kirim parameter kosong.

---

# 6️⃣ SEARCH & FILTER COMBINATION

```ts
GET /api/search?
  provider=dramabox
  &q=putri
  &region=china
  &year=2024
```

Backend:

* gabungkan keyword + filter
* mapping ke API provider
* normalize hasil

---

# 7️⃣ CACHING STRATEGY (WAJIB)

| Data          | Cache       |
| ------------- | ----------- |
| Filter list   | 1–6 jam     |
| Search result | 1–5 menit   |
| Popular       | 10–30 menit |

Gunakan Redis atau in-memory LRU.

---

# 8️⃣ UX RULES (PENTING)

✔ Filter berubah → reset halaman
✔ Scroll → load next page
✔ Filter tidak tersedia → hidden
✔ Jangan tampilkan filter yang kosong
✔ UI tetap cepat walau API lambat

---