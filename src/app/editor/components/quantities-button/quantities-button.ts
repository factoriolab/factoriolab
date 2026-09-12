import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { cva } from 'class-variance-authority';

import { Icon } from '~/components/icon/icon';
import { Ripple } from '~/components/ripple/ripple';

import { EditorData } from '../../editor.types';

const host = cva(
  'gap-1 min-h-9 rounded-xs inline-flex cursor-pointer items-center border select-none hover:bg-gray-800 focus:z-2 focus-visible:outline disabled:pointer-events-none',
  {
    variants: {
      defined: {
        true: 'z-1 border-brand-400/75 px-px text-brand-400 outline-brand-400 focus-visible:border-brand-400',
        false:
          'min-w-9 justify-center border-gray-700 text-gray-50 outline-brand-400 focus-visible:border-brand-400',
      },
    },
  },
);

@Component({
  selector: 'button[labQuantitiesButton], button[lab-quantities-button]',
  exportAs: 'labQuantitiesButton',
  imports: [KeyValuePipe, FaIconComponent, Icon],
  templateUrl: './quantities-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [Ripple],
  host: {
    '[class]': 'hostClass()',
  },
})
export class QuantitiesButton {
  readonly edit = input.required<EditorData>();
  readonly record = input<
    Partial<Record<string, string | number>> | undefined
  >();

  protected readonly faPlus = faPlus;
  protected readonly hostClass = computed(() =>
    host({
      defined: this.record() != null,
    }),
  );
}
