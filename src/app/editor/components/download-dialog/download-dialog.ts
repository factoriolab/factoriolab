import { DialogRef } from '@angular/cdk/dialog';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { switchMap } from 'rxjs';

import { Button } from '~/components/button/button';
import { DialogData } from '~/components/dialog/dialog';
import { datasets, DEFAULT_MOD } from '~/data/datasets';
import { ModData } from '~/data/schema/mod-data';
import { Option } from '~/option/option';
import { TranslatePipe } from '~/translate/translate-pipe';

import { EditorData } from '../../editor.types';
import { splitIcons } from '../../image.utils';
import { Select } from '../select/select';

@Component({
  selector: 'lab-download-dialog',
  imports: [Button, Select, TranslatePipe],
  templateUrl: './download-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0 lg:max-w-3xl',
  },
})
export class DownloadDialog implements DialogData {
  protected readonly http = inject(HttpClient);
  protected readonly dialogRef = inject<DialogRef<EditorData>>(DialogRef);

  readonly header = 'editor.loadExistingData';
  protected readonly faCheck = faCheck;
  protected readonly faXmark = faXmark;
  protected readonly loading = signal(false);
  protected readonly modId = signal(DEFAULT_MOD);
  protected readonly options = datasets.mods.map(
    (m): Option => ({ label: m.name, value: m.id }),
  );

  save(): void {
    this.loading.set(true);
    const modId = this.modId();
    this.http
      .get<ModData>(`data/${modId}/data.json`)
      .pipe(switchMap((data) => splitIcons(`data/${modId}/icons.webp`, data)))
      .subscribe((edit) => {
        this.dialogRef.close(edit);
      });
  }
}
