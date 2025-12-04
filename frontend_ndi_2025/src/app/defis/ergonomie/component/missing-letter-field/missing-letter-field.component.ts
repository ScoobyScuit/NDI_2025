import { Component, signal, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * @brief Missing letter field component
 * 
 * Interactive text field where:
 * - Each letter typed causes another random letter to be deleted
 * - User must retype deleted letters to complete the word
 * - Validation when final word matches target
 */
@Component({
  selector: 'app-missing-letter-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './missing-letter-field.component.html',
  styleUrl: './missing-letter-field.component.css'
})
export class MissingLetterFieldComponent implements OnInit, OnDestroy {
  @Output() textSelected = new EventEmitter<string>();

  // Game state
  isStarted = signal(false);
  isActive = signal(false);
  
  // Predefined words (15 possibilities)
  private readonly WORDS = [
    'LIBERTE',
    'EGALITE',
    'FRATERNITE',
    'REPUBLIQUE',
    'DEMOCRATIE',
    'JUSTICE',
    'SOLIDARITE',
    'RESPECT',
    'DIGNITE',
    'COURAGE',
    'HONNEUR',
    'LOYALTE',
    'SINCERITE',
    'GENEROSITE',
    'TOLERANCE'
  ];
  
  // Current target word
  private currentWord: string = '';
  
  // Word with 2 missing letters (displayed to user)
  displayedWord = signal('');
  
  // The 2 missing letters that user must find
  private missingLetters: string[] = [];
  
  // Input value (for the 2 missing letters)
  inputValue = signal('');
  
  // Previous input value to detect new letters
  private previousValue = '';
  
  // Counter for letters typed (to remove one every 2 letters)
  private lettersTypedCount = 0;
  
  // Timeout for delayed letter removal
  private removalTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // Message to display when letter disappears
  showMessage = signal(false);
  messageText = signal('');
  
  // Message timeout
  private messageTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.selectRandomWord();
  }

  ngOnDestroy() {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    if (this.removalTimeout) {
      clearTimeout(this.removalTimeout);
    }
  }

  /**
   * @brief Select a random word and create version with 2 missing letters
   */
  private selectRandomWord(): void {
    // Ensure we only use words from the predefined list
    const randomIndex = Math.floor(Math.random() * this.WORDS.length);
    this.currentWord = this.WORDS[randomIndex];
    
    // All words in the list have at least 7 letters, so we can always remove 2
    // Get 2 different random positions
    const positions: number[] = [];
    while (positions.length < 2) {
      const pos = Math.floor(Math.random() * this.currentWord.length);
      if (!positions.includes(pos)) {
        positions.push(pos);
      }
    }
    
    // Sort positions to maintain order
    positions.sort((a, b) => a - b);
    
    // Store missing letters
    this.missingLetters = positions.map(pos => this.currentWord[pos]);
    
    // Create displayed word with underscores
    let displayed = '';
    for (let i = 0; i < this.currentWord.length; i++) {
      if (positions.includes(i)) {
        displayed += '_';
      } else {
        displayed += this.currentWord[i];
      }
    }
    
    this.displayedWord.set(displayed);
    
    // Debug: verify word is in list
    if (!this.WORDS.includes(this.currentWord)) {
      console.error('ERROR: Selected word is not in WORDS list!', this.currentWord);
    }
  }

  /**
   * @brief Start the field - called when user clicks start button
   */
  startField(): void {
    this.isStarted.set(true);
    this.isActive.set(true);
    this.inputValue.set('');
    this.previousValue = '';
    this.lettersTypedCount = 0;
  }

  /**
   * @brief Handle input change using ngModel
   */
  onInputChangeModel(newValue: string): void {
    if (!this.isActive()) return;
    
    // Convert to uppercase and filter only letters
    let value = newValue.toUpperCase().replace(/[^A-Z]/g, '');
    
    // Always update the value first
    this.inputValue.set(value);
    
    // Check if a new letter was added (value is longer)
    if (value.length > this.previousValue.length) {
      this.lettersTypedCount++;
      
      // Clear any pending removal
      if (this.removalTimeout) {
        clearTimeout(this.removalTimeout);
        this.removalTimeout = null;
      }
      
      // Every 2 letters typed, remove one letter after a delay
      if (this.lettersTypedCount % 2 === 0 && value.length >= 2) {
        // Remove a random letter after a short delay to show the letters first
        this.removalTimeout = setTimeout(() => {
          if (this.isActive() && this.inputValue().length >= 2) {
            this.removeRandomLetter(this.inputValue());
          }
          this.removalTimeout = null;
        }, 500);
      }
      
      this.previousValue = value;
    } else {
      // Just update the value (backspace or other)
      this.previousValue = value;
      // Reset counter if user deletes
      if (value.length < this.previousValue.length) {
        this.lettersTypedCount = Math.max(0, this.lettersTypedCount - 1);
        // Cancel pending removal if user deletes
        if (this.removalTimeout) {
          clearTimeout(this.removalTimeout);
          this.removalTimeout = null;
        }
      }
    }
  }

  /**
   * @brief Remove a random letter from the input (every 2 letters typed)
   */
  private removeRandomLetter(currentValue: string): void {
    if (currentValue.length === 0) {
      this.inputValue.set('');
      this.previousValue = '';
      return;
    }
    
    if (currentValue.length === 1) {
      // Only one letter, can't remove
      this.inputValue.set(currentValue);
      this.previousValue = currentValue;
      return;
    }
    
    // Select a random position to remove (not the last one typed)
    const positionsToRemove = [];
    for (let i = 0; i < currentValue.length - 1; i++) {
      positionsToRemove.push(i);
    }
    
    const randomIndex = Math.floor(Math.random() * positionsToRemove.length);
    const positionToRemove = positionsToRemove[randomIndex];
    const removedLetter = currentValue[positionToRemove];
    
    // Remove the letter at that position
    const newValue = currentValue.slice(0, positionToRemove) + currentValue.slice(positionToRemove + 1);
    this.inputValue.set(newValue);
    this.previousValue = newValue;
    
    // Show message
    this.showLetterRemovedMessage(removedLetter);
    
    // Check if letters are correct (even with only 1 letter, in case user had the 2 correct)
    if (newValue.length === 1) {
      // If only 1 letter remains, check if it matches one of the missing letters
      // and if the user needs to type the other one
      this.checkCompletion(newValue);
    }
  }

  /**
   * @brief Show message when letter is removed
   */
  private showLetterRemovedMessage(letter: string): void {
    this.messageText.set(`La lettre "${letter}" a été effacée !`);
    this.showMessage.set(true);
    
    // Clear previous timeout
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    
    // Hide message after 2 seconds
    this.messageTimeout = setTimeout(() => {
      this.showMessage.set(false);
    }, 2000);
  }

  /**
   * @brief Check if the letters are correct (check if both missing letters are present)
   */
  private checkCompletion(value: string): void {
    if (value.length >= 2) {
      // Check if both missing letters are present in the input
      const valueLetters = value.split('');
      const missingLettersCopy = [...this.missingLetters];
      
      let foundCount = 0;
      for (const missingLetter of missingLettersCopy) {
        const index = valueLetters.indexOf(missingLetter);
        if (index !== -1) {
          foundCount++;
          // Remove the found letter to handle duplicates correctly
          valueLetters.splice(index, 1);
        }
      }
      
      if (foundCount === 2) {
        // Both missing letters are present - validation successful
        const completeWord = this.currentWord;
        this.textSelected.emit(completeWord);
        this.isActive.set(false);
      }
    }
  }

  /**
   * @brief Handle validation button click
   */
  validate(): void {
    if (!this.isActive()) return;
    
    const value = this.inputValue().trim().toUpperCase();
    
    if (value.length < 2) {
      this.messageText.set('Vous devez avoir au moins 2 lettres pour valider.');
      this.showMessage.set(true);
      if (this.messageTimeout) clearTimeout(this.messageTimeout);
      this.messageTimeout = setTimeout(() => this.showMessage.set(false), 2000);
      return;
    }
    
    // Check if the input contains the 2 missing letters (in any order, even with other letters)
    const valueLetters = value.split('');
    const missingLettersCopy = [...this.missingLetters];
    
    // Check if both missing letters are present in the input
    let foundCount = 0;
    for (const missingLetter of missingLettersCopy) {
      const index = valueLetters.indexOf(missingLetter);
      if (index !== -1) {
        foundCount++;
        // Remove the found letter to handle duplicates correctly
        valueLetters.splice(index, 1);
      }
    }
    
    if (foundCount === 2) {
      // Both missing letters are present - validation successful
      const completeWord = this.currentWord;
      this.textSelected.emit(completeWord);
      this.isActive.set(false);
    } else {
      // Wrong letters - show error and reset
      this.showError();
    }
  }

  /**
   * @brief Show error and reset
   */
  private showError(): void {
    this.messageText.set(`Les lettres "${this.inputValue()}" ne sont pas correctes. Le mot attendu est "${this.currentWord}".`);
    this.showMessage.set(true);
    
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
    this.inputValue.set('');
    this.previousValue = '';
    this.lettersTypedCount = 0;
    this.showMessage.set(false);
    this.selectRandomWord();
    this.isStarted.set(false);
    this.isActive.set(false);
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
    if (this.removalTimeout) {
      clearTimeout(this.removalTimeout);
      this.removalTimeout = null;
    }
  }

  /**
   * @brief Reset the component (public method)
   */
  reset(): void {
    this.resetField();
  }

  /**
   * @brief Get displayed word with missing letters
   */
  getDisplayedWord(): string {
    return this.displayedWord();
  }
  
  /**
   * @brief Get current complete word (for display after validation)
   */
  getCurrentWord(): string {
    return this.currentWord;
  }
}

