import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateMazeFieldComponent } from '../../component/date-maze-field/date-maze-field.component';
import { AddressPuzzleFieldComponent } from '../../component/address-puzzle-field/address-puzzle-field.component';
import { MissingLetterFieldComponent } from '../../component/missing-letter-field/missing-letter-field.component';
import { ButtonPressureFieldComponent } from '../../component/button-pressure-field/button-pressure-field.component';
import { ActionSequenceFieldComponent } from '../../component/action-sequence-field/action-sequence-field.component';
import { MovingDragDropFieldComponent } from '../../component/moving-drag-drop-field/moving-drag-drop-field.component';
import { PortalBurgerComponent } from '../../../../defis-national/component/portal-burger/portal-burger.component';

/**
 * @brief Test page for ergonomie fields
 */
@Component({
  selector: 'app-temporal-maze-test',
  standalone: true,
  imports: [CommonModule, DateMazeFieldComponent, AddressPuzzleFieldComponent, MissingLetterFieldComponent, ButtonPressureFieldComponent, ActionSequenceFieldComponent, MovingDragDropFieldComponent, PortalBurgerComponent],
  template: `
    <app-portal-burger />
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
      <app-moving-drag-drop-field (dropCompleted)="onDropCompleted($event)" />
      @if (selectedDrop) {
        <div class="result">
          <p>Bloc déposé : {{ selectedDrop }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
    
    :host {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      font-family: 'Press Start 2P', monospace;
      background: #0a0a1a;
      background-image: 
        radial-gradient(2px 2px at 20% 30%, #00ff88, transparent),
        radial-gradient(2px 2px at 60% 70%, #4ecdc4, transparent),
        radial-gradient(1px 1px at 50% 50%, #fff, transparent),
        radial-gradient(1px 1px at 80% 10%, #a55eea, transparent),
        radial-gradient(2px 2px at 90% 40%, #ff6b6b, transparent),
        radial-gradient(1px 1px at 33% 60%, #f9ca24, transparent),
        radial-gradient(1px 1px at 66% 20%, #00ff88, transparent);
      background-size: 200% 200%, 200% 200%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%;
      background-position: 0% 0%, 100% 100%, 50% 50%, 80% 10%, 90% 40%, 33% 60%, 66% 20%;
      animation: starfield 20s linear infinite;
      position: relative;
    }
    
    :host::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 255, 136, 0.03) 2px,
        rgba(0, 255, 136, 0.03) 4px
      );
      pointer-events: none;
      z-index: 1;
    }
    
    :host::after {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(
        ellipse at center,
        transparent 0%,
        rgba(0, 0, 0, 0.4) 100%
      );
      pointer-events: none;
      z-index: 2;
    }
    
    @keyframes starfield {
      0% { background-position: 0% 0%, 100% 100%, 50% 50%, 80% 10%, 90% 40%, 33% 60%, 66% 20%; }
      100% { background-position: 100% 100%, 0% 0%, 50% 50%, 80% 10%, 90% 40%, 33% 60%, 66% 20%; }
    }
    
    .test-container {
      padding: 2rem;
      max-width: 900px;
      margin: 0 auto;
      min-height: 100%;
      position: relative;
      z-index: 10;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 3rem;
      color: #00ff88;
      text-shadow: 
        0 0 10px #00ff88,
        0 0 20px #00ff88,
        0 0 30px #00ff88,
        2px 2px 4px rgba(0, 0, 0, 0.8);
      font-size: 2rem;
      font-family: 'Press Start 2P', monospace;
      letter-spacing: 4px;
      animation: titleGlow 2s ease-in-out infinite alternate;
      position: relative;
      z-index: 10;
    }
    
    @keyframes titleGlow {
      0% {
        text-shadow: 
          0 0 10px #00ff88,
          0 0 20px #00ff88,
          0 0 30px #00ff88,
          2px 2px 4px rgba(0, 0, 0, 0.8);
      }
      100% {
        text-shadow: 
          0 0 20px #00ff88,
          0 0 30px #00ff88,
          0 0 40px #00ff88,
          0 0 50px #00ff88,
          2px 2px 4px rgba(0, 0, 0, 0.8);
      }
    }
    
    .result {
      margin: 1.5rem auto;
      padding: 1.5rem;
      background: rgba(0, 255, 136, 0.1);
      border: 2px solid #00ff88;
      border-radius: 0;
      text-align: center;
      max-width: 800px;
      backdrop-filter: blur(10px);
      box-shadow: 
        0 0 20px rgba(0, 255, 136, 0.3),
        inset 0 0 20px rgba(0, 255, 136, 0.1);
      position: relative;
      z-index: 10;
      font-family: 'Press Start 2P', monospace;
    }
    
    .result::before {
      content: '>';
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #00ff88;
      font-size: 1.5rem;
      animation: blink 1s infinite;
    }
    
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
    
    .result p {
      margin: 0;
      font-size: 0.7rem;
      font-weight: normal;
      color: #00ff88;
      text-shadow: 
        0 0 5px #00ff88,
        0 0 10px #00ff88;
      line-height: 1.8;
    }
  `]
})
export class TemporalMazeTestComponent {
  selectedDate: Date | null = null;
  selectedAddress: string | null = null;
  selectedText: string | null = null;
  selectedPressure: number | null = null;
  selectedSequence: string | null = null;
  selectedDrop: string | null = null;

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

  onDropCompleted(blockText: string): void {
    this.selectedDrop = blockText;
    console.log('Bloc déposé:', blockText);
  }
}

