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
  'group cursor-pointer items-center gap-1 overflow-hidden transition-colors select-none focus:z-2 focus-visible:outline disabled:pointer-events-none',
  {
    variants: {
      color: {
        gray: 'outline-brand-600 focus-visible:border-brand-600 text-gray-50',
        brand:
          'text-brand-50 bg-brand-950 z-1 outline-gray-300 focus-visible:border-gray-600',
        complement:
          'text-complement-50 bg-complement-950 z-1 outline-gray-300 focus-visible:border-gray-300',
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
        class: 'hover:bg-gray-800 border-gray-600',
      },
      {
        color: 'brand',
        border: true,
        class: 'hover:bg-brand-800 border-brand-600',
      },
      {
        color: 'complement',
        border: true,
        class: 'hover:bg-complement-800 border-complement-600',
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

@Component({
  selector: '[lab-button], [labButton]',
  exportAs: 'labButton',
  imports: [FaIconComponent, Icon, TranslatePipe],
  templateUrl: './button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
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
  readonly toggled = input(false);
  readonly disabled = input(false);
  readonly textAlign = input<'left' | 'center' | 'right'>('center');
  readonly textParams = input<TranslateParams>();

  readonly hostClass = computed(() =>
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

  readonly alignClass = computed(() => {
    switch (this.textAlign()) {
      case 'left':
        return 'text-left';
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-end';
    }
  });
}
