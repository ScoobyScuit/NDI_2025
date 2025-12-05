import { Component, Input, ElementRef, ViewChild, AfterViewInit, effect, input, computed, signal, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface BlackHole {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
  pullStrength: number;
}

export interface PortalDestination {
  id: string;
  name: string;
  icon: string;
  description: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-black-hole',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './black-hole.component.html',
  styleUrls: ['./black-hole.component.css']
})
export class BlackHoleComponent implements AfterViewInit {
  @Input({ required: true }) blackHole!: BlackHole;
  @Input() isNear = false;
  
  @Output() menuOpened = new EventEmitter<void>();
  @Output() menuClosed = new EventEmitter<void>();
  @Output() openChatRequest = new EventEmitter<void>();
  
  speedMultiplier = input.required<number>();

  @ViewChild('rotatingGroup') rotatingGroupRef!: ElementRef<SVGGElement>;
  private animation: Animation | undefined;

  // État du menu portal
  isMenuOpen = signal(false);
  selectedIndex = signal(0);

  // Les 4 destinations du portail
  destinations: PortalDestination[] = [
    {
      id: 'chat',
      name: 'CHAT BRUTI',
      icon: '💬',
      description: 'Discutez avec notre IA rétro',
      route: '/nird', // On reste sur nird et on ouvre le chat
      color: '#00ff88'
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
      id: 'form',
      name: 'AJOUTER TALENT',
      icon: '📝',
      description: 'Partagez vos compétences',
      route: '/add-talent',
      color: '#ffd93d'
    },
    {
      id: 'talents',
      name: 'TALENTS',
      icon: '🎴',
      description: 'Découvrez la communauté',
      route: '/talents',
      color: '#6c5ce7'
    }
  ];

  constructor(private router: Router) {
    effect(() => {
      const speed = this.speedMultiplier();
      if (this.animation) {
        this.animation.playbackRate = speed;
      }
    });
  }

  // Calcul de la taille du disque noir
  coreScale = computed(() => {
    const speed = this.speedMultiplier();
    const maxSpeed = 25;
    const maxScale = 3.5; 
    const ratio = (speed - 1) / (maxSpeed - 1);
    return 1 + (ratio * (maxScale - 1));
  });

  ngAfterViewInit() {
    this.animation = this.rotatingGroupRef.nativeElement.animate(
      [
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(360deg)' }
      ],
      {
        duration: 20000,
        iterations: Infinity,
        easing: 'linear'
      }
    );
  }

  // Ouvrir le menu du portail
  openMenu() {
    this.isMenuOpen.set(true);
    this.selectedIndex.set(0);
    this.menuOpened.emit();
  }

  // Fermer le menu du portail
  closeMenu() {
    this.isMenuOpen.set(false);
    this.menuClosed.emit();
  }

  // Navigation clavier dans le menu
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.isMenuOpen()) return;

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
        this.closeMenu();
        break;
    }
  }

  // Sélectionner une destination
  selectDestination(dest: PortalDestination) {
    this.closeMenu();
    
    if (dest.id === 'chat') {
      // Pour le chat, on émet un événement pour que le parent ouvre le chat
      this.openChatRequest.emit();
      return;
    }
    
    this.router.navigate([dest.route]);
  }

  // Getter pour savoir si le menu est ouvert (pour le parent)
  isPortalMenuOpen(): boolean {
    return this.isMenuOpen();
  }
}