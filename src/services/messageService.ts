import { pool } from '../config/database.js';
import { WhatsAppMessage, MessageStatus } from '../types/index.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ایجاد جدول‌ها از فایل schema.sql
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // خواندن فایل schema.sql
    const schemaPath = join(__dirname, '../../db/schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // تقسیم به دستورات جداگانه و اجرا
    const commands = schema
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => 
        cmd.length > 0 && 
        !cmd.startsWith('--') && 
        !cmd.startsWith('CREATE DATABASE') &&
        !cmd.startsWith('\\c') &&
        !cmd.startsWith('\\i') &&
        !cmd.startsWith('\\dt') &&
        !cmd.startsWith('\\d')
      );

    for (const command of commands) {
      if (command.trim()) {
        try {
          await client.query(command);
        } catch (error: any) {
          // نادیده گرفتن خطاهای "already exists"
          if (!error.message.includes('already exists') && 
              !error.message.includes('duplicate') &&
              !error.message.includes('does not exist')) {
            console.warn('⚠️  Warning executing command:', error.message);
          }
        }
      }
    }

    console.log('✅ Database tables initialized successfully');
    
    // نمایش جداول ایجاد شده
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log('📊 Available tables:');
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ذخیره پیام جدید
export async function saveMessage(messageData: Omit<WhatsAppMessage, 'status'> & { status?: string }) {
  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO messages (id, wa_id, sender_phone, sender_name, content, timestamp, status, media_url, mime_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        updated_at = CURRENT_TIMESTAMP
    `, [
      messageData.id,
      messageData.wa_id,
      messageData.sender_phone,
      messageData.sender_name,
      messageData.content,
      messageData.timestamp,
      messageData.status || 'NEW',
      messageData.media_url || null,
      messageData.mime_type || null,
    ]);
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  } finally {
    client.release();
  }
}

// دریافت تمام پیام‌ها
export async function getAllMessages() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM messages
      ORDER BY timestamp DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  } finally {
    client.release();
  }
}

// دریافت یک پیام خاص
export async function getMessageById(id: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM messages WHERE id = $1
    `, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching message:', error);
    throw error;
  } finally {
    client.release();
  }
}

// به‌روزرسانی وضعیت پیام
export async function updateMessageStatus(id: string, status: MessageStatus) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      UPDATE messages
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  } finally {
    client.release();
  }
}
