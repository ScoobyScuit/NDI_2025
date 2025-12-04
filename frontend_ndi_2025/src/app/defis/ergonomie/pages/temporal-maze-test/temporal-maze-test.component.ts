import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateMazeFieldComponent } from '../../component/date-maze-field/date-maze-field.component';
import { AddressPuzzleFieldComponent } from '../../component/address-puzzle-field/address-puzzle-field.component';
import { MissingLetterFieldComponent } from '../../component/missing-letter-field/missing-letter-field.component';
import { ButtonPressureFieldComponent } from '../../component/button-pressure-field/button-pressure-field.component';
import { ActionSequenceFieldComponent } from '../../component/action-sequence-field/action-sequence-field.component';

/**
 * @brief Test page for ergonomie fields
 */
@Component({
  selector: 'app-temporal-maze-test',
  standalone: true,
  imports: [CommonModule, DateMazeFieldComponent, AddressPuzzleFieldComponent, MissingLetterFieldComponent, ButtonPressureFieldComponent, ActionSequenceFieldComponent],
  template: `
    <div class="test-container">
      <h1>Défis Ergonomie</h1>
      <app-date-maze-field (dateSelected)="onDateSelected($event)" />
      @if (selectedDate) {
        <div class="result">
          <p>Date sélectionnée : {{ selectedDate | date:'dd/MM/yyyy' }}</p>
        </div>
      }
      <app-address-puzzle-field (addressSelected)="onAddressSelected($event)" />
      @if (selectedAddress) {
        <div class="result">
          <p>Adresse sélectionnée : {{ selectedAddress }}</p>
        </div>
      }
      <app-missing-letter-field (textSelected)="onTextSelected($event)" />
      @if (selectedText) {
        <div class="result">
          <p>Texte sélectionné : {{ selectedText }}</p>
        </div>
      }
      <app-button-pressure-field (pressureCompleted)="onPressureCompleted($event)" />
      @if (selectedPressure) {
        <div class="result">
          <p>Pression validée : {{ selectedPressure.toFixed(1) }}s</p>
        </div>
      }
      <app-action-sequence-field (sequenceCompleted)="onSequenceCompleted($event)" />
      @if (selectedSequence) {
        <div class="result">
          <p>Séquence complétée : {{ selectedSequence }}</p>
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
      max-width: 900px;
      margin: 0 auto;
      min-height: 100%;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 3rem;
      color: #fff;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      font-size: 2.5rem;
    }
    
    .result {
      margin: 1.5rem auto;
      padding: 1.5rem;
      background: rgba(39, 174, 96, 0.2);
      border: 2px solid rgba(39, 174, 96, 0.5);
      border-radius: 8px;
      text-align: center;
      max-width: 800px;
      backdrop-filter: blur(10px);
    }
    
    .result p {
      margin: 0;
      font-size: 1.2rem;
      font-weight: bold;
      color: #4ecdc4;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }
  `]
})
export class TemporalMazeTestComponent {
  selectedDate: Date | null = null;
  selectedAddress: string | null = null;
  selectedText: string | null = null;
  selectedPressure: number | null = null;
  selectedSequence: string | null = null;

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    console.log('Date sélectionnée:', date);
  }

  onAddressSelected(address: string): void {
    this.selectedAddress = address;
    console.log('Adresse sélectionnée:', address);
  }

  onTextSelected(text: string): void {
    this.selectedText = text;
    console.log('Texte sélectionné:', text);
  }

  onPressureCompleted(duration: number): void {
    this.selectedPressure = duration;
    console.log('Pression validée:', duration);
  }

  onSequenceCompleted(sequence: string): void {
    this.selectedSequence = sequence;
    console.log('Séquence complétée:', sequence);
  }
}

