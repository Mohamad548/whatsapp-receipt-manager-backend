-- ============================================
-- WhatsApp Receipt Manager Database Schema
-- Database Name: whatsapp-receipt-manager
-- ============================================

-- ایجاد دیتابیس (اگر وجود نداشته باشد)
-- این دستور باید در PostgreSQL به صورت دستی اجرا شود:
-- CREATE DATABASE "whatsapp-receipt-manager";

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

-- ایندکس‌ها برای بهبود عملکرد
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_phone ON messages(sender_phone);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- جدول لاگ تغییرات (Audit Log)
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

-- جدول آمار داشبورد (اختیاری - برای cache)
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

-- ============================================
-- توضیحات جداول:
-- ============================================
-- messages: ذخیره تمام پیام‌های دریافتی از واتساپ
-- audit_logs: تاریخچه تغییرات وضعیت پیام‌ها
-- dashboard_stats: آمار روزانه برای داشبورد (اختیاری)
-- ============================================

