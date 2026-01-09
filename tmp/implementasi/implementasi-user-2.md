## Akar Masalah yang Terjadi Sekarang

1. Data user masih sebagian:

   * localStorage
   * sebagian di DB
2. Sinkronisasi:

   * Hanya saat login
   * Atau saat refresh
3. Tidak ada mekanisme:

   * Auto-pull
   * Background sync
   * Cross-tab sync
4. Multi-device:

   * Device A update
   * Device B belum tahu

Akibatnya:

> UI terlihat “kosong” atau tidak update sampai reload.

---

## Target Solusi

Yang kita inginkan:

| Kriteria              | Target |
| --------------------- | ------ |
| Terasa real-time      | ✅      |
| Tidak berat           | ✅      |
| Tidak perlu WebSocket | ✅      |
| Support multi-device  | ✅      |
| Tidak spam API        | ✅      |
| Offline-friendly      | ✅      |

---

## Solusi Inti (Tanpa WebSocket)

Kita gunakan **4 lapisan sinkronisasi ringan**:

---

### 1. Optimistic UI (Instant Feedback)

Saat user:

* Nonton video
* Add favorite
* Like episode

Langsung update **Zustand + localStorage**
TANPA menunggu API.

```ts
store.addHistory(item) // langsung update UI
```

API sync jalan di background.

➡️ UI terasa instan.

---

### 2. Background Sync (Auto-Pull)

Setiap beberapa detik, app cek:

```ts
GET /api/user/me?lastSync=timestamp
```

Kalau ada data baru → update store.

Gunakan:

```ts
setInterval(() => syncFromServer(), 30_000)
```

Atau:

```ts
requestIdleCallback(syncFromServer)
```

➡️ Sinkron tanpa ganggu performa.

---

### 3. Cross-Tab Sync (BroadcastChannel)

Kalau user buka Rabastrin di 2 tab:

```ts
const channel = new BroadcastChannel("rabastrim_sync");

channel.postMessage({ type: "HISTORY_UPDATED" });
```

Tab lain langsung refresh data.

➡️ Real-time antar tab.

---

### 4. Login / Focus Sync

Saat:

* User login
* Tab aktif lagi
* App di-focus

Trigger:

```ts
syncFromServer();
```

➡️ Data selalu fresh saat user kembali.

---

## Arsitektur Final Sinkronisasi

```
User Action
   ↓
Update Zustand + localStorage (Instant)
   ↓
Background API Sync (PUSH)
   ↓
Server Update
   ↓
Periodic Pull / Focus Pull
   ↓
Update Store
```

Hasil:

* UI selalu cepat
* Data konsisten
* Tidak spam API

---

## Implementasi Praktis (Step-by-Step)

### 1. Buat Sync Hook

```ts
useUserSync({
  interval: 30000,
  onFocus: true,
  onLogin: true,
  crossTab: true
});
```

---

### 2. Optimistic Update

Saat update history:

```ts
store.addHistory(item);
syncToServer(item);
```

---

### 3. Background Pull

```ts
setInterval(() => {
  syncFromServer();
}, 30000);
```

---

### 4. Cross-Tab

```ts
channel.onmessage = () => syncFromServer();
```

---

### 5. Multi-Device Conflict

Server pakai:

```sql
ORDER BY updated_at DESC
```

Data terbaru menang.

---

## Kalau Mau “Lebih Real-Time Lagi”

Kalau suatu saat:

* User > 100K
* Traffic tinggi
* Multi-device aktif

Baru pertimbangkan:

* Server-Sent Events (SSE)
* WebSocket
* Supabase Realtime

**Tapi untuk sekarang: tidak perlu.**

---

## Dampak ke Performa

| Faktor                 | Dampak        |
| ---------------------- | ------------- |
| API call tiap 30 detik | Sangat ringan |
| Optimistic UI          | 0 ms delay    |
| BroadcastChannel       | Lokal, cepat  |
| Focus sync             | Occasional    |
| Tanpa WebSocket        | Lebih hemat   |

➡️ **Website tetap cepat.**

---

## Kenapa Solusi Ini Cocok Untuk Rabastrin?

Karena Rabastrin:

* Mobile-first
* Guest-heavy
* Streaming platform
* Banyak user pasif
* Tidak butuh real-time chat

Yang dibutuhkan:

> “Terasa real-time”, bukan real-time absolut.

---

## Rekomendasi Final

### Implementasikan:

1. Optimistic UI
2. Background Pull (30s)
3. Cross-tab sync
4. Focus sync

### Jangan dulu:

❌ WebSocket
❌ Realtime DB
❌ Push server

---