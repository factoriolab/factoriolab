import { Directive, DOCUMENT, inject } from '@angular/core';

@Directive({
  selector: '[labRipple]',
  host: { class: 'relative', '(click)': 'ripple($event)' },
})
export class Ripple {
  private readonly document = inject(DOCUMENT);

  ripple(event: MouseEvent): void {
    const ripple = this.document.createElement('span');
    ripple.classList.add(
      'absolute',
      'rounded-full',
      'bg-gray-50/40',
      'animate-ripple',
    );

    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - (rect.left + radius)}px`;
    ripple.style.top = `${event.clientY - (rect.top + radius)}px`;

    element.appendChild(ripple);

    // Remove the ripple element after the animation completes
    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  }
}
