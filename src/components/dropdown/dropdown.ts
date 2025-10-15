import { CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck, faGear, faXmark } from '@fortawesome/free-solid-svg-icons';
import { cva } from 'class-variance-authority';

import { Button } from '../button/button';
import { Rounded, roundedVariants } from '../rounding';

const host = cva(
  'inline-flex cursor-pointer border justify-center items-center min-h-9 min-w-9 relative hover:bg-gray-800 group outline-brand-600 focus-visible:outline hover:border-brand-600',
  {
    variants: {
      opened: {
        true: 'border-brand-600 outline z-2',
      },
      border: { false: 'hover:border-brand-600' },
      rounded: roundedVariants,
      disabled: { true: 'pointer-events-none' },
    },
    compoundVariants: [
      { border: true, opened: false, class: 'border-gray-600' },
    ],
  },
);

@Component({
  selector: 'lab-dropdown',
  imports: [OverlayModule, FaIconComponent, Button],
  templateUrl: './dropdown.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'button',
    '[class]': 'hostClass()',
    '[attr.id]': 'controlId()',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    'aria-haspopup': 'true',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.aria-controls]': 'opened() ? controlId() + "-menu" : null',
    '[attr.aria-expanded]': 'opened()',
    '[attr.aria-labelledby]': 'labelledBy()',
    '(keydown.enter)': 'toggle()',
    '(click)': 'toggle()',
  },
  hostDirectives: [CdkOverlayOrigin],
})
export class Dropdown {
  protected readonly overlayOrigin = inject(CdkOverlayOrigin);

  readonly controlId = input.required();
  readonly disabled = input(false);
  readonly labelledBy = input<string>();
  readonly border = input(true);
  readonly rounded = input<Rounded>('all');

  readonly open = output();
  readonly save = output();

  protected readonly opened = signal(false);

  protected readonly hostClass = computed(() =>
    host({
      opened: this.opened(),
      border: this.border(),
      rounded: this.rounded(),
      disabled: this.disabled(),
    }),
  );

  protected readonly faCheck = faCheck;
  protected readonly faGear = faGear;
  protected readonly faXmark = faXmark;

  toggle(): void {
    if (this.disabled()) return;

    if (this.opened()) {
      this.opened.set(false);
      this.save.emit();
    } else {
      this.opened.set(true);
      this.open.emit();
    }
  }
}
