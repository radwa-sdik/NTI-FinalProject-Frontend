import { User } from "./user";

export interface Message {
    _id?: string;
    conversation: string;
    sender: User;
    senderType: 'User' | 'Admin' | 'Agent';
    content: string;
    timestamp: Date;
    isRead: boolean;
}
