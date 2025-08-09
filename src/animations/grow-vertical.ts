import { animate, style, transition, trigger } from '@angular/animations';

export const growVertical = trigger('growVertical', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scaleY(0)', 'transform-origin': 'top' }),
    animate(
      '150ms ease-out',
      style({ opacity: 1, transform: 'scaleY(1)', 'transform-origin': 'top' }),
    ),
  ]),
  transition(':leave', [
    style({ opacity: 1, transform: 'scaleY(1)', 'transform-origin': 'top' }),
    animate(
      '150ms ease-in',
      style({ opacity: 0, transform: 'scaleY(0)', 'transform-origin': 'top' }),
    ),
  ]),
]);

// export const growVertical = trigger('growVertical', [
//   transition(':enter', [
//     style({ height: 0, opacity: 0 }),
//     animate('150ms ease-out', style({ height: '*', opacity: 1 })),
//   ]),
//   transition(':leave', [
//     style({ height: '*', opacity: 1 }),
//     animate('150ms ease-in', style({ height: 0, opacity: 0 })),
//   ]),
// ]);
