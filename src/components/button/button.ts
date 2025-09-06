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
import { TranslatePipe } from '~/translate/translate-pipe';

import { Icon } from '../icon/icon';

const host = cva(
  'overflow-hidden items-center gap-1 transition-colors cursor-pointer focus-visible:outline focus:z-2',
  {
    variants: {
      color: {
        gray: 'bg-gray-950 text-gray-50 outline-brand-700 focus-visible:border-brand-700',
        brand:
          'bg-brand-950 text-brand-50 outline-gray-300 focus-visible:border-gray-300 z-1',
      },
      size: {
        small: 'min-h-8 text-sm font-light opacity-60',
        standard: 'min-h-9',
        large: 'min-h-11 text-2xl font-light',
      },
      border: {
        true: 'border',
      },
      rounded: {
        true: 'rounded-xs',
      },
      hide: {
        true: 'hidden',
        false: 'inline-flex',
      },
      iconOnly: {
        true: 'justify-center',
        false: 'px-3',
      },
    },
    compoundVariants: [
      {
        color: 'gray',
        border: true,
        class: 'hover:bg-gray-700 border-gray-700',
      },
      {
        color: 'brand',
        border: true,
        class: 'hover:bg-brand-700 border-brand-700',
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
})
export class Button {
  readonly text = input('');
  readonly faIcon = input<IconDefinition>();
  readonly iconType = input<IconType>();
  readonly icon = input<string>();
  readonly color = input<'brand' | 'gray'>('gray');
  readonly size = input<'small' | 'standard' | 'large'>('standard');
  readonly border = input(true);
  readonly rounded = input(true);
  readonly hide = input(false);

  readonly hostClass = computed(() =>
    host({
      color: this.color(),
      size: this.size(),
      border: this.border(),
      rounded: this.rounded(),
      hide: this.hide(),
      iconOnly: !this.text(),
    }),
  );
}
