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
  'flex items-center transition-colors rounded-xs cursor-pointer min-h-9 focus-visible:border-brand-800 focus-visible:outline outline-brand-700',
  {
    variants: {
      variant: {
        gray: 'bg-gray-950 hover:bg-gray-700 border-gray-700',
        brand: 'bg-brand-950 hover:bg-brand-700 border-brand-700',
      },
      iconOnly: {
        true: 'min-w-9 justify-center',
        false: 'border px-3',
      },
    },
  },
);

@Component({
  selector: '[lab-button], [labButton]',
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
  variant = input<'brand' | 'gray'>('gray');

  hostClass = computed(() =>
    button({ iconOnly: !this.text(), variant: this.variant() }),
  );
}
