import { Component, Output, EventEmitter, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface PortalDestination {
  id: string;
  name: string;
  icon: string;
  description: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-portal-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portal-menu.component.html',
  styleUrls: ['./portal-menu.component.css']
})
export class PortalMenuComponent {
  @Output() closeMenu = new EventEmitter<void>();
  @Output() openChatRequest = new EventEmitter<void>();

  selectedIndex = signal(0);

  // Les 5 destinations du portail
  destinations: PortalDestination[] = [
    {
      id: 'nird',
      name: 'PROJET NIRD',
      icon: '🚀',
      description: 'Retour à la mission spatiale',
      route: '/nird',
      color: '#00ff88'
    },
    {
      id: 'chat',
      name: 'CHAT BRUTI',
      icon: '💬',
      description: 'Discutez avec notre IA rétro',
      route: '/nird',
      color: '#4ecdc4'
    },
    {
      id: 'visualizer',
      name: 'VISUALISEUR',
      icon: '🎵',
      description: 'Visualiseur audio rétro',
      route: '/retro-visualizer',
      color: '#ff6b9d'
    },
    {
      id: 'talents',
      name: 'TALENTS',
      icon: '📝',
      description: 'Partagez vos compétences',
      route: '/landing-page',
      color: '#ffd93d'
    },
    {
      id: 'form',
      name: 'LABYRINTHE TEMPOREL',
      icon: '🎴',
      description: 'Défis ergonomie',
      route: '/ergonomie/labyrinthe-temporel',
      color: '#6c5ce7'
    }
  ];

  constructor(private router: Router) {}

  // Navigation clavier dans le menu
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
      case 'z':
      case 'w':
        event.preventDefault();
        this.selectedIndex.update(i => (i - 1 + this.destinations.length) % this.destinations.length);
        break;
      case 'ArrowDown':
      case 's':
        event.preventDefault();
        this.selectedIndex.update(i => (i + 1) % this.destinations.length);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectDestination(this.destinations[this.selectedIndex()]);
        break;
      case 'Escape':
        event.preventDefault();
        this.onClose();
        break;
    }
  }

  // Fermer le menu
  onClose() {
    this.closeMenu.emit();
  }

  // Clic sur l'overlay
  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('portal-overlay')) {
      this.onClose();
    }
  }

  // Sélectionner une destination
  selectDestination(dest: PortalDestination) {
    if (dest.id === 'chat') {
      // Pour le chat, on émet un événement pour que le parent ouvre le chat
      this.closeMenu.emit();
      this.openChatRequest.emit();
      return;
    }
    
    this.closeMenu.emit();
    this.router.navigate([dest.route]);
  }
}
