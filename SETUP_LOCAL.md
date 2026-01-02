# راه‌اندازی محلی Backend

## 🔧 تنظیمات اولیه

### 1. ایجاد فایل `.env`

در پوشه `backend` یک فایل `.env` ایجاد کنید:

```env
# Database Connection
# برای Neon: از Connection String در Neon Console استفاده کنید
DATABASE_URL=postgresql://user:password@host:5432/whatsapp-receipt-manager

# WhatsApp Webhook Verify Token
WHATSAPP_VERIFY_TOKEN=MySecret123

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 2. دریافت DATABASE_URL از Neon

1. به [Neon Console](https://console.neon.tech/) بروید
2. پروژه خود را انتخاب کنید
3. به بخش "Connection Details" بروید
4. "Connection string" را کپی کنید
5. نام دیتابیس را به `whatsapp-receipt-manager` تغییر دهید

**مثال:**
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/whatsapp-receipt-manager?sslmode=require
```

### 3. نصب وابستگی‌ها

```bash
cd backend
npm install
```

### 4. ایجاد دیتابیس و جداول

#### روش 1: استفاده از Neon Console (پیشنهادی)

1. در Neon Console به SQL Editor بروید
2. دستور زیر را اجرا کنید:
```sql
CREATE DATABASE "whatsapp-receipt-manager";
```
3. سپس محتوای فایل `db/schema.sql` را کپی و اجرا کنید

#### روش 2: استفاده از psql

```bash
# اگر psql نصب دارید
psql "postgresql://user:password@host:5432/postgres" -c 'CREATE DATABASE "whatsapp-receipt-manager";'
psql "postgresql://user:password@host:5432/whatsapp-receipt-manager" -f db/schema.sql
```

### 5. اجرای پروژه

```bash
npm run dev
```

## ✅ بررسی

اگر همه چیز درست باشد، باید این پیام‌ها را ببینید:

```
✅ Connected to PostgreSQL database
✅ Database tables initialized successfully
📊 Available tables:
   - audit_logs
   - dashboard_stats
   - messages
🚀 Server is running on port 5000
📡 Environment: development
```

## ❌ رفع مشکلات

### خطای "DATABASE_URL is not set"
- مطمئن شوید فایل `.env` در پوشه `backend` وجود دارد
- مطمئن شوید `DATABASE_URL` در فایل `.env` تنظیم شده است

### خطای "SASL: SCRAM-SERVER-FIRST-MESSAGE"
- بررسی کنید که `DATABASE_URL` فرمت درستی دارد
- مطمئن شوید که password در URL به درستی encode شده است
- اگر password شامل کاراکترهای خاص است، باید URL encode شود

### خطای "Cannot connect to database"
- بررسی کنید که دیتابیس در Neon ایجاد شده است
- بررسی کنید که Connection String درست است
- بررسی کنید که IP شما در Neon Whitelist است (اگر نیاز باشد)

## 🔗 تست API

بعد از راه‌اندازی، می‌توانید تست کنید:

```bash
# Health check
curl http://localhost:5000/health

# دریافت پیام‌ها
curl http://localhost:5000/api/messages
```

