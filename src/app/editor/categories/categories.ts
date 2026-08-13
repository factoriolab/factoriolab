import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ROUTER_OUTLET_DATA } from '@angular/router';
import { faFloppyDisk, faTrash } from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { TranslatePipe } from '~/translate/translate-pipe';

import { EditorData } from '../editor.types';

@Component({
  selector: 'lab-categories',
  imports: [FormsModule, Button, TranslatePipe],
  templateUrl: './categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col' },
})
export class Categories {
  protected readonly edit = inject<Signal<EditorData>>(ROUTER_OUTLET_DATA);

  protected readonly faTrash = faTrash;
  protected readonly faFloppyDisk = faFloppyDisk;
}
