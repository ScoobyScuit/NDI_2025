import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rocket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rocket.component.html',
  styleUrls: ['./rocket.component.css']
})
export class RocketComponent {
  @Input({ required: true }) x!: number;
  @Input({ required: true }) y!: number;
  @Input({ required: true }) rotation!: number;
  @Input({ required: true }) isFlying!: boolean;
  
  // Reçoit le facteur de rétrécissement
  @Input() scale: number = 1;
}