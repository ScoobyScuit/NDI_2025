import { Component, Input, Output, EventEmitter, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-retro-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './retro-form.component.html',
  styleUrls: ['./retro-form.component.css']
})
export class RetroFormComponent implements OnInit, OnDestroy {
  @Input() isNear: boolean = false;
  @Output() formClick = new EventEmitter<void>();
  
  displayLines = signal<string[]>([]);
  
  private intervalId: any;

  private messages = [
    "FORMULAIRE",
    "INSCRIPTION",
    "REJOINS-NOUS !",
  ];

  constructor(private router: Router) {}

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
    }, 500);
  }

  onClick() {
    this.formClick.emit();
    this.navigateToForm();
  }

  navigateToForm() {
    // TODO: Remplacer par la route du formulaire quand elle sera créée
    this.router.navigate(['/add-talent']);
  }
}
