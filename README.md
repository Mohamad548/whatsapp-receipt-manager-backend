# حساب‌تراک - Backend API

Backend API برای دریافت و مدیریت پیام‌های WhatsApp Business

## 🚀 راه‌اندازی محلی

### پیش‌نیازها

- Node.js (نسخه 18 یا بالاتر)
- PostgreSQL (محلی یا از Render)

### نصب وابستگی‌ها

```bash
npm install
```

### تنظیم متغیرهای محیطی

فایل `.env` را ایجاد کنید:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/whatsapp_ledger

# WhatsApp
WHATSAPP_VERIFY_TOKEN=MySecret123

# Server
PORT=5000
NODE_ENV=development
```

### اجرای پروژه

```bash
# حالت توسعه (با hot reload)
npm run dev

# ساخت و اجرای Production
npm run build
npm start
```

## 📦 دپلوی در Render

### 1. ایجاد PostgreSQL Database

1. به [Render Dashboard](https://dashboard.render.com/) بروید
2. روی "New +" کلیک کنید
3. "PostgreSQL" را انتخاب کنید
4. نام و تنظیمات را وارد کنید
5. Database URL را کپی کنید

### 2. ایجاد Web Service

1. روی "New +" کلیک کنید
2. "Web Service" را انتخاب کنید
3. ریپازیتوری GitHub خود را متصل کنید
4. تنظیمات:
   - **Name**: `whatsapp-ledger-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

### 3. تنظیم Environment Variables

در بخش Environment Variables:

- `DATABASE_URL`: از PostgreSQL Database کپی کنید
- `WHATSAPP_VERIFY_TOKEN`: `MySecret123` (یا مقدار خودتان)
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render به صورت خودکار تنظیم می‌کند)

## 🔗 API Endpoints

### Health Check
```
GET /health
```

### WhatsApp Webhook
```
GET  /api/whatsapp  - تایید Webhook
POST /api/whatsapp  - دریافت پیام‌های جدید
```

### Messages API
```
GET    /api/messages        - دریافت تمام پیام‌ها
GET    /api/messages/:id    - دریافت یک پیام خاص
PATCH  /api/messages/:id/status - به‌روزرسانی وضعیت
```

## 📝 مثال استفاده

### دریافت تمام پیام‌ها
```bash
curl https://your-backend.onrender.com/api/messages
```

### به‌روزرسانی وضعیت
```bash
curl -X PATCH https://your-backend.onrender.com/api/messages/123/status \
  -H "Content-Type: application/json" \
  -d '{"status": "APPROVED"}'
```

## 🔒 امنیت

- Verify Token را محرمانه نگه دارید
- در Production از HTTPS استفاده کنید
- Database credentials را در Environment Variables نگه دارید

