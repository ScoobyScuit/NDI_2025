import { Component, signal, computed, HostListener, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @brief Cell type in the maze
 */
type CellType = 'wall' | 'path' | 'exit-left' | 'exit-right' | 'exit-top' | 'exit-bottom';

/**
 * @brief Maze cell structure
 */
interface MazeCell {
  type: CellType;
  visited: boolean;
}

/**
 * @brief Date field component with interactive maze
 * 
 * Interactive maze where user navigates to select date:
 * - Left exit: day +1
 * - Right exit: month +1
 * - Top exit: year +1
 * - Bottom exit: validate
 */
@Component({
  selector: 'app-date-maze-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-maze-field.component.html',
  styleUrl: './date-maze-field.component.css'
})
export class DateMazeFieldComponent implements OnInit, OnDestroy {
  @Output() dateSelected = new EventEmitter<Date>();

  // Maze configuration
  private readonly MAZE_SIZE = 6;
  
  // Current date being modified
  currentDate = signal(new Date());
  
  // Target date limit (randomly generated, must not exceed this)
  targetDate = signal<Date | null>(null);
  
  // Player position in maze
  playerX = signal(1);
  playerY = signal(1);
  
  // Maze grid
  maze = signal<MazeCell[][]>([]);
  
  // Game state
  isStarted = signal(false);
  isActive = signal(false);
  wrongExitsCount = signal(0);
  showError = signal(false);
  errorType = signal<'limit' | 'validation' | null>(null);
  
  // Computed date display
  formattedDate = computed(() => {
    const date = this.currentDate();
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  });
  
  // Computed target date display
  formattedTargetDate = computed(() => {
    const target = this.targetDate();
    if (!target) return '';
    return target.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  });

  ngOnInit() {
    this.generateRandomTargetDate();
    this.generateMaze();
    // Don't activate until user clicks start button
    this.isStarted.set(false);
    this.isActive.set(false);
  }
  
  /**
   * @brief Start the field - called when user clicks start button
   */
  startField(): void {
    this.isStarted.set(true);
    this.isActive.set(true);
  }
  
  /**
   * @brief Generate a random target date greater than today
   * Date will be between 1 month and 2 years from today
   */
  private generateRandomTargetDate(): void {
    const today = new Date();
    const minDays = 30; // 1 month
    const maxDays = 730; // 2 years
    
    const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
    const target = new Date(today);
    target.setDate(target.getDate() + randomDays);
    
    this.targetDate.set(target);
  }
  
  /**
   * @brief Check if current date exceeds target date and show error if needed
   */
  private checkDateLimit(): void {
    const target = this.targetDate();
    const current = this.currentDate();
    
    if (target) {
      // Normalize dates to midnight for accurate comparison
      const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
      const currentDate = new Date(current.getFullYear(), current.getMonth(), current.getDate());
      
      if (currentDate > targetDate) {
        // Date exceeded, show error message
        this.errorType.set('limit');
        this.showError.set(true);
        this.isActive.set(false);
      }
    }
  }

  ngOnDestroy() {
    this.isActive.set(false);
  }

  /**
   * @brief Generate a new maze with exits
   * Maze layout changes based on wrong exits count
   */
  private generateMaze(): void {
    const size = this.MAZE_SIZE;
    const maze: MazeCell[][] = [];
    
    // Initialize maze with walls
    for (let y = 0; y < size; y++) {
      maze[y] = [];
      for (let x = 0; x < size; x++) {
        maze[y][x] = { type: 'wall', visited: false };
      }
    }
    
    // Get variation pattern based on wrong exits
    const variation = this.wrongExitsCount() % 4;
    
    // Pattern 0: Original simple path
    if (variation === 0) {
      maze[1][1] = { type: 'path', visited: false };
      maze[1][2] = { type: 'path', visited: false };
      maze[1][3] = { type: 'path', visited: false };
      maze[1][4] = { type: 'path', visited: false };
      maze[2][1] = { type: 'path', visited: false };
      maze[2][4] = { type: 'path', visited: false };
      maze[3][1] = { type: 'path', visited: false };
      maze[3][2] = { type: 'path', visited: false };
      maze[3][3] = { type: 'path', visited: false };
      maze[3][4] = { type: 'path', visited: false };
      maze[4][1] = { type: 'path', visited: false };
      maze[4][4] = { type: 'path', visited: false };
    }
    // Pattern 1: More horizontal paths
    else if (variation === 1) {
      maze[1][1] = { type: 'path', visited: false };
      maze[1][2] = { type: 'path', visited: false };
      maze[1][3] = { type: 'path', visited: false };
      maze[1][4] = { type: 'path', visited: false };
      maze[2][1] = { type: 'path', visited: false };
      maze[2][2] = { type: 'path', visited: false };
      maze[2][3] = { type: 'path', visited: false };
      maze[2][4] = { type: 'path', visited: false };
      maze[3][2] = { type: 'path', visited: false };
      maze[3][3] = { type: 'path', visited: false };
      maze[4][1] = { type: 'path', visited: false };
      maze[4][2] = { type: 'path', visited: false };
      maze[4][3] = { type: 'path', visited: false };
      maze[4][4] = { type: 'path', visited: false };
    }
    // Pattern 2: More vertical paths
    else if (variation === 2) {
      maze[1][1] = { type: 'path', visited: false };
      maze[1][3] = { type: 'path', visited: false };
      maze[1][4] = { type: 'path', visited: false };
      maze[2][1] = { type: 'path', visited: false };
      maze[2][2] = { type: 'path', visited: false };
      maze[2][3] = { type: 'path', visited: false };
      maze[2][4] = { type: 'path', visited: false };
      maze[3][1] = { type: 'path', visited: false };
      maze[3][2] = { type: 'path', visited: false };
      maze[3][3] = { type: 'path', visited: false };
      maze[3][4] = { type: 'path', visited: false };
      maze[4][2] = { type: 'path', visited: false };
      maze[4][3] = { type: 'path', visited: false };
      maze[4][4] = { type: 'path', visited: false };
    }
    // Pattern 3: Complex zigzag
    else {
      maze[1][1] = { type: 'path', visited: false };
      maze[1][2] = { type: 'path', visited: false };
      maze[1][4] = { type: 'path', visited: false };
      maze[2][1] = { type: 'path', visited: false };
      maze[2][3] = { type: 'path', visited: false };
      maze[2][4] = { type: 'path', visited: false };
      maze[3][1] = { type: 'path', visited: false };
      maze[3][2] = { type: 'path', visited: false };
      maze[3][3] = { type: 'path', visited: false };
      maze[3][4] = { type: 'path', visited: false };
      maze[4][1] = { type: 'path', visited: false };
      maze[4][3] = { type: 'path', visited: false };
      maze[4][4] = { type: 'path', visited: false };
    }
    
    // Place exits on edges with connections
    // Left exit (day +1) - always accessible from row 2
    maze[2][0] = { type: 'exit-left', visited: false };
    if (maze[2][1].type === 'wall') {
      maze[2][1] = { type: 'path', visited: false };
    }
    
    // Right exit (month +1) - always accessible from row 2
    maze[2][size - 1] = { type: 'exit-right', visited: false };
    if (maze[2][size - 2].type === 'wall') {
      maze[2][size - 2] = { type: 'path', visited: false };
    }
    
    // Top exit (year +1) - always accessible from column 2
    maze[0][2] = { type: 'exit-top', visited: false };
    if (maze[1][2].type === 'wall') {
      maze[1][2] = { type: 'path', visited: false };
    }
    
    // Bottom exit (validation) - always accessible from column 3
    maze[size - 1][3] = { type: 'exit-bottom', visited: false };
    if (maze[size - 2][3].type === 'wall') {
      maze[size - 2][3] = { type: 'path', visited: false };
    }
    
    this.maze.set(maze);
    this.playerX.set(1);
    this.playerY.set(1);
  }

  /**
   * @brief Handle keyboard input for player movement
   */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isStarted() || !this.isActive()) return;
    
    let newX = this.playerX();
    let newY = this.playerY();
    
    switch (event.key) {
      case 'ArrowUp':
        newY = Math.max(0, this.playerY() - 1);
        break;
      case 'ArrowDown':
        newY = Math.min(this.MAZE_SIZE - 1, this.playerY() + 1);
        break;
      case 'ArrowLeft':
        newX = Math.max(0, this.playerX() - 1);
        break;
      case 'ArrowRight':
        newX = Math.min(this.MAZE_SIZE - 1, this.playerX() + 1);
        break;
      default:
        return;
    }
    
    // Check if move is valid (not a wall)
    const targetCell = this.maze()[newY]?.[newX];
    if (targetCell && targetCell.type !== 'wall') {
      this.playerX.set(newX);
      this.playerY.set(newY);
      
      // Check if player reached an exit
      this.checkExit(targetCell.type);
    }
  }

  /**
   * @brief Check if player reached an exit and handle accordingly
   */
  private checkExit(exitType: CellType): void {
    if (!exitType.startsWith('exit-')) return;
    
    const date = new Date(this.currentDate());
    
    switch (exitType) {
      case 'exit-left':
        // Day +1
        date.setDate(date.getDate() + 1);
        this.currentDate.set(date);
        this.wrongExitsCount.update(count => count + 1);
        this.generateMaze();
        this.checkDateLimit();
        break;
        
      case 'exit-right':
        // Month +1
        date.setMonth(date.getMonth() + 1);
        this.currentDate.set(date);
        this.wrongExitsCount.update(count => count + 1);
        this.generateMaze();
        this.checkDateLimit();
        break;
        
      case 'exit-top':
        // Year +1
        date.setFullYear(date.getFullYear() + 1);
        this.currentDate.set(date);
        this.wrongExitsCount.update(count => count + 1);
        this.generateMaze();
        this.checkDateLimit();
        break;
        
      case 'exit-bottom':
        // Validation - check if date matches target
        this.validateDate();
        break;
    }
  }

  /**
   * @brief Get CSS class for a cell
   */
  getCellClass(x: number, y: number): string {
    const cell = this.maze()[y]?.[x];
    if (!cell) return 'cell wall';
    
    const classes = ['cell', cell.type];
    
    if (this.playerX() === x && this.playerY() === y) {
      classes.push('player');
    }
    
    return classes.join(' ');
  }

  /**
   * @brief Validate if current date matches target date
   */
  private validateDate(): void {
    const target = this.targetDate();
    const current = this.currentDate();
    
    if (target) {
      // Normalize dates to midnight for accurate comparison
      const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
      const currentDate = new Date(current.getFullYear(), current.getMonth(), current.getDate());
      
      if (currentDate.getTime() === targetDate.getTime()) {
        // Correct date - emit event
        this.dateSelected.emit(new Date(this.currentDate()));
        this.isActive.set(false);
      } else {
        // Wrong date - show error
        this.errorType.set('validation');
        this.showError.set(true);
        this.isActive.set(false);
      }
    }
  }
  
  /**
   * @brief Handle error acknowledgment and reset
   */
  acknowledgeError(): void {
    this.showError.set(false);
    this.errorType.set(null);
    this.reset();
  }

  /**
   * @brief Reset the component
   */
  reset(): void {
    this.currentDate.set(new Date());
    this.wrongExitsCount.set(0);
    this.generateRandomTargetDate();
    this.generateMaze();
    this.isStarted.set(false);
    this.isActive.set(false);
    this.showError.set(false);
    this.errorType.set(null);
  }
}

