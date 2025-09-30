import { CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck, faGear, faXmark } from '@fortawesome/free-solid-svg-icons';
import { cva } from 'class-variance-authority';

import { Machine } from '~/data/schema/machine';
import { ModuleSettings } from '~/state/module-settings';

import { Button } from '../button/button';
import { Control, LAB_CONTROL } from '../control';
import { FormField } from '../form-field/form-field';
import { Icon } from '../icon/icon';
import { Modules } from '../modules/modules';
import { Tooltip } from '../tooltip/tooltip';

let nextUniqueId = 0;

const host = cva(
  'inline-flex cursor-pointer justify-center items-center min-h-9 min-w-9 relative hover:bg-gray-800 group outline-brand-700 border focus-visible:outline rounded-xs hover:border-brand-700',
  {
    variants: {
      opened: {
        true: 'border-brand-700',
        false: '',
      },
      disabled: {
        true: 'pointer-events-none',
      },
    },
  },
);

@Component({
  selector: 'lab-modules-select',
  imports: [OverlayModule, FaIconComponent, Button, Icon, Modules, Tooltip],
  templateUrl: './modules-select.html',
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
    '[attr.aria-labelledby]': 'labelledBy() ?? formField?.labelId ?? null',
    '(keydown.enter)': 'toggle()',
    '(click)': 'toggle()',
  },
  hostDirectives: [CdkOverlayOrigin],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: ModulesSelect,
    },
    { provide: LAB_CONTROL, useExisting: ModulesSelect },
  ],
})
export class ModulesSelect extends Control<ModuleSettings[]> {
  protected readonly overlayOrigin = inject(CdkOverlayOrigin);
  readonly formField = inject(FormField, { optional: true });

  private uniqueId = (nextUniqueId++).toString();

  readonly controlId = input(`lab-modules-select-${this.uniqueId}`);
  readonly value = model<ModuleSettings[]>();
  readonly disabled = model(false);
  readonly labelledBy = input<string>();
  readonly machine = input.required<Machine>();
  readonly recipeId = input<string>();

  readonly opened = signal(false);

  readonly editValue = linkedSignal(() => this.value() ?? []);

  readonly hostClass = computed(() =>
    host({
      opened: this.opened(),
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
      this.value.set(this.editValue());
    } else this.opened.set(true);
  }
}
