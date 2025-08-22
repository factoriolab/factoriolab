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

import { IconType } from '~/models/icon-type';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Icon } from '../icon/icon';

const button = cva(
  'inline-flex items-center gap-1 transition-colors rounded-xs cursor-pointer focus-visible:outline',
  {
    variants: {
      color: {
        gray: 'outline-brand-700 focus-visible:border-brand-700',
        brand: 'outline-gray-300 focus-visible:border-gray-300',
      },
      border: {
        true: 'border',
      },
      size: {
        small: 'min-h-8 text-sm font-light opacity-60',
        standard: 'min-h-9',
        large: 'min-h-11 text-2xl font-light tracking-wide',
      },
      iconOnly: {
        true: 'min-w-9 justify-center',
        false: 'px-3',
      },
    },
    compoundVariants: [
      {
        color: 'gray',
        border: true,
        class: 'bg-gray-950 hover:bg-gray-700 border-gray-700',
      },
      {
        color: 'brand',
        border: true,
        class: 'bg-brand-950 hover:bg-brand-700 border-brand-700',
      },
      {
        color: 'gray',
        border: false,
        class: 'hover:bg-gray-700/20',
      },
      {
        color: 'brand',
        border: false,
        class: 'text-brand-50 hover:bg-brand-700/20',
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
  text = input('');
  faIcon = input<IconDefinition>();
  iconType = input<IconType>();
  icon = input<string>();
  color = input<'brand' | 'gray'>('gray');
  border = input(true);
  size = input<'small' | 'standard' | 'large'>('standard');

  hostClass = computed(() =>
    button({
      iconOnly: !this.text(),
      color: this.color(),
      border: this.border(),
      size: this.size(),
    }),
  );
}
