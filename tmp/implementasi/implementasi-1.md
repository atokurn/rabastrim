# 🎯 Subscription + Credit System Implementation Plan

## 📌 Tujuan

Menyediakan mekanisme monetisasi dengan:

1. **Langganan paket** (harian, mingguan, bulanan, 3 bulan)
2. **Sistem credit** yang dapat dipakai untuk unlock konten/fitur
3. **Bonus credit** diberikan saat user berlangganan

---

## 🧱 Database Schema

### 1. `subscriptions` — catat langganan user

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  plan TEXT NOT NULL,                -- '1_day', '7_day', '30_day', '90_day'
  status TEXT NOT NULL,              -- 'active', 'expired'
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX subs_user_idx ON subscriptions(user_id);
```

---

### 2. `credits` — jumlah credit user

```sql
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX credits_user_idx ON credits(user_id);
```

---

### 3. `credit_transactions` — riwayat credit

```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,                -- 'bonus', 'purchase', 'use'
  amount INTEGER NOT NULL,
  reference TEXT,                    -- e.g. subscription_id, order_id
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX credit_tx_user_idx ON credit_transactions(user_id);
```

---

### 4. Bonus credit config (opsional static table)

Kalau kamu ingin mudah konfigurasi di DB:

```sql
CREATE TABLE credit_plans (
  plan TEXT PRIMARY KEY,             -- subscription plan
  bonus_credit INTEGER NOT NULL
);

INSERT INTO credit_plans VALUES
('1_day', 0),
('7_day', 10),
('30_day', 30),
('90_day', 80);
```

---

## 🔐 Subscription Logic

### Subscription Rules

| Plan    | Harga    | Lama    | Bonus Credit |
| ------- | -------- | ------- | ------------ |
| 1 Day   | Rp2.000  | 1 hari  | 0            |
| 7 Days  | Rp12.000 | 7 hari  | 10           |
| 30 Days | Rp39.000 | 30 hari | 30           |
| 90 Days | Rp99.000 | 90 hari | 80           |

---

### Migration on subscription purchase

1. Buat entry di `subscriptions`
2. Assign Bonus credit ke `credits`
3. Simpan transaksi bonus di `credit_transactions`

### Backend function (pseudocode)

```ts
async function createSubscription(userId, plan) {
  const now = new Date();
  const end = addPlanDuration(now, plan);

  await db.subscriptions.insert({
    user_id: userId,
    plan,
    status: 'active',
    start_date: now,
    end_date: end
  });

  const bonusCredit = await db.credit_plans.findUnique({ plan });
  if (bonusCredit) {
    await db.credits.upsert({
      where: { user_id },
      update: { balance: sql`credits.balance + ${bonusCredit}` },
      create: { user_id, balance: bonusCredit }
    });

    await db.credit_transactions.insert({
      user_id,
      type: 'bonus',
      amount: bonusCredit,
      reference: plan
    });
  }
}
```

---

## 📡 API Endpoints

### 1) Subscribe / Purchase

```
POST /api/subscription
```

**Request:**

```json
{ "plan": "30_day" }
```

**Response:**

```json
{ "success": true, "subscription": {...}, "bonusCredit": 30 }
```

---

### 2) Get User Subscription

```
GET /api/subscription
```

**Response:**

```json
{ "active": true, "expires_at": "...", "plan": "30_day" }
```

---

### 3) Get Credit Balance

```
GET /api/credits
```

**Response:**

```json
{ "balance": 50 }
```

---

### 4) Credit Transaction History

```
GET /api/credits/transactions
```

**Response:**

```json
[ { type, amount, reference, created_at } ]
```

---

### 5) Use Credit (unlock episode / feature)

```
POST /api/credits/use
```

**Body:**

```json
{ "amount": 5, "reference": "episode_12345" }
```

**Response:**

```json
{ "success": true, "balance": 45 }
```

> Backend must validate:
>
> * balance >= amount
> * subtract & log transaction

---

## ⚙️ Payment Gateway Integration

### Popular Options (Indonesia)

| Provider     | Kelebihan                        |
| ------------ | -------------------------------- |
| **Xendit**   | Stable, Bank transfer & e-wallet |
| **Midtrans** | Mudah integrasi, Snap UI         |
| **Tripay**   | Alternatif murah                 |
| **Stripe**   | International card               |

### Required Flow

1. Frontend request create payment
2. Backend call provider API
3. Payment gateway webhook
4. Backend updates:

   * subscription status
   * credit bonus
   * transaction record

### Webhook example

```
POST /api/webhooks/payment
```

Handle:

* success
* expired
* failed
* pending

---

## 🧠 Feature: Content Unlock Hierarchy

Gunakan sistem:

```
if user has active subscription OR credit balance >= cost:
   allow watch
else:
   prompt subscribe / buy credit
```

### Example logic:

```ts
function canAccessContent(user) {
  if (hasActiveSubscription(user)) return true;
  if (user.credit_balance >= cost) return true;
  return false;
}
```

---

## 💡 UX / UI Considerations

### A. Pricing Page

Tampilkan:

| Plan    | Price    | Bonus Credit | Action |
| ------- | -------- | ------------ | ------ |
| 1 Hari  | Rp2.000  | 0            | Beli   |
| 7 Hari  | Rp12.000 | 10           | Beli   |
| 30 Hari | Rp39.000 | 30           | Beli   |
| 90 Hari | Rp99.000 | 80           | Beli   |

Jangan lupa:

* “Hemat 35%”
* Highlight “Paling Value”
* Tooltip credit use

---

### B. Content Lock Prompt

Kalau konten dikunci:

```
Butuh 5 credit atau langganan untuk nonton
[Langganan] [Gunakan Credit]
```

---

## 🧩 Data Flow

```
User A
  ↓ Click Subscribe
frontend → /api/subscription → backend
  ↓ 
create subscription + bonus credit
  ↓
return updated subscription + credit
  ↓
frontend update UI
```

```
User A
  ↓ Click unlock episode
frontend → /api/credits/use
  ↓
validate balance
  ↓
deduct & log
  ↓
return new balance
```

---

## 🧪 Verification Plan

### Manual Testcases

**Subscription Flow**

1. Login user
2. Buy 7-day
3. Check subscription status
4. Check credits

**Credit Use**

1. Use credits for episode unlock
2. Balance update
3. Fail if balance < cost

**Bonus Credit**

1. Upgrade plan
2. Credit increase accordingly

**Payment**

1. Payment success webhook
2. Subscription & credit commit
3. Failure webhook → rollback

---

## 🆙 Scalability & Safety

### Soft-expiration

Gunakan scheduler (cron) untuk:

```
UPDATE subscriptions
SET status = 'expired'
WHERE end_date < now()
```

Misalnya:

* setiap 1 jam
* atau diakses user

---

## 📌 Notes

* Subscription status checked on every protected API
* Credit balance update must be atomic
* Use DB transaction for integrity
✅ Hooks (useSubscription, useCredits)

Tinggal bilang mau dibuatkan bagian mana dulu 👍
