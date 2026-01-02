-- ============================================
-- WhatsApp Receipt Manager - Database Initialization
-- این فایل برای ایجاد دیتابیس و جداول استفاده می‌شود
-- ============================================

-- توجه: قبل از اجرای این فایل، باید دیتابیس را ایجاد کنید:
-- CREATE DATABASE "whatsapp-receipt-manager";

-- استفاده از دیتابیس
\c whatsapp-receipt-manager;

-- اجرای schema
\i schema.sql

-- نمایش جداول ایجاد شده
\dt

-- نمایش اطلاعات جدول messages
\d messages

