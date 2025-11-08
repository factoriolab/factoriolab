import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import { Breadcrumb } from '~/components/breadcrumb/breadcrumb';
import { LinkOption } from '~/option/link-option';

@Component({
  selector: 'lab-collection',
  imports: [Breadcrumb],
  templateUrl: './collection.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Collection {
  readonly label = input.required<string>();

  protected readonly crumbs = computed<LinkOption[]>(() => [
    { label: this.label() },
  ]);
}
