import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatButtonComponent } from './defis/chat-bruti/component/chat-button/chat-button.component';
import { ChatModalComponent } from './defis/chat-bruti/component/chat-modal/chat-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatButtonComponent, ChatModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend_ndi_2025');
  protected readonly isChatOpen = signal(false);

  toggleChat() {
    this.isChatOpen.update(value => !value);
  }

  closeChat() {
    this.isChatOpen.set(false);
  }
}
