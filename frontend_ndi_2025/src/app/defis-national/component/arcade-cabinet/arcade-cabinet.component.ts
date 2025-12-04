import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-arcade-cabinet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './arcade-cabinet.component.html',
  styleUrls: ['./arcade-cabinet.component.css']
})
export class ArcadeCabinetComponent {
  @Output() startGame = new EventEmitter<void>();
  
  lights = Array.from({ length: 8 }, (_, i) => i);

  onStart() {
    this.startGame.emit();
  }
}
