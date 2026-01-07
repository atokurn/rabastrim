# 🎯 GOAL IMPLEMENTATION

Setelah implementasi ini:
✅ Homepage dan “Semua Drama” sepenuhnya menggunakan DB lokal
✅ Search & Suggest 100% dari DB dulu → API fallback
✅ Provider API hanya dipakai untuk ingestion & playback
✅ Infinite scroll stabil tanpa bergantung API eksternal

---

## 📌 1. DATABASE SCHEMA FINAL

### 1.1 `contents`

```sql
CREATE TABLE contents (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_content_id TEXT NOT NULL,
  title TEXT NOT NULL,
  alt_titles TEXT[],
  description TEXT,
  poster_url TEXT,
  year INTEGER,
  region TEXT[],
  tags TEXT[],
  is_series BOOLEAN DEFAULT false,
  episode_count INTEGER DEFAULT 0,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'hidden',
  popularity_score INTEGER DEFAULT 0,
  fetched_at TIMESTAMP NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_content_id)
);
```

### 1.2 `drama_cache` (API response caching)

```sql
CREATE TABLE drama_cache (
  cache_key TEXT PRIMARY KEY,
  provider TEXT,
  payload JSONB,
  cached_at TIMESTAMP DEFAULT now()
);
```

### 1.3 `episode_cache`

```sql
CREATE TABLE episode_cache (
  cache_key TEXT PRIMARY KEY,
  provider TEXT,
  payload JSONB,
  cached_at TIMESTAMP DEFAULT now()
);
```

### 1.4 `episodes_metadata`

```sql
CREATE TABLE episodes_metadata (
  id SERIAL PRIMARY KEY,
  content_id INTEGER REFERENCES contents(id),
  episode_number INTEGER,
  episode_title TEXT,
  duration INTEGER,
  extra_metadata JSONB,
  UNIQUE (content_id, episode_number)
);
```

### *Optional later*:

* `watch_history`
* `favorites`
* `users`
  (bisa ditunda sampai backend user sync siap)

---

## 📌 2. SYNC LOGIC & WORKERS

### 2.1 Ingestion Strategy

Gunakan **worker or sync functions** untuk:

```
fetch provider API → normalize → upsert contents ⇒ DB
```

Contoh worker/runner:

```
/services/sync/dramabox.ts
/services/sync/netshort.ts
/services/sync/melolo.ts
```

---

## 📌 3. INGEST API → DB FLOW (WRAPPED)

### A. Normalize function (core abstraction)

```ts
async function normalizeProviderDrama(provider, raw) {
  return {
    provider,
    provider_content_id: raw.bookId,
    title: raw.bookName,
    alt_titles: [raw.bookName],
    description: raw.introduction,
    poster_url: raw.cover,
    year: raw.year ?? null,
    region: raw.region ? raw.region.split(',') : null,
    tags: raw.tagNames ?? [],
    is_series: true,
    episode_count: raw.totalEpisodes ?? 0,
    source: 'trending'
  }
}
```

### B. Upsert logic

```ts
await db.query(`
  INSERT INTO contents(provider, provider_content_id, title, ...)
  VALUES (...)
  ON CONFLICT (provider, provider_content_id)
  DO UPDATE SET
    title = EXCLUDED.title,
    poster_url = EXCLUDED.poster_url,
    ...
`);
```

→ Upsert penting untuk **menghindari duplikasi**.

---

## 📌 4. HOMEPAGE / EXPLORE — DATABASE FIRST

### API Route (backend)

```ts
GET /api/explore/all
```

```ts
SELECT *
FROM contents
WHERE status = 'active'
ORDER BY popularity_score DESC
LIMIT 20 OFFSET 0;
```

### Infinite scroll

```sql
SELECT *
FROM contents
WHERE status = 'active'
AND id < :lastId
ORDER BY popularity_score DESC
LIMIT 20;
```

atau dengan cursor:

```ts
cursor-based fetch next batch
```

---

## 📌 5. SEARCH & SUGGEST

### 5.1 Search Suggest Logic

```ts
GET /api/search/suggest?q=putri
```

**Step 1 — DB first**

```sql
SELECT id, title
FROM contents
WHERE title ILIKE 'putri%'
ORDER BY popularity_score DESC
LIMIT 8;
```

**Step 2 — If result < 4**

call provider API search fallback

```ts
const apiResults = await providerSearch(q);
```

upsert new content
return combined results

cache these suggestions (Redis / memory TTL 60s)

---

### 5.2 Full Search

```sql
SELECT *
FROM contents
WHERE title ILIKE '%putri%'
OR alt_titles && ARRAY['%putri%']
ORDER BY popularity_score DESC
LIMIT 50;
```

Fallback call only if *zero results*.

---

## 📌 6. API CACHE (drama_cache / episode_cache)

### Key strategy

```
cache_key = `${provider}:list:${identifier}`
```

store full JSON
use TTL
override when stale

### Wrapper

```ts
async function cachedFetch(key, providerFetch, ttl) {
  const cached = await db.getCache(key);
  if (cached && fresh) return cached.payload;
  const data = await providerFetch();
  await db.upsertCache(key, data);
  return data;
}
```

---

## 📌 7. SYNCHRONIZATION (First Version)

Initially, skip scheduled cron: do on-demand sync.

| Action                       | Sync trigger                    |
| ---------------------------- | ------------------------------- |
| Explore provider tab         | sync provider trending & list   |
| Search fallback              | sync search results             |
| First visit homepage         | sync trending for all providers |
| Background worker (optional) | sync stale periodically         |

This avoids serverless cron complexity for now.

---

## 📌 8. STATUS & POPULARITY

To ensure DB contents are ready for homepage:

### Initial rule

```
status = 'active' when ingested from trending/home
status = 'hidden' for search fallback
```

### Simple popularity increment

on every user fetch:

```
UPDATE contents
SET popularity_score = popularity_score + 1
WHERE id = :id
```

Later introduce:

* view_count
* unique_viewers

---

## 📌 9. MIGRATION CONSIDERATIONS

### LocalStorage → DB (future)

Implement backend sync:

```
POST /api/user/sync
```

payload:

```json
{
  "watch_history": [...],
  "favorites": [...]
}
```

legacy localStorage sync only after login,
backend merges guest → user.

---

## 📌 10. FUTURE IMPROVEMENTS (NOT NOW)

– Cron sync engine (external scheduler, webhook)
– Decay algorithm for stale pops
– Hidden → Active auto-promotion
– Personalized recommendations

Not priority before DB first read path stabil.

---

# 🧠 FINAL VISUAL WORKFLOW

```
API Provider
     ↓ normalize
    DB contents
     ↓
─── READ PATH ───
Explore / Homepage
Search / Suggest
All Drama
Read from DB
(No external API)
     ↓
Playback API calls (on play)
```

---

# 🏁 FINAL CHECKLIST (WHAT YOU SHOULD COMPLETE NEXT)

**High Priority**
✔ DB tables defined
✔ Ingest API → DB (upsert)
✔ Search suggest DB-first
✔ Explore & All Drama DB reader
✔ Infinite scroll support

**Medium Priority**
✔ Cache wrapper for API
✔ Provider adapters
✔ Popularity increment

**Low Priority (later)**
⌛ Cron worker
⌛ Decay algorithm
⌛ Hidden → Active

---