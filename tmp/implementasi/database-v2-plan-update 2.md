## 4️⃣ Dua risiko teknis yang perlu kamu sadari (penting)

Ini **bukan kesalahan**, tapi perlu diantisipasi.

---

### ⚠️ Risiko #1 — DB “catalog bias” ke Dramabox

Karena:

* Dramabox API lebih “kaya”
* Search & trending lebih sering dipanggil

Maka DB kamu kemungkinan:

* 70–90% konten Dramabox
* Provider lain minim

📌 Dampaknya:

* Semua Drama tab provider lain terasa “kosong”
* Padahal API-nya memang terbatas

**Mitigasi (opsional tapi disarankan):**

* Saat search fallback:

  * coba **semua provider**
* Atau:

  * background enrichment per provider

---

### ⚠️ Risiko #2 — Popularity score terlalu dipengaruhi ingestion

Kalau:

* Setiap ingestion → +score
* Trending API dipanggil sering

Maka:

* Popularity tidak mencerminkan user behavior

📌 Mitigasi:

* Pisahkan:

  * `ingest_score`
  * `user_score`

Atau minimal:

```text
popularity = user_interaction * 2 + ingest_signal
```
