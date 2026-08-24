import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCheck,
  faExclamationTriangle,
  faGrip,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { Select } from '~/components/select/select';
import { QualityJson } from '~/data/schema/quality';
import { TranslatePipe } from '~/translate/translate-pipe';

import { EditorTab } from '../editor-tab';

function emptyQuality(): QualityJson {
  return {
    id: '',
    name: '',
    icon: undefined,
    iconText: undefined,
    level: 0,
  };
}

@Component({
  selector: 'lab-qualities',
  imports: [
    FormsModule,
    DragDropModule,
    FaIconComponent,
    Button,
    Select,
    TranslatePipe,
  ],
  templateUrl: './qualities.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Qualities extends EditorTab {
  private readonly cd = inject(ChangeDetectorRef);

  protected readonly faGrip = faGrip;
  protected model = emptyQuality();

  add(): void {
    const { data } = this.edit();
    const qualities = [...(data.qualities ?? [])];
    qualities.push(this.model);
    data.qualities = qualities;
    this.model = emptyQuality();
    this.cd.detectChanges();
  }

  drop(event: CdkDragDrop<unknown>): void {
    moveItemInArray(
      this.edit().data.qualities ?? [],
      event.previousIndex,
      event.currentIndex,
    );
  }

  updateId(quality: QualityJson, id: string): void {
    const { data } = this.edit();
    for (const item of data.items) {
      if (item.technology?.qualityUnlock) {
        const idx = item.technology.qualityUnlock.indexOf(quality.id);
        if (idx !== -1) item.technology.qualityUnlock[idx] = id;
      }
    }

    quality.id = id;
  }

  remove(id: string): void {
    const { data } = this.edit();
    this.confirm
      .open({
        header: 'Delete quality?',
        message:
          'If this quality is in use, deleting it will invalidate some entities. Continue?',
        icon: faExclamationTriangle,
        actions: [
          { text: 'yes', value: 1, icon: faCheck },
          { text: 'cancel', value: 0, icon: faXmark },
        ],
      })
      .subscribe((res) => {
        if (res === 1 && data.qualities) {
          data.qualities = data.qualities.filter((c) => c.id !== id);
          this.cd.detectChanges();
        }
      });
  }
}
