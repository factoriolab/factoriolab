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
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { faCheck, faGear, faXmark } from '@fortawesome/free-solid-svg-icons';
import { cva } from 'class-variance-authority';

import { Rational, rational } from '~/rational/rational';
import { ItemSettings } from '~/state/items/item-settings';
import { SettingsStore } from '~/state/settings/settings-store';
import { spread } from '~/utils/object';

import { Button } from '../button/button';
import { Control, LAB_CONTROL } from '../control';
import { FormField } from '../form-field/form-field';
import { Icon } from '../icon/icon';
import { InputNumber } from '../input-number/input-number';
import { Select } from '../select/select';
import { Tooltip } from '../tooltip/tooltip';

let nextUniqueId = 0;

const host = cva(
  'inline-flex cursor-pointer justify-center items-center min-h-9 min-w-9 relative hover:bg-gray-800 group outline-brand-700 border focus-visible:outline rounded-xs hover:border-brand-700',
  {
    variants: {
      opened: { true: 'border-brand-700' },
      disabled: { true: 'pointer-events-none' },
    },
  },
);

@Component({
  selector: 'lab-belt-select',
  imports: [
    FormsModule,
    OverlayModule,
    Button,
    Icon,
    InputNumber,
    Select,
    Tooltip,
  ],
  templateUrl: './belt-select.html',
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
      useExisting: BeltSelect,
    },
    { provide: LAB_CONTROL, useExisting: BeltSelect },
  ],
})
export class BeltSelect extends Control<ItemSettings> {
  protected readonly overlayOrigin = inject(CdkOverlayOrigin);
  readonly formField = inject(FormField, { optional: true });
  protected readonly settingsStore = inject(SettingsStore);

  private uniqueId = (nextUniqueId++).toString();

  readonly controlId = input(`lab-belt-select-${this.uniqueId}`);
  readonly value = model<ItemSettings>();
  readonly disabled = model(false);
  readonly labelledBy = input<string>();
  readonly stack = input.required<Rational>();

  readonly opened = signal(false);
  readonly editValue = linkedSignal(() => spread(this.value()));

  readonly hostClass = computed(() =>
    host({
      opened: this.opened(),
      disabled: this.disabled(),
    }),
  );

  protected readonly faCheck = faCheck;
  protected readonly faGear = faGear;
  protected readonly faXmark = faXmark;
  protected readonly rational = rational;

  toggle(): void {
    if (this.disabled()) return;

    if (this.opened()) {
      this.opened.set(false);
      this.value.set(this.editValue());
    } else this.opened.set(true);
  }

  setStack(stack: Rational): void {
    this.editValue.update((v) => spread(v, { stack }));
  }

  setBelt(beltId: string): void {
    this.editValue.update((v) => spread(v, { beltId }));
  }
}
