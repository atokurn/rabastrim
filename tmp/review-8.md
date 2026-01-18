# ✅ Evaluasi Umum

| Aspek                     | Penilaian |
| ------------------------- | --------- |
| Kesesuaian dengan Drizzle | ✅         |
| FK ke users (UUID)        | ✅         |
| Subscription lifecycle    | ✅         |
| Credit system             | ✅         |
| Logging transaksi         | ✅         |
| Bonus credit              | ✅         |
| UX flow                   | ✅         |
| Skalabilitas              | ✅         |

Secara desain: **tidak ada kesalahan fundamental**.

---

# 🔧 Catatan Perbaikan & Penyempurnaan

Semua poin yang kamu tulis itu **tepat**.
Berikut tambahan kecil yang bisa meningkatkan robustness:

---

## 1. Subscription Status Handling

Saat ini:

```sql
status TEXT NOT NULL -- 'active', 'expired'
```

Saran:
Tambahkan `canceled` dan `pending`:

```sql
status TEXT NOT NULL DEFAULT 'active'
-- active | expired | canceled | pending
```

Ini penting kalau:

* Payment belum lunas
* User cancel
* Payment gateway delay

---

## 2. Credit Balance Consistency (Atomic Update)

Pastikan penggunaan credit **selalu pakai transaction**:

```ts
await db.transaction(async (tx) => {
  const balance = await tx.credits.find(...)

  if (balance < amount) throw new Error("Not enough credits")

  await tx.credits.update(...)
  await tx.creditTransactions.insert(...)
  await tx.unlockedEpisodes.insert(...)
})
```

Tanpa ini:

* Bisa terjadi race condition
* Balance bisa minus

---

## 3. Subscription Plan Table = Keputusan Tepat

Menambahkan:

```sql
subscription_plans
```

adalah **keputusan terbaik** karena:

| Manfaat           | Dampak          |
| ----------------- | --------------- |
| Harga bisa diubah | Tanpa redeploy  |
| Promo mudah       | Cukup update DB |
| A/B test          | Bisa            |
| Event pricing     | Bisa            |
| Bundle credit     | Bisa            |

Ini jauh lebih fleksibel daripada hardcoded plan.

---

## 4. Episode Unlock Tracking = Wajib

Table:

```sql
unlocked_episodes
```

Ini penting karena:

* User tidak perlu bayar 2x
* Bisa sync cross-device
* Bisa dipakai untuk rekomendasi
* Bisa audit fraud

Keputusan kamu menambah ini: **sangat tepat**.

---

## 5. UX Flow Recommendation

Tambahkan 3 status di UI:

### A. VIP

> “Akses penuh semua episode”

### B. Credit User

> “Gunakan 5 credit untuk membuka episode ini”

### C. Free

> “Upgrade untuk lanjut menonton”

Ini membuat user **tidak bingung**.

---

## 6. Security Checkpoints

Tambahkan validasi:

| Check                      | Kenapa               |
| -------------------------- | -------------------- |
| Subscription belum expired | Hindari akses ilegal |
| Credit >= cost             | Hindari minus        |
| Episode sudah unlocked     | Jangan potong credit |
| Payment webhook verified   | Anti-fraud           |

---

## 7. Execution Order Kamu Sudah Ideal

Urutan yang kamu tulis:

1. DB Migration
2. Drizzle Schema
3. Service Layer
4. API
5. UI
6. Webhook

Itu **urutan yang benar** dan minim risiko bug.

---