import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';
import {
  faFloppyDisk,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { ModData } from '~/data/schema/mod-data';

@Component({
  selector: 'lab-version',
  imports: [KeyValuePipe, Button],
  templateUrl: './version.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Version {
  protected readonly data = inject<Signal<ModData>>(ROUTER_OUTLET_DATA);

  protected readonly faXmark = faXmark;
  protected readonly faTrash = faTrash;
  protected readonly faFloppyDisk = faFloppyDisk;

  add(key: string, value: string): void {
    this.data().version[key] = value;
  }

  remove(key: string): void {
    delete this.data().version[key];
  }
}
