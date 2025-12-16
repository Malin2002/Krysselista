export interface Notification {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  message: string;
  timestamp?: any;
  senderName?: string;
  senderRole?: string;
}