import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import { IdType } from '~/models/icon-type';

@Component({
  selector: 'lab-icon',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "inline-flex bg-[url('../public/icons/icons.webp')] size-8",
    '[class]': 'hostClass()',
  },
})
export class Icon {
  value = input.required<string>();
  type = input.required<IdType>();

  hostClass = computed(() => `${this.value()} ${this.type()}`);
}
