## 🎯 Tujuan Akhir (Target Fitur)

1. Semua data user (history, favorites) disimpan di **database server** (tidak lagi hanya localStorage).
2. Mendukung **guest user** → tetap dapat menyimpan history, favorites.
3. Saat user **login**, semua data guest di-*merge* ke akun login.
4. Fitur resume watch → tepat ke detik terakhir.
5. Mendukung cross-device sync.

---

## 🛠 Komponen yang Diperlukan

### ⁉️ Tabel yang akan dipakai / dimodifikasi

1. **users**
2. **watch_history**
3. **favorites**

---

---

# ✅ 1) Guest User Management

### 🧠 Goal

User bisa browsing website tanpa login dan menyimpan:
✔ watch progress
✔ favorites

### 🔹 Sistem Guest ID

Gunakan `guest_id` yang disimpan di cookie / localStorage:

* Saat first visit:

  * generate `guest_id` (UUID)
* Persist di cookie sehingga tetap berlaku saat refresh / buka tab lain

### Contoh cookie (HTTP only / persistent)

```
guest_id=uuid-v4-token;
```

> Gunakan agar backend bisa membaca `guest_id` dari setiap request ketika user belum login.

---

## 📌 1A — Backend Middleware (guest detection)

### Pseudocode

```ts
function userIdentityMiddleware(req, res, next) {
  const clerkUserId = req.auth?.userId // from Clerk
  const guestId = req.cookies["guest_id"]

  if (clerkUserId) {
     req.userId = clerkUserId
  } else if (guestId) {
     req.userId = guestId
  } else {
     const newGuest = uuidv4()
     setCookie("guest_id", newGuest)
     req.userId = newGuest
  }

  next()
}
```

**Hasil:**
`req.userId` selalu ada → bisa dipakai di semua API.

---

## 📌 1B — Users Table Structure

Schema (production ready):

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,  -- clerk user id OR guest id
  is_guest BOOLEAN DEFAULT true,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Notes**

* id disimpan sebagai `clerk_x`, `guest_x`
* Guest bisa later diupdate menjadi real

---

## 📌 1C — Sync Users on Login

Endpoint:

```
POST /api/user/sync-session
```

Request body:

```json
{
  "clerkUserId": "abc123",
  "guestId": "uuid-guest"
}
```

Backend logic:

```ts
await db.users.upsert({
  id: clerkUserId,
  is_guest: false,
  email: user.email,
});
```

---

# ✅ 2) Watch History (DB-backed)

### 🎯 Goal

Simpan progress playback ke DB (per episode, per user).

### 📌 watch_history Schema

```sql
CREATE TABLE watch_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  content_id TEXT,    -- drama unique id
  episode_number INT,
  position INT,       -- last played second
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## 📌 2A — Save/Update History API

```
POST /api/watch/progress
```

Request:

```json
{
  "contentId": "dramabox_12345",
  "episode": 7,
  "position": 210  // seconds
}
```

Backend:

```ts
await db.watch_history.upsert({
  where: { user_id_content_id: { user_id, content_id } },
  update: { episode_number, position, updated_at: now() },
  create: { user_id, content_id, episode_number, position }
});
```

---

## 📌 2B — Continue Watch API

```
GET /api/watch/continue?contentId=dramabox_12345
```

Backend:

```ts
SELECT episode_number, position
FROM watch_history
WHERE user_id = req.userId
  AND content_id = contentId;
```

Frontend:

* Ambil response
* Langsung skip video ke saved position

---

# ✅ 3) Favorites (DB-backed)

### 📌 favorites Schema

```sql
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  content_id TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 📌 3A — Toggle Favorite API

```
POST /api/favorites/toggle
```

Body:

```json
{ "contentId": "dramabox_12345" }
```

Backend logic:

```ts
const exists = await db.favorites.findUnique({ where: { user_id_content_id } });

if (exists) {
  await db.favorites.delete({ where: { user_id_content_id } });
  return { favorited: false };
}
await db.favorites.create({ data: { user_id, content_id } });
return { favorited: true };
```

---

## 📌 3B — List Favorites

```
GET /api/favorites
```

Backend:

```ts
SELECT c.*
FROM favorites f
JOIN contents c ON c.id = f.content_id
WHERE f.user_id = req.userId;
```

---

# ✅ 4) Guest → Login Merge

### 🎯 Goal

Saat login, semua data local dari guest pindah ke user:

* watch_history
* favorites

---

## 📌 4A — Merge API

```
POST /api/user/merge
```

Body:

```json
{ "guestId": "uuid-guest", "userId": "clerk-xyz" }
```

Backend logic:

```ts
await db.watch_history.updateMany({
  where: { user_id: guestId },
  data: { user_id: userId }
});

await db.favorites.updateMany({
  where: { user_id: guestId },
  data: { user_id: userId }
});
```

👉 Setelah itu hapus guest row:

```ts
await db.users.delete({ where: { id: guestId } });
```

---

# ✅ 5) Frontend Flow (Summary)

### 📌 Guest behavior

* On initial load → generate/remember `guestId`
* Save playback & favorite to localStorage **AND** backend
* Sync to DB every action

### 📌 After login

* Call merge API
* Replace localStorage with DB state
* Continue using DB for all user data

---

# ✅ 6) Summary Implementation Steps

| Step | Feature                      |
| ---- | ---------------------------- |
| 1    | Guest identity system        |
| 2    | Users table sync             |
| 3    | Watch history DB persistence |
| 4    | Favorites DB persistence     |
| 5    | Guest → Login merge          |
| 6    | Continue watch UX            |
| 7    | Sync favorites on login      |
| 8    | Cleanup localStorage         |

---

# 🔌 Next (Opsional + Strongly Recommended)

Once core is done:

### 📍 Add endpoints:

* `GET /api/profile`
* `GET /api/user/stats`
* `GET /api/watch/recent`

### 📍 Support:

* Favorite count
* Completion rate (for recommendation)
* History timeline

---