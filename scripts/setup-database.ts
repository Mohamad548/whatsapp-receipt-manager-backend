import pg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;
const DB_NAME = 'whatsapp-receipt-manager';

// بررسی وجود دیتابیس
async function checkDatabase() {
  const originalUrl = process.env.DATABASE_URL || '';
  
  // ساخت DATABASE_URL با نام دیتابیس جدید
  const dbUrl = originalUrl.replace(/\/[^\/]+(\?|$)/, `/${DB_NAME}$1`);
  
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }, // Neon requires SSL
  });

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    await pool.end();
    return true;
  } catch (error: any) {
    await pool.end();
    if (error.code === '3D000') {
      // دیتابیس وجود ندارد
      return false;
    }
    throw error;
  }
}

// ایجاد جداول
async function createTables() {
  // ساخت DATABASE_URL جدید با نام دیتابیس جدید
  const originalUrl = process.env.DATABASE_URL || '';
  const dbUrl = originalUrl.replace(/\/[^\/]+(\?|$)/, `/${DB_NAME}$1`);
  
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }, // Neon requires SSL
  });

  const client = await pool.connect();
  
  try {
    // خواندن فایل schema.sql
    const schemaPath = join(process.cwd(), 'db', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // حذف کامنت‌ها و خطوط خالی
    const cleanSchema = schema
      .split('\n')
      .map(line => {
        // حذف کامنت‌های خطی
        const commentIndex = line.indexOf('--');
        if (commentIndex >= 0) {
          line = line.substring(0, commentIndex);
        }
        return line.trim();
      })
      .filter(line => line.length > 0)
      .join('\n');
    
    // تقسیم به دستورات جداگانه
    const commands = cleanSchema
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => 
        cmd.length > 0 && 
        !cmd.includes('CREATE DATABASE') &&
        !cmd.includes('============================================')
      );

    console.log(`📝 Executing ${commands.length} SQL commands...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          // اضافه کردن semicolon برای اجرا
          const sqlCommand = command.endsWith(';') ? command : command + ';';
          await client.query(sqlCommand);
          console.log(`   ✓ Command ${i + 1}/${commands.length} executed`);
        } catch (error: any) {
          // نادیده گرفتن خطاهای "already exists"
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.code === '42P07' || // relation already exists
              error.code === '42710') { // duplicate object
            console.log(`   ℹ️  Command ${i + 1}/${commands.length} skipped (already exists)`);
          } else {
            console.error(`   ❌ Error in command ${i + 1}:`, error.message);
            console.error(`   Command was: ${command.substring(0, 100)}...`);
            throw error;
          }
        }
      }
    }

    console.log('✅ All tables created successfully');
    
    // نمایش جداول ایجاد شده
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log('\n📊 Created tables:');
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// تابع اصلی
async function main() {
  try {
    console.log('🚀 Starting database setup...\n');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set in environment variables');
      console.log('💡 Please set DATABASE_URL in your .env file');
      process.exit(1);
    }
    
    // مرحله 1: بررسی وجود دیتابیس
    console.log('📦 Step 1: Checking database...');
    const dbExists = await checkDatabase();
    
    if (!dbExists) {
      console.log(`\n⚠️  Database "${DB_NAME}" does not exist!`);
      console.log(`\n📝 Please create the database manually in Neon Console:`);
      console.log(`   1. Go to https://console.neon.tech/`);
      console.log(`   2. Open SQL Editor`);
      console.log(`   3. Run: CREATE DATABASE "${DB_NAME}";`);
      console.log(`   4. Then run this script again: npm run db:setup\n`);
      process.exit(1);
    }
    
    console.log(`✅ Database "${DB_NAME}" exists`);
    console.log('');
    
    // مرحله 2: ایجاد جداول
    console.log('📦 Step 2: Creating tables...');
    await createTables();
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('🎉 You can now run: npm run dev');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database setup failed:', error);
    process.exit(1);
  }
}

// اجرا
main();

