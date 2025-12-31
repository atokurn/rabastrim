# 🚀 IMPLEMENTATION PLAN

### Unified Search Engine (Multi-Provider Search)

---

## 🎯 TUJUAN UTAMA

Membuat sistem pencarian **akurat, konsisten, dan scalable** meskipun setiap provider memiliki **cara pencarian yang berbeda** (full-text vs category-based).

---

## 1️⃣ Masalah Inti (Root Cause)

| Masalah                          | Penyebab                                                   |
| -------------------------------- | ---------------------------------------------------------- |
| Hasil hanya muncul dari Dramabox | Hanya Dramabox mendukung full-text search                  |
| Melolo / NetShort selalu kosong  | Mereka **tidak mendukung text search**, hanya category/tag |
| Search UI sudah benar            | Backend belum menormalisasi query                          |
| API seolah "rusak"               | Padahal perilaku API berbeda-beda                          |

---

## 2️⃣ Solusi Arsitektur (Final Decision)

### 🔹 Pendekatan: **Hybrid Search Engine**

> 🔥 Gabungan:
>
> * **Full-text search** (untuk provider yang mendukung)
> * **Keyword → Category Mapping** (untuk provider terbatas)

---

## 3️⃣ Arsitektur Sistem (High-Level)

```
[User Input]
     ↓
[Query Normalizer]
     ↓
[Keyword Mapper]
     ↓
┌──────────────┬──────────────┬──────────────┐
│  Dramabox    │   Melolo     │  NetShort    │
│ (Full-text)  │ (By Tag)     │ (By Tag)     │
└──────┬───────┴──────┬───────┴──────┬───────┘
       ↓              ↓              ↓
        ------- Merge & Rank -------
                    ↓
               Final Result
```

---

## 4️⃣ Step-by-Step Implementation

---

### **STEP 1 — Query Normalization Layer**

📍 File: `lib/search/normalize.ts`

```ts
export function normalizeQuery(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
}
```

---

### **STEP 2 — Keyword → Category Mapping**

📍 `lib/search/keywordMap.ts`

```ts
export const KEYWORD_MAP = {
  "cinta": ["romance"],
  "romantis": ["romance"],
  "ceo": ["ceo", "boss"],
  "dewa": ["cultivation", "immortal"],
  "sakti": ["power"],
  "istri": ["marriage"],
  "balas dendam": ["revenge"],
  "sekolah": ["school"],
  "kampus": ["campus"],
  "dokter": ["doctor"],
  "pengusaha": ["business"]
};
```

---

### **STEP 3 — Query Resolver (Core Logic)**

📍 `lib/search/resolveQuery.ts`

```ts
export function resolveSearchQuery(q: string) {
  const normalized = normalizeQuery(q)

  const mappedTags =
    Object.entries(KEYWORD_MAP)
      .filter(([key]) => normalized.includes(key))
      .flatMap(([_, tags]) => tags)

  return {
    textQuery: normalized,
    tags: [...new Set(mappedTags)]
  }
}
```

---

### **STEP 4 — Multi-Source Search Execution**

📍 `api/search/route.ts`

```ts
const { textQuery, tags } = resolveSearchQuery(query)

const results = await Promise.allSettled([
  searchDramabox(textQuery),
  searchMelolo(tags),
  searchNetShort(tags)
])

const normalizedResults = mergeAndRank(results)
return Response.json(normalizedResults)
```

---

### **STEP 5 — Ranking & Deduplication**

Ranking priority:

1. Exact title match
2. Provider priority (Dramabox > Melolo > NetShort)
3. Popularity score
4. Episode count

```ts
function rankResults(items) {
  return items
    .filter(uniqueById)
    .sort((a, b) => b.score - a.score)
}
```

---

### **STEP 6 — Caching Strategy (Sudah Benar)**

| Data           | TTL  |
| -------------- | ---- |
| Search result  | 120s |
| Popular search | 300s |
| Suggestion     | 60s  |

📌 Gunakan Redis key:

```
search:{normalized_query}:{page}
```

---

### **STEP 7 — Frontend Integration**

Frontend **tidak berubah**, cukup:

```ts
GET /api/search?q=dewa
```

Backend akan:

* menentukan provider
* merge hasil
* return unified format

---

## 8️⃣ Optional (Advanced)

| Fitur                  | Status      |
| ---------------------- | ----------- |
| ML Ranking             | Opsional    |
| Click-based relevance  | Recommended |
| Search analytics       | Recommended |
| Auto synonym expansion | Optional    |
| Trending cache         | Sudah siap  |

---