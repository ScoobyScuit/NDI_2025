import { Component, input, output, signal, effect, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatBrutiService } from '../../services/chat-bruti.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-modal.component.html',
  styleUrl: './chat-modal.component.css'
})
export class ChatModalComponent implements AfterViewInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('inputField') inputField!: ElementRef<HTMLInputElement>;

  private chatService = inject(ChatBrutiService);

  isOpen = input.required<boolean>();
  closeModal = output<void>();

  messages = signal<Message[]>([]);
  userInput = signal('');
  isLoading = signal(false);

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        // Focus sur l'input quand la modal s'ouvre
        setTimeout(() => {
          this.inputField?.nativeElement?.focus();
        }, 100);
        // Scroll vers le bas
        this.scrollToBottom();
      }
    });
  }

  ngAfterViewInit() {
    // Ajouter un message de bienvenue
    if (this.messages().length === 0) {
      this.messages.set([{
        role: 'assistant',
        content: 'Bonjour ! Je suis Bruti, votre assistant complètement à côté de la plaque mais hilarant ! Comment puis-je vous aider ?',
        timestamp: new Date()
      }]);
    }
  }

  sendMessage() {
    const message = this.userInput().trim();
    if (!message || this.isLoading()) return;

    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    this.messages.update(msgs => [...msgs, userMessage]);
    this.userInput.set('');
    this.isLoading.set(true);

    // Appel à l'API backend
    this.chatService.sendMessage(message).subscribe({
      next: (response) => {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.response,
          timestamp: new Date(response.timestamp)
        };
        this.messages.update(msgs => [...msgs, assistantMessage]);
        this.isLoading.set(false);
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi du message:', error);
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Oups ! Il semble y avoir un problème de connexion. Vérifiez que le backend est bien démarré et que l\'API est accessible.',
          timestamp: new Date()
        };
        this.messages.update(msgs => [...msgs, errorMessage]);
        this.isLoading.set(false);
        this.scrollToBottom();
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  close() {
    this.closeModal.emit();
  }
}

