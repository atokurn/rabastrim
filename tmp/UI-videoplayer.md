# ✅ TARGET BEHAVIOR

Ketika user:

* Menonton episode
* Scroll ke bawah
* Video sebelumnya naik keluar layar
* Episode berikutnya **langsung play otomatis**
* Tanpa reload halaman
* Tanpa reload player
* Tanpa jeda hitam

➡️ Ini disebut **“Vertical Continuous Playback”**

---

# 🧠 CARA KERJA TEKNIS (HIGH LEVEL)

```
[Video Player 1]
        ↓ scroll
[Video Player 2]  ← preload
        ↓ scroll
[Video Player 3]
```

Bukan reload halaman, tapi:

* **reuse player**
* **swap video source**
* **preload episode berikutnya**

---

# 🧩 ARSITEKTUR YANG BENAR

### 1️⃣ Single Page Player (SPA)

Jangan ganti page `/watch/:id`.

Gunakan:

* **1 halaman**
* **1 video element**
* Konten berganti secara dinamis

Contoh:

```tsx
<VideoPlayer src={currentEpisode.url} />
```

---

### 2️⃣ Scroll-based Episode Trigger (Kunci utama)

Gunakan **IntersectionObserver**:

```ts
const observer = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      playNextEpisode();
    }
  },
  { threshold: 0.9 }
);
```

Saat user scroll mendekati bawah → load next episode.

---

### 3️⃣ Preload Episode Berikutnya (WAJIB)

Begitu episode N mulai diputar:

```ts
preloadVideo(nextEpisode.url);
```

Cara preload:

```ts
const video = document.createElement("video");
video.src = nextUrl;
video.preload = "auto";
```

Jadi saat pindah → **tidak ada buffering**.

---

### 4️⃣ Smooth Transition (UI)

Saat video hampir selesai:

* Fade out video lama
* Fade in video baru
* Tanpa reload

Efek seperti TikTok / Reels.

---

### 5️⃣ Auto Play + Resume

```ts
video.addEventListener("ended", () => {
  playNextEpisode();
});
```

Dan simpan posisi tiap 5–10 detik:

```ts
onTimeUpdate => saveProgress(time)
```

---

# 🧠 FLOW LENGKAP (END-TO-END)

```text
User scroll ↓
→ detect scroll near bottom
→ preload next episode
→ crossfade video
→ update URL (history.pushState)
→ update title & metadata
→ continue playback
```

---

# 📦 STRUKTUR DATA YANG DISARANKAN

```json
{
  "currentEpisode": {
    "id": "ep_12",
    "url": "cdn/ep12.m3u8",
    "next": "ep_13"
  }
}
```

---

# 🧩 TEKNOLOGI YANG COCOK

| Kebutuhan       | Solusi                 |
| --------------- | ---------------------- |
| Video Player    | HTML5 Video / Video.js |
| Infinite Scroll | IntersectionObserver   |
| Preload         | `<link rel="preload">` |
| State           | React state / Zustand  |
| Animasi         | Framer Motion          |
| Streaming       | HLS (.m3u8)            |



# UPDATE IMPLEMENTASI

### 1️⃣ Tambahkan “Playback State Machine”

Saat ini flow masih implicit. Sebaiknya eksplisit:

```ts
enum PlayerState {
  IDLE,
  LOADING,
  PLAYING,
  PAUSED,
  BUFFERING,
  ENDED
}
```

Ini akan:

* Menghindari race condition
* Memudahkan debugging
* Mencegah double play / double load

---

### 2️⃣ Gunakan “Episode Buffer Pool”

Alih-alih preload 1 episode saja, gunakan buffer:

```ts
buffer = [prev, current, next]
```

Ketika user scroll:

* Buang oldest
* Load next

Efeknya: **zero lag**.

---

### 3️⃣ Visibility-based Pause

Gunakan:

```ts
document.visibilitychange
```

Agar video otomatis pause saat:

* User pindah tab
* App di background

---

### 4️⃣ Optimasi Memory Mobile

Jangan simpan banyak video element:

* Maksimal 2–3 `<video>` aktif
* Sisanya destroy

Ini mencegah crash di Android low-end.

---

### 5️⃣ Tambahkan Graceful Fallback

Jika preload gagal:

* tampilkan loading fallback
* retry silent
* jangan blank screen

---

## 🔐 SECURITY & STABILITY (OPSIONAL TAPI DISARANKAN)

* Signed URL untuk video
* Expired token (1–5 menit)
* Rate limit per IP