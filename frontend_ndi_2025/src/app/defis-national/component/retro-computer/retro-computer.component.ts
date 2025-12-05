import { Component, OnInit, OnDestroy, signal, Input, OnChanges, SimpleChanges, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatModalComponent } from '../../../defis/chat-bruti/component/chat-modal/chat-modal.component';

@Component({
  selector: 'app-retro-computer',
  standalone: true,
  imports: [CommonModule, ChatModalComponent],
  templateUrl: './retro-computer.component.html',
  styleUrls: ['./retro-computer.component.css']
})
export class RetroComputerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isNear: boolean = false;

  displayLines = signal<string[]>([]);
  isChatOpen = signal(false);

  // Ajoute la classe 'chat-open' quand le chat est ouvert
  @HostBinding('class.chat-open')
  get chatOpenClass() {
    return this.isChatOpen();
  }
  
  private messages = [
    "SYSTEME NIRD v1.0",
    "CONNEXION...",
    "OK.",
    "SCANNEURS ACTIFS",
    "ATTENTE PILOTE..."
  ];

  private intervalId: any;

  ngOnInit() {
    this.bootSequence();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Ouvrir le chat automatiquement quand la fusée entre en contact
    if (changes['isNear'] && changes['isNear'].currentValue === true && !changes['isNear'].previousValue) {
      this.openChat();
    }
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private bootSequence() {
    let lineIndex = 0;
    
    this.intervalId = setInterval(() => {
      if (lineIndex < this.messages.length) {
        this.displayLines.update(lines => [...lines, this.messages[lineIndex]]);
        lineIndex++;
      } else {
        clearInterval(this.intervalId);
      }
    }, 800);
  }

  openChat() {
    this.isChatOpen.set(true);
  }

  closeChat() {
    this.isChatOpen.set(false);
  }
}
