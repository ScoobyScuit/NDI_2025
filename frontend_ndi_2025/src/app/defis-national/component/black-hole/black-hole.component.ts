import { Component, Input, ElementRef, ViewChild, AfterViewInit, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interface définissant les propriétés d'un trou noir
export interface BlackHole {
  id: string;
  name: string;
  x: number; // Position horizontale en %
  y: number; // Position verticale en %
  size: number; // Taille en pixels
  pullStrength: number; // Force visuelle de l'attraction (pour la rotation/échelle)
}

@Component({
  selector: 'app-black-hole',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './black-hole.component.html',
  styleUrls: ['./black-hole.component.css']
})
export class BlackHoleComponent implements AfterViewInit {
  // Données du trou noir (requises)
  @Input({ required: true }) blackHole!: BlackHole;
  
  // Indique si la fusée est proche (pour activer les effets)
  @Input() isNear = false;

  // NOUVEAU : Signal Input pour recevoir la vitesse du parent
  speedMultiplier = input.required<number>();

  // NOUVEAU : Référence à l'élément SVG qui tourne
  @ViewChild('rotatingGroup') rotatingGroupRef!: ElementRef<SVGGElement>;

  // Stocke l'objet d'animation JS
  private animation: Animation | undefined;

  constructor() {
    // NOUVEAU : Effet qui met à jour la vitesse de l'animation quand le signal change
    effect(() => {
      const speed = this.speedMultiplier();
      if (this.animation) {
        // Met à jour la vitesse de lecture instantanément
        this.animation.playbackRate = speed;
      }
    });
  }

  ngAfterViewInit() {
    // NOUVEAU : Création de l'animation avec JavaScript
    this.animation = this.rotatingGroupRef.nativeElement.animate(
      [
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(360deg)' }
      ],
      {
        duration: 20000, // Vitesse de base (très lente)
        iterations: Infinity, // Tourne pour toujours
        easing: 'linear' // Vitesse constante dans un tour
      }
    );
  }

  // L'ancien getter pullingEffect n'est plus utilisé
}