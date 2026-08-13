import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ROUTER_OUTLET_DATA } from '@angular/router';
import {
  faFloppyDisk,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { TranslatePipe } from '~/translate/translate-pipe';

import { EditorData } from '../editor.types';

@Component({
  selector: 'lab-version',
  imports: [FormsModule, KeyValuePipe, Button, TranslatePipe],
  templateUrl: './version.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Version {
  protected readonly edit = inject<Signal<EditorData>>(ROUTER_OUTLET_DATA);

  protected readonly faXmark = faXmark;
  protected readonly faTrash = faTrash;
  protected readonly faFloppyDisk = faFloppyDisk;

  changeKey(oldKey: string, newKey: string): void {
    const data = this.edit().data;
    data.version[newKey] = data.version[oldKey];
    delete data.version[oldKey];
  }

  remove(key: string): void {
    delete this.edit().data.version[key];
  }
}
