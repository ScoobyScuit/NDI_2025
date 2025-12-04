import { Component, signal, OnInit, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * @brief Action sequence field component
 * 
 * Interactive field where user must follow a specific sequence:
 * 1. Click "Start" button
 * 2. Type exactly 2 letters
 * 3. Wait 2 seconds without typing
 * 4. Type exactly 1 digit
 * 5. Make circular mouse movement (1s)
 * 6. Type remaining text (3-8 characters)
 */
@Component({
  selector: 'app-action-sequence-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './action-sequence-field.component.html',
  styleUrl: './action-sequence-field.component.css'
})
export class ActionSequenceFieldComponent implements OnInit, OnDestroy {
  @Output() sequenceCompleted = new EventEmitter<string>();

  // Game state
  isStarted = signal(false);
  isActive = signal(false);
  
  // Current step in the sequence
  currentStep = signal(0);
  
  // Step names
  readonly STEPS = [
    'Cliquer sur "Start"',
    'Taper exactement 2 lettres',
    'Attendre 2 secondes',
    'Taper exactement 1 chiffre',
    'Appuyer sur la séquence de flèches',
    'Taper le reste du texte (3-8 caractères)'
  ];
  
  // Input value
  inputValue = signal('');
  
  // Step 1: Start button clicked
  private startButtonClicked = false;
  
  // Step 2: 2 letters typed
  lettersTyped = '';
  
  // Step 3: Wait 2 seconds
  private waitStartTime: number | null = null;
  private waitTimeout: ReturnType<typeof setTimeout> | null = null;
  private isWaiting = signal(false);
  
  // Step 4: 1 digit typed
  digitTyped = '';
  
  // Step 5: Arrow key sequence
  arrowSequence: string[] = [];
  currentArrowIndex = 0;
  private isWaitingForArrows = signal(false);
  
  // Step 6: Remaining text (5-10 characters - increased difficulty)
  private remainingText = '';
  private readonly REMAINING_TEXT_LENGTH = Math.floor(Math.random() * 6) + 5; // 5-10 characters
  
  // Error handling
  showError = signal(false);
  errorMessage = signal('');
  private errorTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // Arrow key names
  private readonly ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  private readonly ARROW_NAMES: { [key: string]: string } = {
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→'
  };

  ngOnInit() {
    this.generateArrowSequence();
  }

  ngOnDestroy() {
    if (this.waitTimeout) {
      clearTimeout(this.waitTimeout);
    }
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
  }

  /**
   * @brief Generate a random sequence of 10 arrow keys (increased difficulty)
   */
  private generateArrowSequence(): void {
    this.arrowSequence = [];
    for (let i = 0; i < 10; i++) {
      const randomArrow = this.ARROW_KEYS[Math.floor(Math.random() * this.ARROW_KEYS.length)];
      this.arrowSequence.push(randomArrow);
    }
  }

  /**
   * @brief Get arrow sequence display (with symbols)
   */
  getArrowSequenceDisplay(): string {
    return this.arrowSequence.map(key => this.ARROW_NAMES[key]).join(' ');
  }

  /**
   * @brief Get current arrow to press
   */
  getCurrentArrow(): string {
    if (this.currentArrowIndex < this.arrowSequence.length) {
      return this.ARROW_NAMES[this.arrowSequence[this.currentArrowIndex]];
    }
    return '';
  }

  /**
   * @brief Get progress in arrow sequence (0-100)
   */
  getArrowProgress(): number {
    return (this.currentArrowIndex / this.arrowSequence.length) * 100;
  }

  /**
   * @brief Handle arrow key press
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isWaitingForArrows() || !this.isActive()) return;
    
    // Only handle arrow keys
    if (!this.ARROW_KEYS.includes(event.key)) return;
    
    event.preventDefault();
    
    // Check if this is the correct arrow
    if (event.key === this.arrowSequence[this.currentArrowIndex]) {
      // Correct arrow - move to next
      this.currentArrowIndex++;
      
      if (this.currentArrowIndex >= this.arrowSequence.length) {
        // Sequence completed - move to step 6
        this.isWaitingForArrows.set(false);
        this.currentStep.set(5);
        this.inputValue.set(this.lettersTyped + this.digitTyped);
      }
    } else {
      // Wrong arrow - error
      this.showSequenceError('Flèche incorrecte ! La séquence a été réinitialisée.');
    }
  }

  /**
   * @brief Start the field - called when user clicks start button
   */
  startField(): void {
    this.isStarted.set(true);
    this.isActive.set(true);
    this.currentStep.set(0);
    this.resetSequence();
  }

  /**
   * @brief Reset the sequence
   */
  private resetSequence(): void {
    this.startButtonClicked = false;
    this.lettersTyped = '';
    this.digitTyped = '';
    this.remainingText = '';
    this.inputValue.set('');
    this.waitStartTime = null;
    this.isWaiting.set(false);
    this.isWaitingForArrows.set(false);
    this.currentArrowIndex = 0;
    this.generateArrowSequence();
    if (this.waitTimeout) {
      clearTimeout(this.waitTimeout);
      this.waitTimeout = null;
    }
  }

  /**
   * @brief Handle step 1: Click Start button
   */
  onStartButtonClick(): void {
    if (this.currentStep() !== 0) {
      this.showSequenceError('Vous devez d\'abord cliquer sur "Start"');
      return;
    }
    
    this.startButtonClicked = true;
    this.currentStep.set(1);
    this.inputValue.set('');
  }

  /**
   * @brief Handle input changes
   */
  onInputChange(value: string): void {
    if (!this.isActive()) return;
    
    const step = this.currentStep();
    
    if (step === 1) {
      // Step 2: Type exactly 2 letters
      const lettersOnly = value.replace(/[^a-zA-Z]/g, '');
      if (lettersOnly.length > 2) {
        this.showSequenceError('Vous devez taper exactement 2 lettres');
        return;
      }
      this.lettersTyped = lettersOnly;
      this.inputValue.set(lettersOnly);
      
      if (lettersOnly.length === 2) {
        // Move to step 3: Wait 2 seconds
        this.currentStep.set(2);
        this.startWaiting();
      }
    } else if (step === 3) {
      // Step 4: Type exactly 1 digit
      const digitsOnly = value.replace(/[^0-9]/g, '');
      if (digitsOnly.length > 1) {
        this.showSequenceError('Vous devez taper exactement 1 chiffre');
        return;
      }
      this.digitTyped = digitsOnly;
      this.inputValue.set(digitsOnly);
      
      if (digitsOnly.length === 1) {
        // Move to step 5: Arrow key sequence
        this.currentStep.set(4);
        this.startArrowSequence();
      }
    } else if (step === 5) {
      // Step 6: Type remaining text (3-8 characters)
      // Input should contain: letters + digit + remaining
      const expectedPrefix = this.lettersTyped + this.digitTyped;
      if (!value.startsWith(expectedPrefix)) {
        this.showSequenceError('Le texte doit commencer par les lettres et le chiffre précédents');
        return;
      }
      
      const remaining = value.slice(expectedPrefix.length);
      if (remaining.length > this.REMAINING_TEXT_LENGTH) {
        this.showSequenceError(`Vous devez taper exactement ${this.REMAINING_TEXT_LENGTH} caractères supplémentaires`);
        return;
      }
      this.remainingText = remaining;
      this.inputValue.set(value);
      
      if (remaining.length === this.REMAINING_TEXT_LENGTH) {
        // Sequence completed!
        this.completeSequence();
      }
    } else {
      // Wrong step - error
      this.showSequenceError('Action incorrecte à cette étape');
    }
  }

  /**
   * @brief Start waiting period (step 3)
   */
  private startWaiting(): void {
    this.isWaiting.set(true);
    this.waitStartTime = Date.now();
    
    if (this.waitTimeout) {
      clearTimeout(this.waitTimeout);
    }
    
    this.waitTimeout = setTimeout(() => {
      if (this.currentStep() === 2 && this.isActive()) {
        // Wait completed - move to step 4
        this.currentStep.set(3);
        this.isWaiting.set(false);
        this.inputValue.set(''); // Clear input for digit entry
      }
    }, 2000);
  }

  /**
   * @brief Start arrow sequence detection (step 5)
   */
  private startArrowSequence(): void {
    this.isWaitingForArrows.set(true);
    this.currentArrowIndex = 0;
    this.generateArrowSequence(); // Generate new sequence each time
  }

  /**
   * @brief Complete the sequence
   */
  private completeSequence(): void {
    const finalText = this.lettersTyped + this.digitTyped + this.remainingText;
    this.sequenceCompleted.emit(finalText);
    this.isActive.set(false);
  }

  /**
   * @brief Show sequence error and reset
   */
  private showSequenceError(message: string): void {
    this.errorMessage.set(message);
    this.showError.set(true);
    this.isActive.set(false);
    
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
    
    this.errorTimeout = setTimeout(() => {
      this.resetField();
    }, 3000);
  }

  /**
   * @brief Reset the field
   */
  resetField(): void {
    this.resetSequence();
    this.showError.set(false);
    this.currentStep.set(0);
    this.isStarted.set(false);
    this.isActive.set(false);
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
    }
  }

  /**
   * @brief Reset the component (public method)
   */
  reset(): void {
    this.resetField();
  }

  /**
   * @brief Get current step name
   */
  getCurrentStepName(): string {
    return this.STEPS[this.currentStep()];
  }

  /**
   * @brief Get remaining text length to type
   */
  getRemainingTextLength(): number {
    return this.REMAINING_TEXT_LENGTH;
  }

  /**
   * @brief Get wait progress (0-100)
   */
  getWaitProgress(): number {
    if (!this.isWaiting() || !this.waitStartTime) return 0;
    const elapsed = Date.now() - this.waitStartTime;
    return Math.min(100, (elapsed / 2000) * 100);
  }

}

