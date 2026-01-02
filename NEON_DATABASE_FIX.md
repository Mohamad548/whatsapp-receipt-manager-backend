# راه‌حل مشکل ایجاد دیتابیس در Neon

## ⚠️ مشکل

در Neon Console، دستور `CREATE DATABASE` در حالت "Connecting..." می‌ماند.

## 🔍 دلیل

در Neon، معمولاً نمی‌توان مستقیماً از SQL Editor دیتابیس جدید ایجاد کرد. باید از دیتابیس `postgres` استفاده کنید.

## ✅ راه‌حل‌ها

### روش 1: استفاده از دیتابیس postgres (پیشنهادی)

1. در Neon Console، در dropdown بالای SQL Editor
2. به جای `neondb`، دیتابیس `postgres` را انتخاب کنید
3. سپس این دستور را اجرا کنید:

```sql
CREATE DATABASE "whatsapp-receipt-manager";
```

4. روی "Run" کلیک کنید

### روش 2: استفاده از Connection String اصلی

اگر روش 1 کار نکرد، می‌توانید از Connection String اصلی استفاده کنید:

1. در Neon Console، به بخش "Connection Details" بروید
2. Connection String را کپی کنید
3. نام دیتابیس را به `postgres` تغییر دهید
4. با یک کلاینت PostgreSQL (مثل psql یا DBeaver) متصل شوید
5. دستور `CREATE DATABASE` را اجرا کنید

### روش 3: استفاده از Neon Dashboard

1. در Neon Console، به بخش "Databases" بروید
2. روی "Create Database" کلیک کنید
3. نام دیتابیس را `whatsapp-receipt-manager` وارد کنید
4. روی "Create" کلیک کنید

### روش 4: استفاده از Neon API (پیشرفته)

اگر API Key دارید:

```bash
curl -X POST 'https://console.neon.tech/api/v1/projects/{project_id}/databases' \
  -H 'Authorization: Bearer {api_key}' \
  -H 'Content-Type: application/json' \
  -d '{"database": {"name": "whatsapp-receipt-manager"}}'
```

## 🎯 بعد از ایجاد دیتابیس

بعد از ایجاد دیتابیس، این مراحل را انجام دهید:

1. در SQL Editor، دیتابیس `whatsapp-receipt-manager` را انتخاب کنید
2. محتوای فایل `backend/db/schema.sql` را کپی و اجرا کنید
3. یا اسکریپت را اجرا کنید: `npm run db:setup`

## ✅ بررسی

بعد از ایجاد دیتابیس، می‌توانید بررسی کنید:

```sql
-- نمایش تمام دیتابیس‌ها
SELECT datname FROM pg_database WHERE datistemplate = false;
```

باید `whatsapp-receipt-manager` را در لیست ببینید.

