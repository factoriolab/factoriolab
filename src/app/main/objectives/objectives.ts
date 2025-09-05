import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  faBookOpen,
  faBoxOpen,
  faGrip,
  faPause,
  faPlay,
  faPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { InputNumber } from '~/components/input-number/input-number';
import { ObjectiveForm } from '~/components/objective-form';
import { Select } from '~/components/select/select';
import { Tooltip } from '~/components/tooltip/tooltip';
import { ObjectiveBase, ObjectiveSettings } from '~/state/objectives/objective';
import { objectiveTypeOptions } from '~/state/objectives/objective-type';
import { ObjectiveUnit } from '~/state/objectives/objective-unit';
import { ObjectivesStore } from '~/state/objectives/objectives-store';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { displayRateOptions } from '~/state/settings/display-rate';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Conversion } from './conversion';
import { Message } from './message';

@Component({
  selector: 'lab-objectives',
  imports: [
    FormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    Button,
    InputNumber,
    Select,
    TranslatePipe,
    Tooltip,
    Message,
  ],
  templateUrl: './objectives.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-col p-1 sm:p-3 lg:p-6 border-b border-gray-700 gap-1.5 lg:gap-3',
  },
})
export class Objectives extends ObjectiveForm {
  protected readonly conversion = inject(Conversion);
  protected readonly objectivesStore = inject(ObjectivesStore);
  protected readonly preferencesStore = inject(PreferencesStore);
  protected readonly settingsStore = inject(SettingsStore);

  protected readonly data = this.settingsStore.dataset;
  protected readonly objectives = this.objectivesStore.objectives;
  protected readonly result = this.objectivesStore.matrixResult;
  protected readonly unitOptions = this.settingsStore.objectiveUnitOptions;

  protected readonly ObjectiveUnit = ObjectiveUnit;
  protected readonly displayRateOptions = displayRateOptions;
  protected readonly typeOptions = objectiveTypeOptions;

  protected readonly faBoxOpen = faBoxOpen;
  protected readonly faBookOpen = faBookOpen;
  protected readonly faGrip = faGrip;
  protected readonly faPause = faPause;
  protected readonly faPlay = faPlay;
  protected readonly faPlus = faPlus;
  protected readonly faXmark = faXmark;

  addObjective(value: ObjectiveBase): void {
    this.objectivesStore.add(value);
  }

  drop(event: CdkDragDrop<string[]>): void {
    const objectives = [...this.objectives()];
    moveItemInArray(objectives, event.previousIndex, event.currentIndex);
    this.objectivesStore.setOrder(objectives);
  }

  changeTarget(objective: ObjectiveSettings): void {
    const targetId$ =
      objective.unit === ObjectiveUnit.Machines
        ? this.picker.pickRecipe()
        : this.picker.pickItem();
    targetId$.subscribe((targetId) => {
      this.objectivesStore.updateRecord(objective.id, { targetId });
    });
  }
}
