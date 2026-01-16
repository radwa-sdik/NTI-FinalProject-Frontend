import { User } from "./user";

export interface Conversation {
    _id?: string;
    participants: User[];
    status: 'active' | 'closed' | 'waiting';
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date;
}
