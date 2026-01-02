# راهنمای تنظیم DATABASE_URL

## 🔍 مشکل فعلی

خطای `ENOTFOUND host` یعنی `DATABASE_URL` در فایل `.env` به درستی تنظیم نشده است.

## ✅ راه‌حل

### مرحله 1: دریافت Connection String از Neon

1. به [Neon Console](https://console.neon.tech/) بروید
2. پروژه خود را انتخاب کنید
3. در صفحه اصلی، بخش "Connection Details" را پیدا کنید
4. روی "Connection string" کلیک کنید
5. Connection String را کپی کنید

**مثال Connection String از Neon:**
```
postgresql://username:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### مرحله 2: تغییر نام دیتابیس

Connection String را کپی کرده و نام دیتابیس را به `whatsapp-receipt-manager` تغییر دهید:

**قبل:**
```
postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

**بعد:**
```
postgresql://username:password@ep-xxx.region.aws.neon.tech/whatsapp-receipt-manager?sslmode=require
```

### مرحله 3: ایجاد فایل `.env`

در پوشه `backend` یک فایل `.env` ایجاد کنید:

```env
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/whatsapp-receipt-manager?sslmode=require
WHATSAPP_VERIFY_TOKEN=MySecret123
PORT=5000
NODE_ENV=development
```

**⚠️ مهم:** 
- `username` و `password` را با مقادیر واقعی از Neon جایگزین کنید
- `ep-xxx.region.aws.neon.tech` را با آدرس واقعی از Neon جایگزین کنید

### مرحله 4: ایجاد دیتابیس در Neon

1. در Neon Console به **SQL Editor** بروید
2. این دستور را اجرا کنید:

```sql
CREATE DATABASE "whatsapp-receipt-manager";
```

3. سپس محتوای فایل `db/schema.sql` را کپی و در SQL Editor اجرا کنید

### مرحله 5: تست اتصال

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

## 🔒 نکات امنیتی

1. فایل `.env` را هرگز به Git commit نکنید (قبلاً در `.gitignore` است)
2. Password را محرمانه نگه دارید
3. در Production از Environment Variables استفاده کنید

## ❓ اگر هنوز خطا دارید

### بررسی فرمت DATABASE_URL

فرمت صحیح:
```
postgresql://[user]:[password]@[host]:[port]/[database]?[options]
```

مثال کامل:
```
postgresql://myuser:mypassword@ep-cool-darkness-123456.us-east-2.aws.neon.tech:5432/whatsapp-receipt-manager?sslmode=require
```

### بررسی وجود دیتابیس

در Neon SQL Editor:
```sql
-- نمایش تمام دیتابیس‌ها
SELECT datname FROM pg_database;

-- بررسی وجود دیتابیس
SELECT 1 FROM pg_database WHERE datname = 'whatsapp-receipt-manager';
```

### تست اتصال با psql (اگر نصب دارید)

```bash
psql "postgresql://user:password@host:5432/whatsapp-receipt-manager?sslmode=require"
```

اگر این دستور کار کرد، یعنی Connection String درست است.

