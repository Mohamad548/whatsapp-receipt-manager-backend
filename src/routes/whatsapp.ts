import express, { Request, Response } from 'express';
import { saveMessage } from '../services/messageService.js';

const router = express.Router();

// Verify Token برای تایید Webhook توسط Meta
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'MySecret123';

// GET: تایید Webhook توسط Meta
router.get('/', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    return res.status(200).send(challenge);
  }

  console.log('❌ Webhook verification failed');
  return res.status(403).send('Forbidden');
});

// POST: دریافت پیام‌های جدید از WhatsApp
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    
    // Log تمام درخواست‌های ورودی برای دیباگ
    console.log('📥 Webhook received:', JSON.stringify(body, null, 2));
    
    // بررسی ساختار پیام واتساپ
    console.log('🔍 Body object:', body.object);
    
    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry;
      console.log('📋 Entries:', entries?.length || 0);
      
      for (const entry of entries) {
        const changes = entry.changes;
        console.log('🔄 Changes:', changes?.length || 0);
        
        for (const change of changes) {
          console.log('📝 Change field:', change.field);
          
          if (change.field === 'messages') {
            const value = change.value;
            console.log('💬 Value messages:', value.messages ? 'exists' : 'missing');
            
            // اگر پیام جدیدی دریافت شده
            if (value.messages) {
              const message = value.messages[0];
              const contact = value.contacts?.[0];
              
              // استخراج اطلاعات پیام
              // تبدیل timestamp از ثانیه به میلی‌ثانیه (WhatsApp timestamp در ثانیه است)
              const messageTimestamp = message.timestamp 
                ? new Date(parseInt(message.timestamp) * 1000).toISOString()
                : new Date().toISOString();
              
              const messageData = {
                id: message.id,
                wa_id: value.metadata?.phone_number_id,
                sender_phone: message.from,
                sender_name: contact?.profile?.name || 'نامشخص',
                content: message.text?.body || message.caption || '',
                timestamp: messageTimestamp,
                status: 'NEW',
                media_url: message.image?.id || message.document?.id || null,
                mime_type: message.image?.mime_type || message.document?.mime_type || null,
              };

              console.log('📨 New WhatsApp message received:', JSON.stringify(messageData, null, 2));
              
              // ذخیره پیام در دیتابیس
              try {
                await saveMessage(messageData);
                console.log('✅ Message saved to database');
              } catch (dbError) {
                console.error('❌ Error saving message to database:', dbError);
                // ادامه می‌دهیم حتی اگر ذخیره نشد
              }
              
              // TODO: اگر تصویر یا فایل دارید، باید از WhatsApp API آن را دانلود کنید
            }
          } else {
            console.log('⚠️  Change field is not "messages":', change.field);
          }
        }
      }
    } else {
      console.log('⚠️  Body object is not "whatsapp_business_account":', body.object);
      console.log('📦 Full body structure:', Object.keys(body));
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

