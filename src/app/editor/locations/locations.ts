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
import { CategoryJson } from '~/data/schema/category';
import { TranslatePipe } from '~/translate/translate-pipe';

import { EditorTab } from '../editor-tab';
import { emptyBase } from '../object-utils';

@Component({
  selector: 'lab-locations',
  imports: [
    FormsModule,
    DragDropModule,
    FaIconComponent,
    Button,
    Select,
    TranslatePipe,
  ],
  templateUrl: './locations.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Locations extends EditorTab {
  private readonly cd = inject(ChangeDetectorRef);

  protected readonly faGrip = faGrip;
  protected model = emptyBase();

  add(): void {
    const { data } = this.edit();
    const locations = [...(data.locations ?? [])];
    locations.push(this.model);
    data.locations = locations;
    this.model = emptyBase();
    this.cd.detectChanges();
  }

  drop(event: CdkDragDrop<unknown>): void {
    moveItemInArray(
      this.edit().data.locations ?? [],
      event.previousIndex,
      event.currentIndex,
    );
  }

  updateId(location: CategoryJson, id: string): void {
    const { data } = this.edit();
    for (const item of data.items) {
      if (item.machine?.locations) {
        const idx = item.machine.locations.indexOf(location.id);
        if (idx !== -1) item.machine.locations[idx] = id;
      }
    }

    for (const recipe of data.recipes) {
      if (recipe.locations) {
        const idx = recipe.locations.indexOf(location.id);
        if (idx !== -1) recipe.locations[idx] = id;
      }
    }

    location.id = id;
  }

  remove(id: string): void {
    const { data } = this.edit();
    this.confirm
      .open({
        header: 'Delete location?',
        message:
          'If this location is in use, deleting it will invalidate some entities. Continue?',
        icon: faExclamationTriangle,
        actions: [
          { text: 'yes', value: 1, icon: faCheck },
          { text: 'cancel', value: 0, icon: faXmark },
        ],
      })
      .subscribe((res) => {
        if (res === 1 && data.locations) {
          data.locations = data.locations.filter((c) => c.id !== id);
          this.cd.detectChanges();
        }
      });
  }
}
