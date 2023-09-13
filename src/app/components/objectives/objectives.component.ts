import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Message } from 'primeng/api';
import { combineLatest, first, map, tap } from 'rxjs';

import {
  Dataset,
  DisplayRate,
  displayRateOptions,
  MatrixResult,
  MatrixResultType,
  Objective,
  ObjectiveBase,
  ObjectiveType,
  objectiveTypeOptions,
  ObjectiveUnit,
} from '~/models';
import { ContentService, TrackService } from '~/services';
import { Items, LabState, Objectives, Recipes, Settings } from '~/store';
import { PickerComponent } from '../picker/picker.component';

@Component({
  selector: 'lab-objectives',
  templateUrl: './objectives.component.html',
  styleUrls: ['./objectives.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectivesComponent {
  messages$ = this.store
    .select(Objectives.getMatrixResult)
    .pipe(map((result) => this.getMessages(result)));
  vm$ = combineLatest({
    objectives: this.store.select(Objectives.getObjectives),
    matrixResult: this.store.select(Objectives.getMatrixResult),
    itemsState: this.store.select(Items.getItemsState),
    recipesState: this.store.select(Recipes.getRecipesState),
    displayRate: this.store.select(Settings.getDisplayRate),
    rateUnitOptions: this.store.select(Settings.getRateUnitOptions),
    options: this.store.select(Settings.getOptions),
    data: this.store.select(Settings.getDataset),
    itemIds: this.store.select(Settings.getAvailableItems),
    recipeIds: this.store.select(Settings.getAvailableRecipes),
    isMobile: this.contentSvc.isMobile$,
    messages: this.messages$,
  });

  objectiveTypeOptions = objectiveTypeOptions;
  displayRateOptions = displayRateOptions;

  ObjectiveUnit = ObjectiveUnit;
  ObjectiveType = ObjectiveType;

  constructor(
    public trackSvc: TrackService,
    private store: Store<LabState>,
    private translateSvc: TranslateService,
    private contentSvc: ContentService,
  ) {}

  getMessages(matrixResult: MatrixResult): Message[] {
    if (matrixResult.resultType !== MatrixResultType.Failed) return [];

    let errorKey = 'objectives.error';
    let errorDetailKey = 'objectives.errorDetail';

    if (matrixResult.simplexStatus === 'unbounded') {
      errorKey = 'objectives.errorUnbounded';
      errorDetailKey = 'objectives.errorUnboundedDetail';
    } else if (matrixResult.simplexStatus === 'no_feasible') {
      errorKey = 'objectives.errorInfeasible';
      errorDetailKey = 'objectives.errorInfeasibleDetail';
    }

    return [
      {
        severity: 'error',
        summary: this.translateSvc.instant(errorKey),
        detail: this.translateSvc.instant(errorDetailKey, {
          returnCode: matrixResult.returnCode ?? 'unknown',
          simplexStatus: matrixResult.simplexStatus ?? 'unknown',
        }),
      },
    ];
  }

  changeUnit(
    objective: Objective,
    unit: ObjectiveUnit,
    data: Dataset,
    chooseItemPicker: PickerComponent,
    chooseRecipePicker: PickerComponent,
  ): void {
    if (unit === ObjectiveUnit.Machines) {
      if (objective.unit === ObjectiveUnit.Machines) {
        // Units are unchanged, no action required
      } else {
        const recipeIds = data.itemRecipeIds[objective.targetId];
        if (recipeIds.length === 1) {
          this.setUnit(objective.id, { targetId: recipeIds[0], unit });
        } else {
          chooseRecipePicker.selectId
            .pipe(
              first(),
              tap((targetId) => this.setUnit(objective.id, { targetId, unit })),
            )
            .subscribe();
          chooseRecipePicker.clickOpen(data, 'recipe', recipeIds);
        }
      }
    } else {
      if (objective.unit === ObjectiveUnit.Machines) {
        const itemIds = data.recipeProductIds[objective.targetId];
        if (itemIds.length === 1) {
          this.setUnit(objective.id, { targetId: itemIds[0], unit });
        } else {
          chooseItemPicker.selectId
            .pipe(
              first(),
              tap((targetId) => this.setUnit(objective.id, { targetId, unit })),
            )
            .subscribe();
          chooseItemPicker.clickOpen(data, 'item', itemIds);
        }
      } else {
        // No target conversion required
        this.setUnit(objective.id, { targetId: objective.targetId, unit });
      }
    }
  }

  addItemObjective(targetId: string): void {
    this.addObjective({ targetId, unit: ObjectiveUnit.Items });
  }

  addRecipeObjective(targetId: string): void {
    this.addObjective({ targetId, unit: ObjectiveUnit.Machines });
  }

  /** Action Dispatch Methods */
  removeObjective(id: string): void {
    this.store.dispatch(new Objectives.RemoveAction(id));
  }

  raiseObjective(id: string): void {
    this.store.dispatch(new Objectives.RaiseAction(id));
  }

  lowerObjective(id: string): void {
    this.store.dispatch(new Objectives.LowerAction(id));
  }

  setTarget(id: string, value: string): void {
    this.store.dispatch(new Objectives.SetTargetAction({ id, value }));
  }

  setValue(id: string, value: string): void {
    this.store.dispatch(new Objectives.SetValueAction({ id, value }));
  }

  setUnit(id: string, value: ObjectiveBase): void {
    this.store.dispatch(new Objectives.SetUnitAction({ id, value }));
  }

  setType(id: string, value: ObjectiveType): void {
    this.store.dispatch(new Objectives.SetTypeAction({ id, value }));
  }

  addObjective(value: ObjectiveBase): void {
    this.store.dispatch(new Objectives.AddAction(value));
  }

  setDisplayRate(value: DisplayRate, prev: DisplayRate): void {
    this.store.dispatch(new Settings.SetDisplayRateAction({ value, prev }));
  }
}
