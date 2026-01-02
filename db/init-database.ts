import pg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

const { Pool } = pg;

// اتصال به PostgreSQL (بدون نام دیتابیس خاص)
const adminPool = new Pool({
  connectionString: process.env.DATABASE_URL?.replace(/\/[^\/]+$/, '/postgres') || 
                     process.env.ADMIN_DATABASE_URL || 
                     'postgresql://user:password@localhost:5432/postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const DB_NAME = 'whatsapp-receipt-manager';

async function createDatabase() {
  const client = await adminPool.connect();
  try {
    // بررسی وجود دیتابیس
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );

    if (result.rows.length === 0) {
      // ایجاد دیتابیس
      await client.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`✅ Database "${DB_NAME}" created successfully`);
    } else {
      console.log(`ℹ️  Database "${DB_NAME}" already exists`);
    }
  } catch (error) {
    console.error('❌ Error creating database:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function initializeTables() {
  // اتصال به دیتابیس جدید
  const dbPool = new Pool({
    connectionString: process.env.DATABASE_URL?.replace(/\/[^\/]+$/, `/${DB_NAME}`) ||
                      `postgresql://user:password@localhost:5432/${DB_NAME}`,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const client = await dbPool.connect();
  try {
    // خواندن و اجرای schema
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // تقسیم به دستورات جداگانه و اجرا
    const commands = schema
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('CREATE DATABASE'));

    for (const command of commands) {
      if (command.trim()) {
        try {
          await client.query(command);
        } catch (error: any) {
          // نادیده گرفتن خطاهای "already exists"
          if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
            console.warn('⚠️  Warning executing command:', error.message);
          }
        }
      }
    }

    console.log('✅ Tables initialized successfully');
    
    // نمایش جداول ایجاد شده
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📊 Created tables:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error initializing tables:', error);
    throw error;
  } finally {
    client.release();
    await dbPool.end();
  }
}

async function main() {
  try {
    console.log('🚀 Starting database initialization...\n');
    
    // ایجاد دیتابیس
    await createDatabase();
    
    // ایجاد جداول
    await initializeTables();
    
    console.log('\n✅ Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await adminPool.end();
  }
}

// اجرا اگر مستقیماً فراخوانی شود
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createDatabase, initializeTables };

