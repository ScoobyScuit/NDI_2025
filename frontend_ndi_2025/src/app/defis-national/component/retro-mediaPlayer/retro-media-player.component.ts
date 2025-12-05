import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-retro-media-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './retro-media-player.component.html',
  styleUrls: ['./retro-media-player.component.css']
})
export class RetroMediaPlayerComponent {
  @Input() isNear: boolean = false;
  @Output() mediaPlayerClick = new EventEmitter<void>();

  isPlaying = signal(false);
  currentTrack = signal(1);
  volume = signal(75);

  trackName = signal('SYNTHWAVE MIX');

  constructor(private router: Router) {}
  
  togglePlay() {
    this.isPlaying.update(v => !v);
  }

  nextTrack() {
    this.currentTrack.update(t => t < 12 ? t + 1 : 1);
  }

  prevTrack() {
    this.currentTrack.update(t => t > 1 ? t - 1 : 12);
  }

  onClick() {
    this.mediaPlayerClick.emit();
    this.navigateToVisualizer();
  }

  navigateToVisualizer() {
    this.router.navigate(['/retro-visualizer']);
  }
}

