import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  AfterViewChecked,
  ChangeDetectionStrategy,
  NgZone,
  Input
} from '@angular/core';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { Message } from '../../models/message';
import { ChatService } from '../../services/chat-service';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, TitleCasePipe],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Chat implements OnInit, OnDestroy {
  @ViewChild('messagesArea') private messagesArea!: ElementRef;

  @Input() currentChatId!: string;
  messages: Message[] = [];
  @Input() chatStatus: string = 'active';

  messageText = '';
  isSending = false;
  currentUserId!: string;
  currentUserRole: string | null = null;

  showEndChatConfirmation = false;
  isEndingChat = false;

  private destroy$ = new Subject<void>();
  private shouldScroll = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private _changeDetector: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    // Get user data
    this.authService.currentUserId$
      .pipe(takeUntil(this.destroy$))
      .subscribe(id => {
        if (!id) return;
        this.currentUserId = id;
        this.chatService.initializeSocketConnection(id);

        // Subscribe to new messages after socket is ready
        this.chatService.onNewMessage()
          .pipe(takeUntil(this.destroy$))
          .subscribe(message => {
            this.messages = [...this.messages, message];
            this.scrollToBottom();
            this._changeDetector.markForCheck();
          });
      });


    this.authService.userRole$
      .pipe(takeUntil(this.destroy$))
      .subscribe(role => (this.currentUserRole = role));

    if (this.currentChatId) {
      return;
    }
    // Start chat
    this.chatService.startChat()
      .pipe(
        takeUntil(this.destroy$),
        switchMap(chat => {
          this.currentChatId = chat._id!;
          this.chatStatus = chat.status || 'active';
          return this.chatService.getMessages(this.currentChatId);
        })
      )
      .subscribe(messages => {
        this.messages = messages;
        this.scrollToBottom();
        this._changeDetector.markForCheck();
      });

    // Socket listener for chat status changes
    // this.chatService.onConversationStatusChange()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(status => {
    //     this.chatStatus = status;
    //     this._changeDetector.markForCheck();
    //   });

    // Socket listener (ONE TIME)
    this.chatService.onNewMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.messages = [...this.messages, message];
        this.scrollToBottom();
        this._changeDetector.markForCheck();
      });
  }

  ngOnChanges(): void {
    if (this.currentChatId) {
      this.chatService.getMessages(this.currentChatId)
        .subscribe(messages => {
          this.messages = messages;
          this.scrollToBottom();
          this._changeDetector.markForCheck();
        });
    }
  }


  sendMessage(event?: Event) {
    const keyboardEvent = event as KeyboardEvent;

    if (keyboardEvent?.shiftKey && keyboardEvent.key === 'Enter') {
      return; // allow newline
    }

    if (keyboardEvent?.key === 'Enter') {
      event?.preventDefault();
    }

    if (!this.messageText.trim() || this.isSending) return;

    this.isSending = true;

    this.chatService.sendMessage(this.currentChatId, this.messageText)
      .subscribe({
        next: message => {
          // this.messages = [...this.messages, message];
          this.messageText = '';
          this.isSending = false;
          this.scrollToBottom();
          this._changeDetector.markForCheck();
        },
        error: () => {
          this.isSending = false;
        }
      });
  }

  isSentByCurrentUser(message: Message): boolean {
    return message.sender._id === this.currentUserId;
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'active': 'bi-check-circle',
      'closed': 'bi-x-circle',
      'waiting': 'bi-hourglass-split'
    };
    return iconMap[status] || 'bi-info-circle';
  }

  openEndChatConfirmation(): void {
    this.showEndChatConfirmation = true;
  }

  closeEndChatConfirmation(): void {
    this.showEndChatConfirmation = false;
  }

  confirmEndChat(): void {
    if (this.isEndingChat || !this.currentChatId) return;

    this.isEndingChat = true;

    this.chatService.endChat(this.currentChatId)
      .subscribe({
        next: () => {
          this.chatStatus = 'closed';
          this.showEndChatConfirmation = false;
          this.isEndingChat = false;
          this._changeDetector.markForCheck();
        },
        error: (error) => {
          console.error('Error ending chat:', error);
          this.isEndingChat = false;
          alert('Failed to end chat. Please try again.');
          this._changeDetector.markForCheck();
        }
      });
  }

  startNewChat(): void {
    this.messageText = '';
    this.messages = [];
    this.chatStatus = 'active';
    this.showEndChatConfirmation = false;

    this.chatService.startChat()
      .pipe(
        takeUntil(this.destroy$),
        switchMap(chat => {
          this.currentChatId = chat._id!;
          this.chatStatus = chat.status || 'active';
          return this.chatService.getMessages(this.currentChatId);
        })
      )
      .subscribe(messages => {
        this.messages = messages;
        this.scrollToBottom();
        this._changeDetector.markForCheck();
      });
  }

  private scrollToBottom(): void {
    console.log('Scrolling to bottom...');
    setTimeout(() => {
      const container = this.messagesArea?.nativeElement;
      if (!container) return;
      container.scrollTop = container.scrollHeight;
    }, 100);
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chatService.disconnect();
  }
}
