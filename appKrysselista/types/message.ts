export interface Message {
  id?: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp?: any;
  readBy?: string[];
}


