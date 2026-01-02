# راهنمای ایجاد دیتابیس در Neon

## ⚠️ خطای فعلی

```
error: database "whatsapp-receipt-manager" does not exist
```

این خطا یعنی دیتابیس `whatsapp-receipt-manager` در Neon ایجاد نشده است.

## ✅ راه‌حل: ایجاد دیتابیس در Neon

### روش 1: استفاده از Neon Console (پیشنهادی)

#### مرحله 1: رفتن به Neon Console

1. به [Neon Console](https://console.neon.tech/) بروید
2. وارد حساب خود شوید
3. پروژه خود را انتخاب کنید

#### مرحله 2: ایجاد دیتابیس

1. در صفحه اصلی پروژه، به بخش **SQL Editor** بروید
2. در SQL Editor، این دستور را بنویسید:

```sql
CREATE DATABASE "whatsapp-receipt-manager";
```

3. روی دکمه **Run** کلیک کنید (یا `Ctrl+Enter` بزنید)
4. باید پیام موفقیت را ببینید

#### مرحله 3: ایجاد جداول

بعد از ایجاد دیتابیس، باید جداول را ایجاد کنید:

1. در SQL Editor، ابتدا به دیتابیس جدید متصل شوید:

```sql
\c whatsapp-receipt-manager
```

**نکته:** اگر `\c` کار نکرد، از این روش استفاده کنید:

در Neon Console:
- در بالای SQL Editor، یک dropdown برای انتخاب دیتابیس وجود دارد
- `whatsapp-receipt-manager` را انتخاب کنید

2. سپس محتوای فایل `backend/db/schema.sql` را کپی و در SQL Editor اجرا کنید

یا می‌توانید این دستورات را مستقیماً اجرا کنید:

```sql
-- جدول پیام‌های واتساپ
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(255) PRIMARY KEY,
    wa_id VARCHAR(255),
    sender_phone VARCHAR(50) NOT NULL,
    sender_name VARCHAR(255),
    content TEXT,
    timestamp TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    media_url TEXT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ایندکس‌ها
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_phone ON messages(sender_phone);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- جدول لاگ تغییرات
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    admin_user VARCHAR(255),
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- ایندکس برای audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_message_id ON audit_logs(message_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- جدول آمار داشبورد
CREATE TABLE IF NOT EXISTS dashboard_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_messages INTEGER DEFAULT 0,
    pending_reviews INTEGER DEFAULT 0,
    approved_today INTEGER DEFAULT 0,
    rejected_today INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ایندکس برای dashboard_stats
CREATE INDEX IF NOT EXISTS idx_dashboard_stats_date ON dashboard_stats(date DESC);
```

### روش 2: استفاده از Neon CLI (اختیاری)

اگر Neon CLI نصب دارید:

```bash
# نصب Neon CLI
npm install -g neonctl

# Login
neonctl auth

# ایجاد دیتابیس
neonctl databases create --name whatsapp-receipt-manager --project-id YOUR_PROJECT_ID
```

## ✅ بررسی

بعد از ایجاد دیتابیس و جداول، می‌توانید بررسی کنید:

```sql
-- نمایش جداول
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- باید این جداول را ببینید:
-- - audit_logs
-- - dashboard_stats
-- - messages
```

## 🚀 تست مجدد

بعد از ایجاد دیتابیس و جداول:

```bash
cd backend
npm run dev
```

اگر همه چیز درست باشد، باید این پیام‌ها را ببینید:

```
✅ Connected to PostgreSQL database
✅ Database tables initialized successfully
📊 Available tables:
   - audit_logs
   - dashboard_stats
   - messages
🚀 Server is running on port 5000
```

## 📝 نکات مهم

1. **نام دیتابیس:** حتماً `whatsapp-receipt-manager` باشد (با خط تیره)
2. **Case Sensitive:** در PostgreSQL نام دیتابیس case-sensitive است
3. **Quotes:** در SQL از double quotes استفاده کنید: `"whatsapp-receipt-manager"`

## ❓ اگر هنوز خطا دارید

### بررسی وجود دیتابیس

```sql
-- نمایش تمام دیتابیس‌ها
SELECT datname FROM pg_database;

-- بررسی وجود دیتابیس خاص
SELECT 1 FROM pg_database WHERE datname = 'whatsapp-receipt-manager';
```

### بررسی Connection String

مطمئن شوید که در `.env` نام دیتابیس درست است:

```env
DATABASE_URL='postgresql://...@host/whatsapp-receipt-manager?...'
```

نه:

```env
DATABASE_URL='postgresql://...@host/neondb?...'  # ❌ اشتباه
```

