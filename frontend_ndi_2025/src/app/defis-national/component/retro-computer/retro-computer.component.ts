import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-retro-computer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './retro-computer.component.html',
  styleUrls: ['./retro-computer.component.css']
})
export class RetroComputerComponent implements OnInit, OnDestroy {
  displayLines = signal<string[]>([]);
  
  private messages = [
    "SYSTEME NIRD v1.0",
    "CONNEXION...",
    "OK.",
    "SCANNEURS ACTIFS",
    "ATTENTE PILOTE..."
  ];

  private intervalId: any;

  ngOnInit() {
    this.bootSequence();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private bootSequence() {
    let lineIndex = 0;
    
    this.intervalId = setInterval(() => {
      if (lineIndex < this.messages.length) {
        this.displayLines.update(lines => [...lines, this.messages[lineIndex]]);
        lineIndex++;
      } else {
        clearInterval(this.intervalId);
      }
    }, 800);
  }
}