import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import {
  FaIconComponent,
  IconDefinition,
} from '@fortawesome/angular-fontawesome';
import { cva } from 'class-variance-authority';

import { IconType } from '~/data/icon-type';
import { Color } from '~/state/preferences/color';
import { TranslateParams } from '~/translate/translate';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Icon } from '../icon/icon';
import { Ripple } from '../ripple/ripple';
import { Rounded, roundedVariants } from '../rounding';

const host = cva(
  'group gap-1 cursor-pointer items-center overflow-hidden transition-colors select-none focus:z-2 focus-visible:outline disabled:pointer-events-none',
  {
    variants: {
      color: {
        gray: 'text-gray-50 outline-brand-600 focus-visible:border-brand-600',
        brand: 'z-1 text-brand-400 outline-brand-400',
        complement: 'z-1 text-complement-400 outline-complement-400',
      },
      size: {
        micro: 'w-9',
        small: 'min-h-8 text-sm font-light opacity-60',
        standard: 'min-h-9',
        large: 'min-h-11 text-2xl font-light',
      },
      border: { true: 'border' },
      rounded: roundedVariants,
      hide: {
        true: 'hidden',
        false: 'inline-flex',
      },
      iconOnly: {
        true: 'justify-center',
        false: 'px-3',
      },
      toggle: {
        true: 'border-brand-600 hover:border',
      },
      disabled: {
        true: 'pointer-events-none opacity-40',
      },
    },
    compoundVariants: [
      {
        color: 'gray',
        border: true,
        class: 'border-gray-600 hover:bg-gray-800',
      },
      {
        color: 'brand',
        border: true,
        class: 'border-brand-400 hover:bg-gray-800',
      },
      {
        color: 'complement',
        border: true,
        class: 'border-complement-400 hover:bg-gray-800',
      },
      {
        color: 'gray',
        border: false,
        class: 'hover:bg-gray-800',
      },
      {
        color: 'brand',
        border: false,
        class: 'hover:bg-brand-800',
      },
      {
        color: 'complement',
        border: false,
        class: 'hover:bg-complement-800',
      },
      {
        size: 'small',
        iconOnly: true,
        class: 'min-w-8',
      },
      {
        size: 'standard',
        iconOnly: true,
        class: 'min-w-9',
      },
      {
        size: 'large',
        iconOnly: true,
        class: 'min-w-11',
      },
    ],
  },
);

const alignClassMap: Record<'left' | 'center' | 'right', string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-end',
};

@Component({
  selector: '[lab-button], [labButton]',
  exportAs: 'labButton',
  imports: [FaIconComponent, Icon, TranslatePipe],
  templateUrl: './button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
    '[attr.disabled]': 'disabled() ? true : null',
    '[attr.aria-disabled]': 'disabled() ? true : null',
  },
  hostDirectives: [Ripple],
})
export class Button {
  readonly text = input('');
  readonly faIcon = input<IconDefinition>();
  readonly iconType = input<IconType>();
  readonly icon = input<string>();
  readonly iconText = input<string>();
  readonly color = input<Color>('gray');
  readonly size = input<'micro' | 'small' | 'standard' | 'large'>('standard');
  readonly border = input(true);
  readonly rounded = input<Rounded>('all');
  readonly hide = input(false);
  readonly toggleIcon = input<IconDefinition>();
  readonly toggled = input<boolean | undefined>(false);
  readonly disabled = input(false);
  readonly textAlign = input<'left' | 'center' | 'right'>('center');
  readonly textParams = input<TranslateParams>();

  protected readonly alignClassMap: Record<
    'left' | 'center' | 'right',
    string
  > = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-end',
  };
  protected readonly hostClass = computed(() =>
    host({
      color: this.color(),
      size: this.size(),
      border: this.border(),
      rounded: this.rounded(),
      hide: this.hide(),
      iconOnly: !this.text(),
      toggle: this.toggleIcon() != null,
      disabled: this.disabled(),
    }),
  );

  readonly alignClass = computed(() => alignClassMap[this.textAlign()]);
}
