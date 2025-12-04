import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateMazeFieldComponent } from '../../component/date-maze-field/date-maze-field.component';

/**
 * @brief Test page for date maze field
 */
@Component({
  selector: 'app-temporal-maze-test',
  standalone: true,
  imports: [CommonModule, DateMazeFieldComponent],
  template: `
    <div class="test-container">
      <h1>Défis Ergonomie</h1>
      <app-date-maze-field (dateSelected)="onDateSelected($event)" />
      @if (selectedDate) {
        <div class="result">
          <p>Date sélectionnée : {{ selectedDate | date:'dd/MM/yyyy' }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
    }
    
    .test-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      min-height: 100%;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 2rem;
      color: #fff;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
    
    .result {
      margin-top: 2rem;
      padding: 1rem;
      background: #e8f5e9;
      border-radius: 8px;
      text-align: center;
    }
    
    .result p {
      margin: 0;
      font-size: 1.2rem;
      font-weight: bold;
      color: #2e7d32;
    }
  `]
})
export class TemporalMazeTestComponent {
  selectedDate: Date | null = null;

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    console.log('Date sélectionnée:', date);
  }
}

