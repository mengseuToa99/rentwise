// Define the Message interface since it's missing from the imported types
interface Message {
    message_id: number;
    sender_id: number;
    recipient_id: number;
    message: string;
    created_at: string;
    updated_at: string;
    conversation_id?: number;
  }
  
  