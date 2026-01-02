import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const DB_NAME = 'whatsapp-receipt-manager';

async function createDatabase() {
  const connectionString = process.env.DATABASE_URL || '';
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in environment variables');
    console.log('💡 Please set DATABASE_URL in your .env file');
    process.exit(1);
  }

  // استخراج اطلاعات از DATABASE_URL
  try {
    // تبدیل Connection String به URL object
    const url = new URL(connectionString.replace('postgresql://', 'http://'));
    const host = url.hostname;
    const port = url.port || '5432';
    const username = url.username;
    const password = url.password;
    const searchParams = url.searchParams;
    
    // ساخت Connection String برای دیتابیس postgres
    const postgresUrl = `postgresql://${username}:${password}@${host}:${port}/postgres${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    console.log('🔗 Connecting to PostgreSQL...');
    
    const pool = new Pool({
      connectionString: postgresUrl,
      ssl: { rejectUnauthorized: false }, // Neon requires SSL
    });

    const client = await pool.connect();
    
    try {
      // بررسی وجود دیتابیس
      console.log(`🔍 Checking if database "${DB_NAME}" exists...`);
      const checkResult = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [DB_NAME]
      );

      if (checkResult.rows.length > 0) {
        console.log(`✅ Database "${DB_NAME}" already exists!`);
        console.log('💡 You can now run: npm run db:setup');
        return;
      }

      // ایجاد دیتابیس
      console.log(`📦 Creating database "${DB_NAME}"...`);
      await client.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`✅ Database "${DB_NAME}" created successfully!`);
      console.log('');
      console.log('🎉 Next step: Run "npm run db:setup" to create tables');
      
    } catch (error: any) {
      if (error.code === '3D000') {
        console.log(`⚠️  Database "${DB_NAME}" does not exist, creating...`);
        await client.query(`CREATE DATABASE "${DB_NAME}"`);
        console.log(`✅ Database "${DB_NAME}" created successfully!`);
      } else if (error.code === '42P04') {
        console.log(`✅ Database "${DB_NAME}" already exists!`);
      } else {
        throw error;
      }
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error: any) {
    console.error('❌ Error creating database:', error.message);
    
    if (error.code === '28000' || error.message.includes('password')) {
      console.log('\n💡 Tip: Make sure your DATABASE_URL is correct');
      console.log('   Format: postgresql://user:password@host:port/database?sslmode=require');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Tip: Check your internet connection and DATABASE_URL host');
    } else {
      console.log('\n💡 Alternative: Create database manually in Neon Console:');
      console.log('   1. Go to https://console.neon.tech/');
      console.log('   2. Open SQL Editor');
      console.log('   3. Make sure you are connected to "postgres" database');
      console.log(`   4. Run: CREATE DATABASE "${DB_NAME}";`);
    }
    
    process.exit(1);
  }
}

// اجرا
createDatabase();

