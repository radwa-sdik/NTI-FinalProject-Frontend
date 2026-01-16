import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Conversation } from '../../models/conversation';
import { ChatService } from '../../services/chat-service';
import { Chat } from '../chat/chat';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Chat],
  templateUrl: './chat-list.html',
  styleUrl: './chat-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatList implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  selectedConversationId: string | null = null;
  selectedConversation: Conversation | null = null;
  isLoading = false;
  searchText = '';
  filterStatus: string = 'all';
  currentUserRole: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.userRole$
      .pipe(takeUntil(this.destroy$))
      .subscribe(role => {
        this.currentUserRole = role;
      });
    this.loadConversations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadConversations(): void {
    this.isLoading = true;
    if (this.currentUserRole !== 'Admin') {
      this.chatService.getUserChats()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.conversations = data.sort((a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            this.isLoading = false;
            this.changeDetector.markForCheck();
          }
        , error: (err) => {
            console.error('Error loading conversations:', err);
            this.isLoading = false;
          }
        });
      return;
    }else{
      this.chatService.getAllChatsForAdmin()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.conversations = data.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            this.isLoading = false;
            this.changeDetector.markForCheck();
          },
          error: (err) => {
            console.error('Error loading conversations:', err);
            this.isLoading = false;
          }
        });
    }
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversationId = conversation._id || null;
    this.selectedConversation = conversation;
    this.chatService.markMessagesAsRead(this.selectedConversationId!);
  }

  getFilteredConversations(): Conversation[] {
    return this.conversations.filter(conv => {
      const matchesSearch = conv.participants[0]._id?.toLowerCase().includes(this.searchText.toLowerCase()) || 
                           conv._id?.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesFilter = this.filterStatus === 'all' || conv.status === this.filterStatus;
      return matchesSearch && matchesFilter;
    });
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'active': return 'status-active';
      case 'closed': return 'status-closed';
      case 'waiting': return 'status-waiting';
      default: return '';
    }
  }

  refreshConversations(): void {
    this.loadConversations();
  }
}
