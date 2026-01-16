import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Conversation } from '../models/conversation';
import { Message } from '../models/message';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private ChatApiUrl = 'https://nti-final-project-backend.onrender.com/api/conversations';
  private MessageApiUrl = 'https://nti-final-project-backend.onrender.com/api/messages';
  private SocketApiUrl = 'https://nti-final-project-backend.onrender.com';

  private socket?: Socket;

  constructor(private http: HttpClient, private zone: NgZone) {}

  startChat() {
    return this.http.post<Conversation>(`${this.ChatApiUrl}/start`, {});
  }

  endChat(conversationId: string) {
    return this.http.put(`${this.ChatApiUrl}/close/${conversationId}`, {});
  }

  getUserChats(){
    return this.http.get<Conversation[]>(`${this.ChatApiUrl}`);
  }

  getAllChatsForAdmin(){
    return this.http.get<Conversation[]>(`${this.ChatApiUrl}/all`);
  }

  markMessagesAsRead(conversationId: string) {
    return this.http.put(`${this.MessageApiUrl}/${conversationId}/read`, {});
  }

  sendMessage(conversationId: string, content: string) {
    return this.http.post<Message>(`${this.MessageApiUrl}`, {
      conversationId,
      content
    });
  }

  getMessages(conversationId: string) {
    return this.http.get<Message[]>(`${this.MessageApiUrl}/${conversationId}`);
  }

  initializeSocketConnection(userId: string) {
    if (this.socket) return;

    this.socket = io(this.SocketApiUrl);

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socket?.emit('register', userId);
    });
  }

  onNewMessage(): Observable<Message> {
    return new Observable(observer => {
      this.socket?.on('new-message', (message: Message) => {
        this.zone.run(() => {
          observer.next(message);
        });
      });

      return () => {
        this.socket?.off('new-message');
      };
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = undefined;
  }
}
