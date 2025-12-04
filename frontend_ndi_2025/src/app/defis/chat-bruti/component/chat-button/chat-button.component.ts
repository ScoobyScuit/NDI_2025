import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-button.component.html',
  styleUrl: './chat-button.component.css'
})
export class ChatButtonComponent {
  isOpen = input.required<boolean>();
  toggleChat = output<void>();

  onToggleChat() {
    this.toggleChat.emit();
  }
}

