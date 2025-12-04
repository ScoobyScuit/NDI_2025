import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Planet {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  icon: string;
  title: string;
  content: string[];
  visited: boolean;
}

@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.css']
})
export class InfoModalComponent {
  @Input({ required: true }) planet!: Planet;
  @Input() visitedCount = 1;
  @Output() closeModal = new EventEmitter<void>();

  @HostListener('window:keydown.escape')
  @HostListener('window:keydown.space')
  @HostListener('window:keydown.enter')
  onKeyClose() {
    this.onClose();
  }

  onClose() {
    this.closeModal.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onClose();
    }
  }
}
