export enum MessageStatus {
  NEW = 'NEW',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface WhatsAppMessage {
  id: string;
  wa_id: string;
  sender_phone: string;
  sender_name: string;
  content: string;
  timestamp: string;
  status: MessageStatus;
  media_url?: string | null;
  mime_type?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  message_id: string;
  action: string;
  admin_user: string;
  timestamp: string;
  previous_status: MessageStatus;
  new_status: MessageStatus;
}

export interface DashboardStats {
  total_messages: number;
  pending_reviews: number;
  approved_today: number;
  rejected_today: number;
}

