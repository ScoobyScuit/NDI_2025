import { Component, input, output, signal, effect, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
        content: 'Bonjour ! Je suis votre assistant. Comment puis-je vous aider ?',
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

    // Simuler une réponse (à remplacer par un appel API réel)
    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: `Vous avez dit : "${message}". C'est une réponse simulée. Connectez-moi à votre API pour des réponses réelles !`,
        timestamp: new Date()
      };
      this.messages.update(msgs => [...msgs, assistantMessage]);
      this.isLoading.set(false);
      this.scrollToBottom();
    }, 1000);
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

