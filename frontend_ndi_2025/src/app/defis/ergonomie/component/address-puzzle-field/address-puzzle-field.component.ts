import { Component, signal, computed, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @brief Address fragment structure
 */
interface AddressFragment {
  id: number;
  text: string;
  originalIndex: number;
  currentIndex: number;
  isInTarget: boolean;
  targetIndex: number | null;
}

/**
 * @brief Address puzzle field component
 * 
 * Interactive drag & drop puzzle where user reorganizes address fragments:
 * - Fragments displayed in random order
 * - Drag & drop to target container
 * - Fragments return if order is incorrect
 * - Fragments move slightly every 2-3 seconds
 */
@Component({
  selector: 'app-address-puzzle-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './address-puzzle-field.component.html',
  styleUrl: './address-puzzle-field.component.css'
})
export class AddressPuzzleFieldComponent implements OnInit, OnDestroy {
  @Output() addressSelected = new EventEmitter<string>();

  // Game state
  isStarted = signal(false);
  isActive = signal(false);
  
  // Predefined addresses (15 possibilities)
  private readonly ADDRESSES = [
    ['12', 'Rue', 'du', 'Port', '75015', 'Paris'],
    ['45', 'Avenue', 'des', 'Champs-Élysées', '75008', 'Paris'],
    ['8', 'Boulevard', 'Saint-Michel', '75005', 'Paris'],
    ['23', 'Rue', 'de', 'la', 'République', '69001', 'Lyon'],
    ['67', 'Cours', 'Mirabeau', '13100', 'Aix-en-Provence'],
    ['14', 'Place', 'Bellecour', '69002', 'Lyon'],
    ['32', 'Rue', 'de', 'la', 'Paix', '06000', 'Nice'],
    ['19', 'Avenue', 'Jean', 'Médecin', '06000', 'Nice'],
    ['56', 'Rue', 'de', 'la', 'Soif', '35000', 'Rennes'],
    ['7', 'Place', 'du', 'Capitole', '31000', 'Toulouse'],
    ['91', 'Rue', 'de', 'Strasbourg', '67000', 'Strasbourg'],
    ['3', 'Rue', 'de', 'la', 'Gare', '33000', 'Bordeaux'],
    ['28', 'Avenue', 'de', 'Colmar', '68000', 'Colmar'],
    ['15', 'Rue', 'de', 'la', 'Victoire', '59000', 'Lille'],
    ['42', 'Boulevard', 'de', 'la', 'Liberté', '44000', 'Nantes']
  ];
  
  // Current address being used
  private currentAddress: string[] = [];
  
  // Fragments with their positions
  fragments = signal<AddressFragment[]>([]);
  
  // Target container for dropped fragments
  targetFragments = signal<(AddressFragment | null)[]>([]);
  
  // Drag state
  draggedFragment: AddressFragment | null = null;
  
  // Animation interval
  private animationInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.initializeFragments();
  }

  ngOnDestroy() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  /**
   * @brief Select a random address from the predefined list
   */
  private selectRandomAddress(): string[] {
    const randomIndex = Math.floor(Math.random() * this.ADDRESSES.length);
    return [...this.ADDRESSES[randomIndex]];
  }

  /**
   * @brief Initialize fragments in random order
   */
  private initializeFragments(): void {
    // Select random address if not already set
    if (this.currentAddress.length === 0) {
      this.currentAddress = this.selectRandomAddress();
    }
    const parts = [...this.currentAddress];
    const shuffled = this.shuffleArray([...parts]);
    
    const fragments: AddressFragment[] = shuffled.map((text, index) => ({
      id: index,
      text: text,
      originalIndex: parts.indexOf(text),
      currentIndex: index,
      isInTarget: false,
      targetIndex: null
    }));
    
    this.fragments.set(fragments);
    this.targetFragments.set(new Array(parts.length).fill(null));
  }

  /**
   * @brief Shuffle array randomly
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * @brief Start the field - called when user clicks start button
   */
  startField(): void {
    this.isStarted.set(true);
    this.isActive.set(true);
    this.startFragmentAnimation();
  }

  /**
   * @brief Start fragment animation (slight random movement every 2-3 seconds)
   */
  private startFragmentAnimation(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    
    this.animationInterval = setInterval(() => {
      if (this.isActive()) {
        this.animateFragments();
      }
    }, 2500 + Math.random() * 500); // 2.5-3 seconds
  }

  /**
   * @brief Animate fragments with slight random movement
   */
  private animateFragments(): void {
    this.fragments.update(fragments => 
      fragments.map(f => {
        if (!f.isInTarget) {
          // Add slight random offset
          return { ...f };
        }
        return f;
      })
    );
  }

  /**
   * @brief Handle drag start
   */
  onDragStart(event: DragEvent, fragment: AddressFragment): void {
    if (!this.isActive()) return;
    this.draggedFragment = fragment;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', fragment.id.toString());
    }
  }

  /**
   * @brief Handle drag end
   */
  onDragEnd(event: DragEvent): void {
    this.draggedFragment = null;
  }

  /**
   * @brief Handle drag over target
   */
  onDragOver(event: DragEvent, targetIndex: number): void {
    if (!this.isActive() || !this.draggedFragment) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  /**
   * @brief Handle drop on target
   */
  onDrop(event: DragEvent, targetIndex: number): void {
    if (!this.isActive() || !this.draggedFragment) return;
    event.preventDefault();
    
    const fragment = this.draggedFragment;
    
    // Check if this is the correct position
    if (fragment.originalIndex === targetIndex) {
      // Correct position - move to target
      this.targetFragments.update(targets => {
        const newTargets = [...targets];
        newTargets[targetIndex] = fragment;
        return newTargets;
      });
      
      this.fragments.update(fragments => 
        fragments.map(f => 
          f.id === fragment.id 
            ? { ...f, isInTarget: true, targetIndex: targetIndex }
            : f
        )
      );
      
      // Check if puzzle is complete
      this.checkCompletion();
    } else {
      // Wrong position - reset the field
      this.resetField();
    }
    
    this.draggedFragment = null;
  }
  
  /**
   * @brief Reset field when wrong fragment is placed
   */
  private resetField(): void {
    // Clear all targets
    this.targetFragments.set(new Array(this.currentAddress.length).fill(null));
    
    // Reset all fragments
    this.fragments.update(fragments => 
      fragments.map(f => ({
        ...f,
        isInTarget: false,
        targetIndex: null
      }))
    );
    
    // Select a new random address
    this.currentAddress = [];
    this.initializeFragments();
    
    // Stop animation temporarily
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
    
    // Restart animation after a short delay
    setTimeout(() => {
      if (this.isActive()) {
        this.startFragmentAnimation();
      }
    }, 500);
  }

  /**
   * @brief Return fragment to source (wrong position)
   */
  private returnFragment(fragment: AddressFragment): void {
    // Visual feedback: fragment returns
    this.fragments.update(fragments => 
      fragments.map(f => 
        f.id === fragment.id 
          ? { ...f, isInTarget: false, targetIndex: null }
          : f
      )
    );
    
    this.targetFragments.update(targets => {
      const newTargets = [...targets];
      if (fragment.targetIndex !== null) {
        newTargets[fragment.targetIndex] = null;
      }
      return newTargets;
    });
  }

  /**
   * @brief Check if puzzle is complete
   */
  private checkCompletion(): void {
    const targets = this.targetFragments();
    const allPlaced = targets.every((f, index) => 
      f !== null && f.originalIndex === index
    );
    
    if (allPlaced) {
      // Puzzle complete
      const address = targets.map(f => f!.text).join(' ');
      this.addressSelected.emit(address);
      this.isActive.set(false);
      if (this.animationInterval) {
        clearInterval(this.animationInterval);
      }
    }
  }

  /**
   * @brief Remove fragment from target
   */
  removeFromTarget(fragment: AddressFragment): void {
    if (!this.isActive()) return;
    
    this.targetFragments.update(targets => {
      const newTargets = [...targets];
      if (fragment.targetIndex !== null) {
        newTargets[fragment.targetIndex] = null;
      }
      return newTargets;
    });
    
    this.fragments.update(fragments => 
      fragments.map(f => 
        f.id === fragment.id 
          ? { ...f, isInTarget: false, targetIndex: null }
          : f
      )
    );
  }

  /**
   * @brief Reset the component
   */
  reset(): void {
    // Select a new random address on reset (initializeFragments will use it)
    this.currentAddress = [];
    this.initializeFragments();
    this.isStarted.set(false);
    this.isActive.set(false);
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
  }

  /**
   * @brief Get computed address from target fragments
   */
  getComputedAddress(): string {
    const targets = this.targetFragments();
    return targets.filter(f => f !== null).map(f => f!.text).join(' ');
  }
}

