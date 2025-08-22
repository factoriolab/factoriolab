import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Button } from '~/components/button/button';
import { ObjectivesStore } from '~/state/objectives/objectives-store';

@Component({
  selector: 'lab-objectives',
  imports: [CdkDropList, CdkDrag, Button],
  templateUrl: './objectives.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex p-2 sm:p-3 lg:p-6' },
})
export class Objectives {
  private readonly objectivesStore = inject(ObjectivesStore);

  objectives = this.objectivesStore.objectives;

  drop(event: CdkDragDrop<string[]>): void {
    console.log(event);
    // moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }
}
