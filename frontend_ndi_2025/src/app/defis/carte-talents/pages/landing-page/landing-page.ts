import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';

declare const gsap: any;
declare const ScrollTrigger: any;

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css']
})
export class LandingPage implements AfterViewInit, OnDestroy {
  @ViewChild('landingRoot', { static: true })
  landingRoot!: ElementRef<HTMLDivElement>;

  @ViewChild('floatingCard', { static: true })
  floatingCard!: ElementRef<HTMLDivElement>;

  private scrollTriggers: any[] = [];
  private mouseMoveHandler: ((e: MouseEvent) => void) | null = null;

  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);
    const root = this.landingRoot.nativeElement;

    this.initLoadAnimations(root);
    this.initScrollAnimations(root);
    this.initMouseParallax(root);
  }

  ngOnDestroy(): void {
    this.scrollTriggers.forEach(st => st.kill());
    if (this.mouseMoveHandler) {
      window.removeEventListener('mousemove', this.mouseMoveHandler);
    }
  }

  private initLoadAnimations(root: HTMLElement): void {
    const tl = gsap.timeline({
      defaults: { duration: 0.7, ease: 'power3.out' }
    });

    // Header
    tl.from(root.querySelector('[data-anim="header"]'), {
      y: -50,
      opacity: 0
    });

    // Announcement bar
    tl.from(root.querySelector('[data-anim="announcement"]'), {
      y: -30,
      opacity: 0
    }, '-=0.5');

    // Hero content
    tl.from(root.querySelector('[data-anim="hero-content"]'), {
      x: -60,
      opacity: 0,
      duration: 0.9
    }, '-=0.4');

    // Title lines
    tl.from(root.querySelectorAll('[data-anim="title"]'), {
      y: 80,
      opacity: 0,
      stagger: 0.15,
      duration: 0.8
    }, '-=0.6');

    // Hero visual
    tl.from(root.querySelector('[data-anim="hero-visual"]'), {
      scale: 0.8,
      opacity: 0,
      duration: 1,
      ease: 'elastic.out(1, 0.6)'
    }, '-=0.5');
  }

  private initScrollAnimations(root: HTMLElement): void {
    // Features icons
    const iconsTrigger = ScrollTrigger.create({
      trigger: '[data-scroll="icons"]',
      start: 'top 85%',
      onEnter: () => {
        gsap.from(root.querySelectorAll('[data-anim="icon"]'), {
          y: 50,
          opacity: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: 'back.out(1.5)'
        });
      },
      once: true
    });
    this.scrollTriggers.push(iconsTrigger);

    // About section
    const aboutTrigger = ScrollTrigger.create({
      trigger: '[data-scroll="about"]',
      start: 'top 75%',
      onEnter: () => {
        gsap.from(root.querySelector('.about__content'), {
          x: -80,
          opacity: 0,
          duration: 0.8
        });
        gsap.from(root.querySelector('.about__visual'), {
          x: 80,
          opacity: 0,
          duration: 0.8,
          delay: 0.2
        });
      },
      once: true
    });
    this.scrollTriggers.push(aboutTrigger);

    // Products section
    const productsTrigger = ScrollTrigger.create({
      trigger: '[data-scroll="products"]',
      start: 'top 80%',
      onEnter: () => {
        gsap.from(root.querySelector('[data-anim="section-title"]'), {
          y: 50,
          opacity: 0,
          duration: 0.6
        });
        gsap.from(root.querySelectorAll('[data-anim="product"]'), {
          y: 80,
          opacity: 0,
          rotation: -5,
          stagger: 0.12,
          duration: 0.7,
          ease: 'back.out(1.3)',
          delay: 0.2
        });
      },
      once: true
    });
    this.scrollTriggers.push(productsTrigger);

    // Evaluation section
    const evalTrigger = ScrollTrigger.create({
      trigger: '[data-scroll="eval"]',
      start: 'top 80%',
      onEnter: () => {
        gsap.from(root.querySelector('.eval__header'), {
          y: 40,
          opacity: 0,
          duration: 0.6
        });
        gsap.from(root.querySelectorAll('[data-anim="eval"]'), {
          scale: 0.8,
          opacity: 0,
          stagger: 0.15,
          duration: 0.6,
          ease: 'back.out(1.5)',
          delay: 0.3
        });
        // Animate numbers
        root.querySelectorAll('.eval-card__points').forEach((el: Element) => {
          const target = parseInt(el.textContent || '0', 10);
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.5,
            ease: 'power2.out',
            delay: 0.5,
            onUpdate: () => {
              el.textContent = Math.round(obj.val).toString();
            }
          });
        });
      },
      once: true
    });
    this.scrollTriggers.push(evalTrigger);

    // CTA section
    const ctaTrigger = ScrollTrigger.create({
      trigger: '[data-scroll="cta"]',
      start: 'top 80%',
      onEnter: () => {
        gsap.from(root.querySelector('.cta-footer__title'), {
          y: 60,
          opacity: 0,
          duration: 0.8
        });
        gsap.from(root.querySelector('.cta-footer .btn'), {
          y: 30,
          opacity: 0,
          duration: 0.6,
          delay: 0.3
        });
      },
      once: true
    });
    this.scrollTriggers.push(ctaTrigger);
  }

  private initMouseParallax(root: HTMLElement): void {
    this.mouseMoveHandler = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      // Floating card parallax
      if (this.floatingCard?.nativeElement) {
        gsap.to(this.floatingCard.nativeElement, {
          x: x * 15,
          y: y * 10,
          rotation: x * 3 - 3,
          duration: 0.5,
          ease: 'power2.out'
        });
      }

      // Float badges
      root.querySelectorAll('.float-badge').forEach((badge, i) => {
        gsap.to(badge, {
          x: x * (10 + i * 5),
          y: y * (8 + i * 3),
          duration: 0.6,
          ease: 'power2.out'
        });
      });
    };

    window.addEventListener('mousemove', this.mouseMoveHandler);
  }
}
