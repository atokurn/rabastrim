## 🧠 KONSEP UTAMA (WAJIB PAHAM)

### ❌ Yang TIDAK disarankan

* Dua video player berbeda (satu mobile, satu desktop)
* Logic play/pause terpisah
* API terpisah untuk mobile & desktop

### ✅ Yang BENAR

**Satu video engine, dua mode UI (responsive behavioral)**

> Video tetap satu (HLS, same source),
> tapi cara **ditampilkan & dikontrol** berbeda.

---

## 🔹 STRUKTUR YANG DISARANKAN

```
<VideoPlayerProvider>
 ├── <MobilePlayerUI />   // untuk portrait, swipe, short-video
 └── <DesktopPlayerUI />  // untuk landscape, full control
```

Keduanya menggunakan **state & engine yang sama**.

---

## 🧩 CARA MENENTUKAN MODE (PENTING)

Gunakan kombinasi:

```ts
const isMobile = useMediaQuery('(max-width: 768px)')
const isTouch = 'ontouchstart' in window
```

Atau pakai lib:

```ts
import { useMediaQuery } from 'react-responsive'
```

Lalu:

```tsx
{isMobile ? <MobilePlayer /> : <DesktopPlayer />}
```

---

## 🎬 MODE MOBILE (Seperti TikTok / Reels)

### Ciri-ciri:

* Video fullscreen (9:16)
* Swipe up/down → episode berikutnya
* Auto play
* Overlay minimal
* Tidak ada timeline panjang

### Komponen:

```
<MobilePlayer>
  <Video />
  <OverlayControls />
  <EpisodeListSheet />
</MobilePlayer>
```

### Perilaku:

* Scroll → ganti episode
* Auto preload next episode
* Tap = pause/play

---

## 🖥️ MODE DESKTOP (Seperti iQIYI)

### Ciri:

* Landscape player
* Sidebar episode list
* Kontrol penuh
* Keyboard shortcuts

### Komponen:

```
<DesktopPlayer>
  <Video />
  <EpisodeSidebar />
  <Description />
</DesktopPlayer>
```

---

## 🔄 PERBEDAAN PERILAKU (PENTING)

| Fitur              | Mobile     | Desktop  |
| ------------------ | ---------- | -------- |
| Autoplay           | Ya         | Opsional |
| Scroll to next     | Ya         | Tidak    |
| Multi episode view | Tidak      | Ya       |
| Player size        | Fullscreen | Embedded |
| Keyboard           | ❌          | ✅        |

---

## 🎯 IMPLEMENTASI TEKNIS (CONTOH)

### 1️⃣ Video Engine (shared)

```ts
export function useVideoPlayer() {
  return {
    play,
    pause,
    seek,
    loadSource,
    onEnd,
  }
}
```

### 2️⃣ Mobile Wrapper

```tsx
function MobilePlayer() {
  const { playNext } = usePlayer();

  useEffect(() => {
    // auto load next episode
  }, []);

  return <VideoFullScreen />;
}
```

### 3️⃣ Desktop Wrapper

```tsx
function DesktopPlayer() {
  return (
    <>
      <Video />
      <SidebarEpisodes />
    </>
  );
}
```
