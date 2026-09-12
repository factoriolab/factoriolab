import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { TranslatePipe } from '~/translate/translate-pipe';

import { EditorTab } from '../editor-tab';

@Component({
  selector: 'lab-version',
  imports: [FormsModule, KeyValuePipe, Button, TranslatePipe],
  templateUrl: './version.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Version extends EditorTab {
  protected readonly faXmark = faXmark;
  protected readonly model = { mod: '', version: '' };

  updateKey(oldKey: string, newKey: string): void {
    const data = this.edit().data;
    data.version[newKey] = data.version[oldKey];
    delete data.version[oldKey];
  }

  remove(key: string): void {
    delete this.edit().data.version[key];
  }
}
