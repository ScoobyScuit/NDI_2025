import { Component, signal, OnInit, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @brief Moving drag & drop field component
 * 
 * Interactive drag & drop where:
 * - Draggable block (e.g., "FRANCE")
 * - Drop zone moves horizontally or vertically
 * - Block can slide slightly randomly during drag
 * - Drop outside zone → block returns to initial position
 * - Validation if block stays in zone for >500ms
 */
@Component({
  selector: 'app-moving-drag-drop-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './moving-drag-drop-field.component.html',
  styleUrl: './moving-drag-drop-field.component.css'
})
export class MovingDragDropFieldComponent implements OnInit, OnDestroy {
  @Output() dropCompleted = new EventEmitter<string>();

  // Game state
  isStarted = signal(false);
  isActive = signal(false);
  
  // Draggable block text (user-defined)
  currentBlockText = signal('');
  
  // Block position
  blockX = signal(50); // Percentage from left
  blockY = signal(85); // Percentage from top (start at bottom)
  private initialBlockX = 50;
  private initialBlockY = 85; // Start at bottom
  
  // Curling physics
  private velocityX = 0; // Velocity in X direction
  private velocityY = 0; // Velocity in Y direction
  private friction = 0.97; // Friction coefficient (curling on ice - slower sliding)
  isSliding = false; // Is block sliding after launch
  private launchStartX = 0; // Launch start position X
  private launchStartY = 0; // Launch start position Y
  private launchEndX = 0; // Launch end position X
  private launchEndY = 0; // Launch end position Y
  private physicsInterval: ReturnType<typeof setInterval> | null = null;
  
  // Drop zone position (moving)
  dropZoneX = signal(50); // Percentage from left
  dropZoneY = signal(50); // Percentage from top
  private dropZoneDirection = 1; // 1 or -1 for movement direction
  private dropZoneSpeed = 0.4; // Percentage per frame (slower)
  private dropZoneAxis: 'horizontal' | 'vertical' = 'horizontal';
  
  // Drag state
  isDragging = signal(false);
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private randomSlideInterval: ReturnType<typeof setInterval> | null = null;
  
  // Validation state
  isInDropZone = false;
  dropZoneEnterTime: number | null = null;
  private validationTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // Animation frame
  private animationFrame: number | null = null;
  
  // Error handling
  showError = signal(false);
  errorMessage = signal('');
  private errorTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    // Don't select random block - let user choose
    this.startDropZoneAnimation();
  }

  ngOnDestroy() {
    this.stopDropZoneAnimation();
    this.stopPhysics();
    if (this.randomSlideInterval) {
      clearInterval(this.randomSlideInterval);
    }
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
    }
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
  }

  /**
   * @brief Update block text from user input
   */
  updateBlockText(text: string): void {
    const trimmed = text.toUpperCase().trim();
    // Limit to 7 characters
    const limited = trimmed.substring(0, 7);
    this.currentBlockText.set(limited);
  }

  /**
   * @brief Start drop zone animation
   */
  private startDropZoneAnimation(): void {
    // Only horizontal movement
    this.dropZoneAxis = 'horizontal';
    this.dropZoneSpeed = 0.3 + Math.random() * 0.2; // 0.3-0.5% per frame (slower)
    
    const animate = () => {
      if (this.isActive() || this.isStarted()) {
        this.updateDropZonePosition();
      }
      this.animationFrame = requestAnimationFrame(animate);
    };
    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * @brief Stop drop zone animation
   */
  private stopDropZoneAnimation(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * @brief Update drop zone position (moving horizontally only)
   */
  private updateDropZonePosition(): void {
    // Only horizontal movement
    let newX = this.dropZoneX() + (this.dropZoneSpeed * this.dropZoneDirection);
    
    // Bounce at edges (10% to 90% of container)
    if (newX <= 10) {
      newX = 10;
      this.dropZoneDirection = 1;
    } else if (newX >= 90) {
      newX = 90;
      this.dropZoneDirection = -1;
    }
    
    this.dropZoneX.set(newX);
  }

  /**
   * @brief Start the field - called when user clicks start button
   */
  startField(): void {
    if (!this.currentBlockText() || this.currentBlockText().trim() === '') {
      // Cannot start without a word
      return;
    }
    this.isStarted.set(true);
    this.isActive.set(true);
    this.resetBlockPosition();
    this.resetDropZone();
  }

  /**
   * @brief Reset block to initial position
   */
  private resetBlockPosition(): void {
    this.blockX.set(this.initialBlockX);
    this.blockY.set(this.initialBlockY);
    this.isDragging.set(false);
    this.isSliding = false;
    this.velocityX = 0;
    this.velocityY = 0;
    this.stopPhysics();
    this.isInDropZone = false;
    this.dropZoneEnterTime = null;
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
      this.validationTimeout = null;
    }
  }

  /**
   * @brief Reset drop zone position
   */
  private resetDropZone(): void {
    // Random starting position (horizontal only)
    this.dropZoneX.set(20 + Math.random() * 60);
    this.dropZoneY.set(50); // Fixed vertical position (center)
    this.dropZoneDirection = Math.random() > 0.5 ? 1 : -1;
    this.dropZoneAxis = 'horizontal'; // Always horizontal
    this.dropZoneSpeed = 0.3 + Math.random() * 0.2; // Slower speed
  }

  /**
   * @brief Handle mouse down (start curling launch)
   */
  onMouseDown(event: MouseEvent): void {
    if (!this.isActive() || this.isSliding) return;
    
    const container = document.querySelector('.drag-drop-area') as HTMLElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    this.launchStartX = ((event.clientX - rect.left) / rect.width) * 100;
    this.launchStartY = ((event.clientY - rect.top) / rect.height) * 100;
    
    this.isDragging.set(true);
  }

  /**
   * @brief Handle mouse move during launch preparation
   */
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging() || !this.isActive() || this.isSliding) return;
    
    const container = document.querySelector('.drag-drop-area') as HTMLElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const currentX = ((event.clientX - rect.left) / rect.width) * 100;
    const currentY = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Update launch end position (for visual feedback)
    this.launchEndX = currentX;
    this.launchEndY = currentY;
  }

  /**
   * @brief Handle mouse up (launch the block - curling style)
   */
  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (!this.isDragging() || !this.isActive() || this.isSliding) return;
    
    this.isDragging.set(false);
    
    // Calculate launch velocity based on drag distance and direction
    const dragDistanceX = this.launchEndX - this.launchStartX;
    const dragDistanceY = this.launchEndY - this.launchStartY;
    const dragDistance = Math.sqrt(dragDistanceX * dragDistanceX + dragDistanceY * dragDistanceY);
    
    // Only launch if there's significant drag (at least 3% of container)
    if (dragDistance > 3) {
      // Calculate velocity (inverse direction - pull back to launch forward)
      // Slower sliding - reduced power for more controlled movement
      const power = Math.min(dragDistance * 0.3, 12); // Reduced power for slower sliding
      this.velocityX = -dragDistanceX / dragDistance * power;
      this.velocityY = -dragDistanceY / dragDistance * power;
      
      // Add random curl effect (like real curling) - less pronounced for slower movement
      this.velocityX += (Math.random() - 0.5) * 2;
      this.velocityY += (Math.random() - 0.5) * 2;
      
      this.isSliding = true;
      this.startPhysics();
    } else {
      // If drag is too short, just reset
      this.isDragging.set(false);
    }
  }

  /**
   * @brief Start physics simulation (curling slide)
   */
  private startPhysics(): void {
    if (this.physicsInterval) {
      clearInterval(this.physicsInterval);
    }
    
    this.physicsInterval = setInterval(() => {
      if (!this.isSliding || !this.isActive()) {
        this.stopPhysics();
        return;
      }
      
      // Apply friction (curling on ice - very low friction for long slide)
      this.velocityX *= this.friction;
      this.velocityY *= this.friction;
      
      // Add progressive curl effect during slide (like real curling) - reduced for slower movement
      const curlStrength = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY) * 0.01;
      this.velocityX += (Math.random() - 0.5) * curlStrength;
      this.velocityY += (Math.random() - 0.5) * curlStrength;
      
      // Update position (smooth sliding on ice)
      // Velocity is already in percentage per frame, apply directly
      let newX = this.blockX() + this.velocityX;
      let newY = this.blockY() + this.velocityY;
      
      // Bounce off walls (with energy loss - like hitting the boards)
      if (newX <= 0 || newX >= 100) {
        this.velocityX *= -0.6; // Reverse and lose more energy
        newX = Math.max(0, Math.min(100, newX));
      }
      if (newY <= 0 || newY >= 100) {
        this.velocityY *= -0.6; // Reverse and lose more energy
        newY = Math.max(0, Math.min(100, newY));
      }
      
      this.blockX.set(newX);
      this.blockY.set(newY);
      
      // Check if block is in drop zone
      const container = document.querySelector('.drag-drop-area') as HTMLElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        this.checkDropZone(newX, newY, rect);
      }
      
      // Stop if velocity is very low (almost stopped)
      const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
      if (speed < 0.05) { // Increased threshold to ensure block is really stopped
        this.isSliding = false;
        this.velocityX = 0;
        this.velocityY = 0;
        this.stopPhysics();
        
        // Final check if stopped in zone
        if (this.isInDropZone && this.dropZoneEnterTime) {
          const timeInZone = Date.now() - this.dropZoneEnterTime;
          if (timeInZone >= 500) {
            // Already in zone for 500ms - validate immediately
            this.completeDrop();
          }
          // If not 500ms yet, the timer will handle it
        } else if (!this.isInDropZone) {
          // Block stopped outside zone - return to start
          setTimeout(() => {
            if (!this.isInDropZone && !this.isSliding) {
              this.returnBlockToStart();
            }
          }, 1000);
        }
      }
    }, 16); // ~60fps for smooth animation
  }

  /**
   * @brief Stop physics simulation
   */
  private stopPhysics(): void {
    if (this.physicsInterval) {
      clearInterval(this.physicsInterval);
      this.physicsInterval = null;
    }
  }



  /**
   * @brief Check if block is in drop zone
   */
  private checkDropZone(blockX: number, blockY: number, containerRect: DOMRect): void {
    // Drop zone is 150px wide, 100px tall, centered at dropZoneX, dropZoneY
    const dropZoneWidthPercent = (150 / containerRect.width) * 100;
    const dropZoneHeightPercent = (100 / containerRect.height) * 100;
    const dropZoneLeft = this.dropZoneX() - dropZoneWidthPercent / 2;
    const dropZoneRight = this.dropZoneX() + dropZoneWidthPercent / 2;
    const dropZoneTop = this.dropZoneY() - dropZoneHeightPercent / 2;
    const dropZoneBottom = this.dropZoneY() + dropZoneHeightPercent / 2;
    
    const inZone = blockX >= dropZoneLeft && blockX <= dropZoneRight && blockY >= dropZoneTop && blockY <= dropZoneBottom;
    
    if (inZone && !this.isInDropZone) {
      // Block just entered the zone - start timer
      this.isInDropZone = true;
      this.dropZoneEnterTime = Date.now();
      this.startValidationTimer();
    } else if (!inZone && this.isInDropZone) {
      // Block left the zone - reset timer
      this.isInDropZone = false;
      this.dropZoneEnterTime = null;
      if (this.validationTimeout) {
        clearTimeout(this.validationTimeout);
        this.validationTimeout = null;
      }
    } else if (inZone && this.isInDropZone && this.dropZoneEnterTime) {
      // Block is still in zone - check if 500ms have passed
      const timeInZone = Date.now() - this.dropZoneEnterTime;
      if (timeInZone >= 500) {
        // 500ms passed - validate immediately
        this.completeDrop();
      }
    }
  }


  /**
   * @brief Start validation timer (check if block stays for exactly 500ms)
   */
  private startValidationTimer(): void {
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
      this.validationTimeout = null;
    }
    
    // Use a precise timeout for exactly 500ms
    this.validationTimeout = setTimeout(() => {
      // After 500ms, check if block is still in zone
      if (this.isInDropZone && this.isActive() && this.dropZoneEnterTime) {
        const timeInZone = Date.now() - this.dropZoneEnterTime;
        // Validate if at least 500ms have passed (with small tolerance)
        if (timeInZone >= 500) {
          this.completeDrop();
        }
      }
      this.validationTimeout = null;
    }, 500); // Exactly 500ms
  }

  /**
   * @brief Complete the drop (validation successful)
   */
  private completeDrop(): void {
    this.dropCompleted.emit(this.currentBlockText());
    this.isActive.set(false);
    this.stopPhysics();
  }

  /**
   * @brief Return block to initial position (when it stops sliding outside zone)
   */
  private returnBlockToStart(): void {
    if (this.isSliding) return; // Don't return while still sliding
    
    this.showError.set(true);
    this.errorMessage.set('Le bloc s\'est arrêté hors de la zone cible. Retour à la position initiale.');
    
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
    
    this.errorTimeout = setTimeout(() => {
      this.resetBlockPosition();
      this.showError.set(false);
      this.errorMessage.set('');
    }, 2000);
  }

  /**
   * @brief Reset the field
   */
  resetField(): void {
    this.resetBlockPosition();
    this.resetDropZone();
    // Don't reset the selected word - keep user's choice
    this.showError.set(false);
    this.errorMessage.set('');
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
   * @brief Get block style (position)
   */
  getBlockStyle(): { [key: string]: string } {
    return {
      'left': `${this.blockX()}%`,
      'top': `${this.blockY()}%`,
      'transform': 'translate(-50%, -50%)'
    };
  }

  /**
   * @brief Get drop zone style (position)
   */
  getDropZoneStyle(): { [key: string]: string } {
    return {
      'left': `${this.dropZoneX()}%`,
      'top': `${this.dropZoneY()}%`,
      'transform': 'translate(-50%, -50%)'
    };
  }

  /**
   * @brief Get time spent in drop zone (in milliseconds)
   */
  getTimeInZone(): number {
    if (!this.dropZoneEnterTime) return 0;
    return Math.min(500, Date.now() - this.dropZoneEnterTime);
  }

  /**
   * @brief Get validation progress (0-100)
   */
  getValidationProgress(): number {
    if (!this.dropZoneEnterTime) return 0;
    const timeInZone = Date.now() - this.dropZoneEnterTime;
    return Math.min(100, (timeInZone / 500) * 100);
  }
}

