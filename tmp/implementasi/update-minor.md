## Rekomendasi Lanjutan (Opsional tapi Powerful)

Jika kamu mau naik level:

### A. Smart Fallback Search

Jika `search(q)` kosong → lakukan:

```
searchByTags(mapQueryToTags(q))
```

### B. Hybrid Scoring

Gabungkan:

* Exact title match
* Partial match
* Popularity score
* Recency

### C. Pre-index (Optional)

Cache judul populer ke Redis / Meilisearch untuk hasil instan.

---

# Update Minor 2

### Rekomendasi Final (Opsional, Tapi Powerful)

#### ✅ A. Tambahkan “Query Resolver”

Mapping keyword → kategori:

```ts
{
  "dewa": ["fantasy", "cultivation"],
  "cinta": ["romance"],
  "istri": ["marriage"]
}
```

Agar provider yang tidak mendukung full-text tetap bisa memberi hasil.

---

#### ✅ B. Tampilkan Status ke User (UX)

Contoh:

> “Beberapa hasil mungkin tidak tersedia di semua sumber.”

Ini mencegah kebingungan pengguna.

---

#### ✅ C. Tambahkan Confidence Score (Optional)

Ranking berdasarkan:

* title match
* popularity
* provider reliability

---
