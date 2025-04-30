import { animate, style, transition, trigger } from '@angular/animations';

export const fadeIf = trigger('fadeIf', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scaleY(50%)', 'transform-origin': 'top' }),
    animate(
      '100ms ease-out',
      style({
        opacity: 1,
        transform: 'scaleY(96%)',
        'transform-origin': 'top',
      }),
    ),
  ]),
  transition(':leave', [
    style({ opacity: 1, transform: 'scaleY(100%)', 'transform-origin': 'top' }),
    animate(
      '100ms ease-in',
      style({
        opacity: 0,
        transform: 'scaleY(96%)',
        'transform-origin': 'top',
      }),
    ),
  ]),
]);
