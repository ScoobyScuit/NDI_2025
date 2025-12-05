import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-retro-media-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './retro-media-player.component.html',
  styleUrls: ['./retro-media-player.component.css']
})
export class RetroMediaPlayerComponent {
  @Input() isNear: boolean = false;

  isPlaying = signal(false);
  currentTrack = signal(1);
  volume = signal(75);

  trackName = signal('SYNTHWAVE MIX');
  
  togglePlay() {
    this.isPlaying.update(v => !v);
  }

  nextTrack() {
    this.currentTrack.update(t => t < 12 ? t + 1 : 1);
  }

  prevTrack() {
    this.currentTrack.update(t => t > 1 ? t - 1 : 12);
  }
}

