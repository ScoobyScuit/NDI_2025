import { Component, signal, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @brief Button pressure field component
 * 
 * Interactive button where:
 * - User must hold the button for an exact duration (e.g., 3.2 seconds)
 * - Releasing too early or too late causes reset and error message
 * - Visual feedback or counter displayed during pressure
 */
@Component({
  selector: 'app-button-pressure-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-pressure-field.component.html',
  styleUrl: './button-pressure-field.component.css'
})
export class ButtonPressureFieldComponent implements OnInit, OnDestroy {
  @Output() pressureCompleted = new EventEmitter<number>();

  // Game state
  isStarted = signal(false);
  isActive = signal(false);
  
  // Target duration in seconds (random between 2.0 and 5.0 seconds)
  targetDuration = signal(0);
  
  // Current pressure start time
  private pressureStartTime: number | null = null;
  
  // Signal to track if button is currently being pressed
  isPressing = signal(false);
  
  // Current elapsed time during pressure
  elapsedTime = signal(0);
  
  // Interval for updating the counter
  private timeInterval: ReturnType<typeof setInterval> | null = null;
  
  // Message to display
  showMessage = signal(false);
  messageText = signal('');
  
  // Message timeout
  private messageTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // Tolerance for exact match (in milliseconds)
  private readonly TOLERANCE_MS = 100; // ±0.1 seconds

  ngOnInit() {
    this.generateRandomTargetDuration();
  }

  ngOnDestroy() {
    this.stopTimer();
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
  }

  /**
   * @brief Generate a random target duration between 2.0 and 5.0 seconds
   */
  private generateRandomTargetDuration(): void {
    // Random between 2.0 and 5.0 seconds, with 1 decimal place
    const duration = Math.round((Math.random() * 3 + 2) * 10) / 10;
    this.targetDuration.set(duration);
  }

  /**
   * @brief Start the field - called when user clicks start button
   */
  startField(): void {
    this.isStarted.set(true);
    this.isActive.set(true);
    this.generateRandomTargetDuration();
    this.elapsedTime.set(0);
    this.pressureStartTime = null;
  }

  /**
   * @brief Handle button press (mousedown or touchstart)
   */
  onButtonPress(event: MouseEvent | TouchEvent): void {
    if (!this.isActive()) return;
    
    event.preventDefault();
    this.pressureStartTime = Date.now();
    this.elapsedTime.set(0);
    this.isPressing.set(true);
    this.showMessage.set(false);
    
    // Start timer to update counter
    this.startTimer();
  }

  /**
   * @brief Handle button release (mouseup or touchend)
   */
  onButtonRelease(event: MouseEvent | TouchEvent): void {
    if (!this.isActive() || !this.pressureStartTime) return;
    
    event.preventDefault();
    const endTime = Date.now();
    const duration = (endTime - this.pressureStartTime) / 1000; // Convert to seconds
    const targetDuration = this.targetDuration();
    
    this.stopTimer();
    this.pressureStartTime = null;
    this.isPressing.set(false);
    
    // Check if duration matches target (within tolerance)
    const targetMs = targetDuration * 1000;
    const durationMs = duration * 1000;
    const difference = Math.abs(durationMs - targetMs);
    
    if (difference <= this.TOLERANCE_MS) {
      // Exact match - success!
      this.pressureCompleted.emit(duration);
      this.isActive.set(false);
      this.messageText.set(`✅ Parfait ! Vous avez maintenu le bouton pendant exactement ${duration.toFixed(1)}s (cible: ${targetDuration.toFixed(1)}s)`);
      this.showMessage.set(true);
    } else {
      // Too early or too late - error
      if (duration < targetDuration) {
        this.messageText.set(`❌ Trop tôt ! Vous avez relâché après ${duration.toFixed(1)}s, mais il fallait ${targetDuration.toFixed(1)}s.`);
      } else {
        this.messageText.set(`❌ Trop tard ! Vous avez relâché après ${duration.toFixed(1)}s, mais il fallait ${targetDuration.toFixed(1)}s.`);
      }
      this.showMessage.set(true);
      this.showError();
    }
  }

  /**
   * @brief Start the timer to update the counter
   */
  private startTimer(): void {
    this.stopTimer();
    this.timeInterval = setInterval(() => {
      if (this.pressureStartTime) {
        const elapsed = (Date.now() - this.pressureStartTime) / 1000;
        this.elapsedTime.set(elapsed);
      }
    }, 10); // Update every 10ms for smooth counter
  }

  /**
   * @brief Stop the timer
   */
  private stopTimer(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
  }

  /**
   * @brief Show error and reset
   */
  private showError(): void {
    // Clear previous timeout
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    
    // Reset after showing error
    this.messageTimeout = setTimeout(() => {
      this.resetField();
    }, 3000);
  }

  /**
   * @brief Reset the field
   */
  resetField(): void {
    this.stopTimer();
    this.pressureStartTime = null;
    this.isPressing.set(false);
    this.elapsedTime.set(0);
    this.showMessage.set(false);
    this.generateRandomTargetDuration();
    this.isStarted.set(false);
    this.isActive.set(false);
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
  }

  /**
   * @brief Reset the component (public method)
   */
  reset(): void {
    this.resetField();
  }

  /**
   * @brief Get formatted target duration
   */
  getFormattedTargetDuration(): string {
    return this.targetDuration().toFixed(1);
  }

  /**
   * @brief Get formatted elapsed time
   */
  getFormattedElapsedTime(): string {
    return this.elapsedTime().toFixed(1);
  }

  /**
   * @brief Get progress percentage (0-100)
   */
  getProgress(): number {
    const target = this.targetDuration();
    const elapsed = this.elapsedTime();
    if (target === 0) return 0;
    return Math.min(100, (elapsed / target) * 100);
  }
}

