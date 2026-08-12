import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';
import { faFloppyDisk, faTrash } from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { TranslatePipe } from '~/translate/translate-pipe';

import { EditorData } from '../editor.types';

@Component({
  selector: 'lab-icons',
  imports: [Button, TranslatePipe],
  templateUrl: './icons.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col' },
})
export class Icons {
  protected readonly edit = inject<Signal<EditorData>>(ROUTER_OUTLET_DATA);

  protected readonly faTrash = faTrash;
  protected readonly faFloppyDisk = faFloppyDisk;
}
