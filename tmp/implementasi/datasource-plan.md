## 🔧 CARA MENAMBAHKAN DATA SOURCE BARU (Pola Resmi)

### 1️⃣ Buat Adapter per Sumber (WAJIB)

Setiap API eksternal → satu adapter.

Contoh struktur:

```
/lib/sources/
  ├── dramabox.ts
  ├── iqiyi.ts
  ├── wetv.ts
  ├── local.ts
```

Masing-masing **menghasilkan format data yang SAMA**.

### Contoh interface standar:

```ts
interface SearchItem {
  id: string
  title: string
  thumbnail: string
  source: 'dramabox' | 'iqiyi' | 'wetv'
  year?: number
  rating?: number
}
```

---

### 2️⃣ Normalisasi (WAJIB)

Semua data API diubah ke bentuk yang sama:

```ts
function normalizeDramaBox(data): SearchItem {
  return {
    id: data.bookId,
    title: data.bookName,
    thumbnail: data.cover,
    source: "dramabox"
  }
}
```

Ini kunci supaya frontend **tidak peduli dari mana data berasal**.

---

### 3️⃣ Aggregator (Core Logic)

```ts
async function searchAllSources(query: string) {
  const results = await Promise.all([
    searchDramaBox(query),
    searchIqiyi(query),
    searchWeTV(query)
  ])

  return results.flat()
}
```

➡ Bisa diatur:

* paralel
* prioritas
* fallback
* timeout per sumber

---

### 4️⃣ Cache di Atas Semua Source

```txt
search:query=love
   ↓
Redis
   ↓ (miss)
Call all sources
   ↓
Merge + cache
```

Kamu **tidak memanggil API berulang-ulang**.

---

### 5️⃣ Search API Tetap Sama

Frontend **tidak perlu tahu** dari mana data berasal:

```
GET /api/search?q=love
```

Backend bebas berkembang.


---

## 🚀 Rekomendasi Lanjutan (Opsional tapi Kuat)

1. **Tambahkan weight per source**

   * Misal DramaBox > iQIYI > lainnya

2. **Search fallback**

   * Jika API A gagal → B otomatis

3. **Cache TTL berbeda per source**

4. **Feature flag**

   * Aktif/nonaktif sumber tertentu

---
