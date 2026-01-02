import { pool } from '../config/database.js';
import { WhatsAppMessage, MessageStatus } from '../types/index.js';

// ایجاد جدول اگر وجود نداشته باشد
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
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
      
      CREATE INDEX IF NOT EXISTS idx_status ON messages(status);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON messages(timestamp DESC);
    `);
    console.log('✅ Database initialized successfully');
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

