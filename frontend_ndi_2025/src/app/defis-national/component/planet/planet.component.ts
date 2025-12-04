import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  selector: 'app-planet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planet.component.html',
  styleUrls: ['./planet.component.css']
})
export class PlanetComponent {
  @Input({ required: true }) planet!: Planet;
  @Input() isNear = false;
  @Output() planetClick = new EventEmitter<Planet>();

  get planetGradient(): string {
    return `radial-gradient(circle at 30% 30%, ${this.lightenColor(this.planet.color, 30)}, ${this.planet.color}, ${this.darkenColor(this.planet.color, 30)})`;
  }

  get planetShadow(): string {
    return `
      0 0 30px ${this.planet.glowColor},
      0 0 60px ${this.planet.glowColor},
      inset -10px -10px 30px rgba(0,0,0,0.4),
      inset 5px 5px 20px rgba(255,255,255,0.1)
    `;
  }

  onClick() {
    this.planetClick.emit(this.planet);
  }

  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `rgb(${R}, ${G}, ${B})`;
  }

  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `rgb(${R}, ${G}, ${B})`;
  }
}
