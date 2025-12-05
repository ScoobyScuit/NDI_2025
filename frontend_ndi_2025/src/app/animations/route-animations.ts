/* eslint-disable @typescript-eslint/no-deprecated */
import {
  trigger,
  transition,
  style,
  query,
  animate,
  group,
  animateChild,
  stagger
} from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  // Landing -> Talents (slide left with scale)
  transition('LandingPage => TalentsPage', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      })
    ], { optional: true }),
    
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateX(100%) scale(0.9)',
        filter: 'blur(10px)'
      })
    ], { optional: true }),
    
    group([
      query(':leave', [
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({
          opacity: 0,
          transform: 'translateX(-30%) scale(0.95)',
          filter: 'blur(5px)'
        }))
      ], { optional: true }),
      
      query(':enter', [
        animate('600ms 100ms cubic-bezier(0.35, 0, 0.25, 1)', style({
          opacity: 1,
          transform: 'translateX(0) scale(1)',
          filter: 'blur(0)'
        }))
      ], { optional: true })
    ]),
    
    query(':enter', animateChild(), { optional: true })
  ]),

  // Talents -> Landing (slide right with scale)
  transition('TalentsPage => LandingPage', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      })
    ], { optional: true }),
    
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateX(-100%) scale(0.9)',
        filter: 'blur(10px)'
      })
    ], { optional: true }),
    
    group([
      query(':leave', [
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({
          opacity: 0,
          transform: 'translateX(30%) scale(0.95)',
          filter: 'blur(5px)'
        }))
      ], { optional: true }),
      
      query(':enter', [
        animate('600ms 100ms cubic-bezier(0.35, 0, 0.25, 1)', style({
          opacity: 1,
          transform: 'translateX(0) scale(1)',
          filter: 'blur(0)'
        }))
      ], { optional: true })
    ]),
    
    query(':enter', animateChild(), { optional: true })
  ]),

  // Any -> AddTalent (zoom in from center)
  transition('* => AddTalentPage', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      })
    ], { optional: true }),
    
    query(':enter', [
      style({
        opacity: 0,
        transform: 'scale(0.8) translateY(50px)',
        filter: 'blur(15px)'
      })
    ], { optional: true }),
    
    group([
      query(':leave', [
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 0,
          transform: 'scale(1.1)',
          filter: 'blur(8px)'
        }))
      ], { optional: true }),
      
      query(':enter', [
        animate('600ms 150ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({
          opacity: 1,
          transform: 'scale(1) translateY(0)',
          filter: 'blur(0)'
        }))
      ], { optional: true })
    ]),
    
    query(':enter', animateChild(), { optional: true })
  ]),

  // AddTalent -> Any (zoom out)
  transition('AddTalentPage => *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      })
    ], { optional: true }),
    
    query(':enter', [
      style({
        opacity: 0,
        transform: 'scale(1.1)',
        filter: 'blur(10px)'
      })
    ], { optional: true }),
    
    group([
      query(':leave', [
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 0,
          transform: 'scale(0.85) translateY(30px)',
          filter: 'blur(10px)'
        }))
      ], { optional: true }),
      
      query(':enter', [
        animate('500ms 100ms cubic-bezier(0.35, 0, 0.25, 1)', style({
          opacity: 1,
          transform: 'scale(1)',
          filter: 'blur(0)'
        }))
      ], { optional: true })
    ]),
    
    query(':enter', animateChild(), { optional: true })
  ]),

  // Any -> Collaborations (slide up with bounce)
  transition('* => CollaborationsPage', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      })
    ], { optional: true }),
    
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(100%) rotate(3deg)',
        filter: 'blur(10px)'
      })
    ], { optional: true }),
    
    group([
      query(':leave', [
        animate('450ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 0,
          transform: 'translateY(-20%) scale(0.95)',
          filter: 'blur(5px)'
        }))
      ], { optional: true }),
      
      query(':enter', [
        animate('650ms 100ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({
          opacity: 1,
          transform: 'translateY(0) rotate(0)',
          filter: 'blur(0)'
        }))
      ], { optional: true })
    ]),
    
    query(':enter', animateChild(), { optional: true })
  ]),

  // Collaborations -> Any (slide down)
  transition('CollaborationsPage => *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      })
    ], { optional: true }),
    
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(-50%)',
        filter: 'blur(10px)'
      })
    ], { optional: true }),
    
    group([
      query(':leave', [
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 0,
          transform: 'translateY(50%) rotate(-2deg)',
          filter: 'blur(8px)'
        }))
      ], { optional: true }),
      
      query(':enter', [
        animate('500ms 100ms cubic-bezier(0.35, 0, 0.25, 1)', style({
          opacity: 1,
          transform: 'translateY(0)',
          filter: 'blur(0)'
        }))
      ], { optional: true })
    ]),
    
    query(':enter', animateChild(), { optional: true })
  ]),

  // Default transition (fade + slide)
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      })
    ], { optional: true }),
    
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(40px) scale(0.98)',
        filter: 'blur(8px)'
      })
    ], { optional: true }),
    
    group([
      query(':leave', [
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 0,
          transform: 'translateY(-30px) scale(0.98)',
          filter: 'blur(5px)'
        }))
      ], { optional: true }),
      
      query(':enter', [
        animate('500ms 100ms cubic-bezier(0.35, 0, 0.25, 1)', style({
          opacity: 1,
          transform: 'translateY(0) scale(1)',
          filter: 'blur(0)'
        }))
      ], { optional: true })
    ]),
    
    query(':enter', animateChild(), { optional: true })
  ])
]);
