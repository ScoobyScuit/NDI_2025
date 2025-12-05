import { Component, Input, ElementRef, ViewChild, AfterViewInit, effect, input, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BlackHole {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
  pullStrength: number;
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
  
  @Output() openPortal = new EventEmitter<void>();
  
  speedMultiplier = input.required<number>();

  @ViewChild('rotatingGroup') rotatingGroupRef!: ElementRef<SVGGElement>;
  private animation: Animation | undefined;

  constructor() {
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

  // Ouvrir le portail (émet un événement vers le parent)
  triggerPortal() {
    this.openPortal.emit();
  }
}