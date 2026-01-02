# راهنمای نهایی تنظیمات

## ✅ مراحل نهایی

### 1. تنظیم Frontend در Vercel

1. به [Vercel Dashboard](https://vercel.com) بروید
2. پروژه `whatsapp-receipt-manager-frontend` را باز کنید
3. به **Settings** > **Environment Variables** بروید
4. Environment Variable جدید اضافه کنید:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://whatsapp-receipt-manager-backend.onrender.com`
   - **Environment**: Production, Preview, Development (همه را انتخاب کنید)
5. روی **Save** کلیک کنید
6. به **Deployments** بروید
7. روی **...** (سه نقطه) در آخرین deployment کلیک کنید
8. **Redeploy** را انتخاب کنید

### 2. تنظیم Webhook در Meta Developer Console

1. به [Meta Developer Console](https://developers.facebook.com/) بروید
2. App خود را انتخاب کنید
3. به **WhatsApp** > **Configuration** بروید
4. در بخش **"Subscribe to webhooks"**:
   - **Callback URL**: `https://whatsapp-receipt-manager-backend.onrender.com/api/whatsapp`
   - **Verify Token**: `MySecret123`
5. روی **"Verify and save"** کلیک کنید
6. اگر موفق بود، در بخش **Webhook Fields**، گزینه **"messages"** را Subscribe کنید

### 3. بررسی Backend در Render

1. به [Render Dashboard](https://dashboard.render.com/) بروید
2. Web Service `whatsapp-receipt-manager-backend` را باز کنید
3. بررسی کنید که:
   - Status: **Live** باشد
   - Logs خطایی نداشته باشد
4. روی **"Open Live URL"** کلیک کنید
5. باید این پاسخ را ببینید: `{"status":"ok","timestamp":"..."}`

### 4. تست کامل سیستم

#### تست Backend:
```bash
# Health check
curl https://whatsapp-receipt-manager-backend.onrender.com/health

# دریافت پیام‌ها
curl https://whatsapp-receipt-manager-backend.onrender.com/api/messages
```

#### تست Frontend:
1. به `https://whatsapp-receipt-manager-frontend.vercel.app/` بروید
2. باید داشبورد را ببینید
3. پیام‌ها باید از Backend لود شوند (اگر پیامی در دیتابیس باشد)

#### تست Webhook:
1. یک پیام تست به شماره WhatsApp Business خود ارسال کنید
2. در Render Logs بررسی کنید که پیام دریافت شده است
3. در Frontend باید پیام جدید را ببینید

## 🔧 تنظیمات Environment Variables

### Vercel (Frontend):
```
VITE_API_URL=https://whatsapp-receipt-manager-backend.onrender.com
```

### Render (Backend):
```
DATABASE_URL=postgresql://...@.../whatsapp-receipt-manager?sslmode=require
WHATSAPP_VERIFY_TOKEN=MySecret123
NODE_ENV=production
```

## ✅ چک‌لیست نهایی

- [ ] Frontend در Vercel دپلوی شده
- [ ] `VITE_API_URL` در Vercel تنظیم شده
- [ ] Frontend Redeploy شده
- [ ] Backend در Render Live است
- [ ] `DATABASE_URL` در Render تنظیم شده
- [ ] `WHATSAPP_VERIFY_TOKEN` در Render تنظیم شده
- [ ] Webhook در Meta تنظیم شده
- [ ] Callback URL درست است
- [ ] Verify Token درست است
- [ ] Webhook Verify شده است
- [ ] "messages" در Webhook Fields Subscribe شده است

## 🐛 عیب‌یابی

### Frontend نمی‌تواند به Backend متصل شود:
- بررسی کنید `VITE_API_URL` در Vercel تنظیم شده است
- بررسی کنید Frontend Redeploy شده است
- Browser Console را برای خطاهای CORS بررسی کنید

### Webhook Verify نمی‌شود:
- بررسی کنید Backend Live است
- بررسی کنید Callback URL درست است (با `/api/whatsapp`)
- بررسی کنید Verify Token یکسان است
- Render Logs را بررسی کنید

### پیام‌ها دریافت نمی‌شوند:
- بررسی کنید "messages" در Webhook Fields Subscribe شده است
- Render Logs را بررسی کنید
- بررسی کنید دیتابیس درست کار می‌کند

## 🎉 موفق باشید!

بعد از انجام این مراحل، سیستم شما باید کاملاً کار کند!

