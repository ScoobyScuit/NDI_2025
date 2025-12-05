import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-screen" [class.fade-out]="isLoaded">
      <div class="loading-content">
        <div class="loading-logo">
          <span class="logo-letter" *ngFor="let letter of letters; let i = index"
                [style.animation-delay]="i * 0.1 + 's'">
            {{ letter }}
          </span>
        </div>
        
        <div class="loading-card">
          <div class="card-shimmer"></div>
          <div class="card-avatar">
            <span>?</span>
          </div>
        </div>

        <div class="loading-bar">
          <div class="loading-bar__fill"></div>
        </div>
        
        <p class="loading-text">Chargement des talents...</p>
      </div>

      <div class="loading-particles">
        <span class="particle" *ngFor="let p of particles" 
              [style.left]="p.x + '%'"
              [style.animation-delay]="p.delay + 's'"
              [style.animation-duration]="p.duration + 's'">
          {{ p.emoji }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .loading-screen {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: linear-gradient(135deg, #1B4D4A 0%, #3DB4AD 50%, #1B4D4A 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.6s ease, visibility 0.6s ease;
    }

    .loading-screen.fade-out {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      z-index: 2;
    }

    .loading-logo {
      display: flex;
      gap: 0.1em;
    }

    .logo-letter {
      font-family: 'Fredoka', sans-serif;
      font-size: clamp(3rem, 8vw, 5rem);
      font-weight: 700;
      color: #F5D547;
      text-shadow: 4px 4px 0 #1a1a1a;
      animation: letterBounce 0.8s ease infinite;
      display: inline-block;
    }

    @keyframes letterBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }

    .loading-card {
      width: 120px;
      height: 160px;
      background: linear-gradient(160deg, #F5D547 0%, #E8C84A 100%);
      border-radius: 12px;
      border: 4px solid #1a1a1a;
      box-shadow: 6px 6px 0 #1a1a1a;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: cardFloat 2s ease-in-out infinite;
    }

    @keyframes cardFloat {
      0%, 100% { transform: translateY(0) rotate(-3deg); }
      50% { transform: translateY(-10px) rotate(3deg); }
    }

    .card-shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        110deg,
        transparent 20%,
        rgba(255, 255, 255, 0.5) 50%,
        transparent 80%
      );
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .card-avatar {
      width: 60px;
      height: 60px;
      background: #3DB4AD;
      border-radius: 50%;
      border: 3px solid #1a1a1a;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }

    .card-avatar span {
      font-family: 'Fredoka', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
      animation: pulse 1s ease infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .loading-bar {
      width: 200px;
      height: 12px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 999px;
      overflow: hidden;
      border: 2px solid #1a1a1a;
    }

    .loading-bar__fill {
      height: 100%;
      background: linear-gradient(90deg, #F5D547, #FF7F6B, #F5D547);
      background-size: 200% 100%;
      border-radius: 999px;
      animation: loadingProgress 2s ease-in-out forwards, gradientMove 1s linear infinite;
    }

    @keyframes loadingProgress {
      0% { width: 0%; }
      100% { width: 100%; }
    }

    @keyframes gradientMove {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }

    .loading-text {
      font-family: 'Quicksand', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: #fff;
      animation: textPulse 1.5s ease infinite;
    }

    @keyframes textPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .loading-particles {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .particle {
      position: absolute;
      font-size: 1.5rem;
      animation: particleFloat 4s ease-in-out infinite;
      opacity: 0.7;
    }

    @keyframes particleFloat {
      0% { 
        transform: translateY(100vh) rotate(0deg); 
        opacity: 0;
      }
      10% { opacity: 0.7; }
      90% { opacity: 0.7; }
      100% { 
        transform: translateY(-100px) rotate(360deg); 
        opacity: 0;
      }
    }
  `]
})
export class LoadingScreen implements OnInit {
  isLoaded = false;
  letters = ['T', 'A', 'L', 'E', 'N', 'T', 'S'];
  
  particles = [
    { emoji: '⚡', x: 10, delay: 0, duration: 4 },
    { emoji: '🎯', x: 25, delay: 0.5, duration: 5 },
    { emoji: '🚀', x: 40, delay: 1, duration: 4.5 },
    { emoji: '💡', x: 55, delay: 0.3, duration: 5.5 },
    { emoji: '✨', x: 70, delay: 0.8, duration: 4 },
    { emoji: '🔥', x: 85, delay: 0.2, duration: 5 },
    { emoji: '💫', x: 15, delay: 1.2, duration: 4.5 },
    { emoji: '🌟', x: 60, delay: 0.6, duration: 5 },
  ];

  ngOnInit() {
    // Simulate loading time
    setTimeout(() => {
      this.isLoaded = true;
    }, 2500);
  }
}

