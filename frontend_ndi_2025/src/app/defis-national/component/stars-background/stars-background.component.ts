import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDuration: number;
  animationDelay: number;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  duration: number;
  delay: number;
}

@Component({
  selector: 'app-stars-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stars-background.component.html',
  styleUrls: ['./stars-background.component.css']
})
export class StarsBackgroundComponent implements OnInit {
  stars = signal<Star[]>([]);
  shootingStars = signal<ShootingStar[]>([]);

  ngOnInit() {
    this.generateStars();
    this.generateShootingStars();
  }

  private generateStars() {
    const starCount = 150;
    const newStars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      newStars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        animationDuration: Math.random() * 3 + 2,
        animationDelay: Math.random() * 5
      });
    }

    this.stars.set(newStars);
  }

  private generateShootingStars() {
    const shootingStarCount = 5;
    const newShootingStars: ShootingStar[] = [];

    for (let i = 0; i < shootingStarCount; i++) {
      newShootingStars.push({
        id: i,
        startX: Math.random() * 50,
        startY: Math.random() * 30,
        duration: Math.random() * 2 + 1,
        delay: Math.random() * 10 + i * 3
      });
    }

    this.shootingStars.set(newShootingStars);
  }
}
