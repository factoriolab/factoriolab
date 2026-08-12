import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';

import { ModData } from '~/data/schema/mod-data';

@Component({
  selector: 'lab-categories',
  templateUrl: './categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col' },
})
export class Categories {
  protected readonly data = inject<Signal<ModData>>(ROUTER_OUTLET_DATA);
}
