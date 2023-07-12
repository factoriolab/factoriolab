import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Message } from 'primeng/api';
import { combineLatest, first, map, tap } from 'rxjs';

import {
  Breakpoint,
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
  vm$ = combineLatest([
    this.store.select(Objectives.getObjectives),
    this.store.select(Objectives.getMatrixResult),
    this.store.select(Items.getItemsState),
    this.store.select(Recipes.getRecipesState),
    this.store.select(Settings.getDisplayRate),
    this.store.select(Settings.getRateUnitOptions),
    this.store.select(Settings.getOptions),
    this.store.select(Settings.getDataset),
    this.store.select(Settings.getAvailableItems),
    this.store.select(Settings.getAvailableRecipes),
    this.contentSvc.width$,
  ]).pipe(
    map(
      ([
        objectives,
        matrixResult,
        itemsState,
        recipesState,
        displayRate,
        rateUnitOptions,
        options,
        data,
        itemIds,
        recipeIds,
        width,
      ]) => ({
        objectives,
        matrixResult,
        itemsState,
        recipesState,
        displayRate,
        rateUnitOptions,
        options,
        data,
        itemIds,
        recipeIds,
        mobile: width < Breakpoint.Small,
        messages: this.getMessages(matrixResult),
      })
    )
  );

  @ViewChild('chooseItemPicker') chooseItemPicker: PickerComponent | undefined;
  @ViewChild('chooseRecipePicker') chooseRecipePicker:
    | PickerComponent
    | undefined;

  objectiveTypeOptions = objectiveTypeOptions;
  displayRateOptions = displayRateOptions;

  ObjectiveUnit = ObjectiveUnit;
  ObjectiveType = ObjectiveType;

  constructor(
    public trackSvc: TrackService,
    private store: Store<LabState>,
    private translateSvc: TranslateService,
    private contentSvc: ContentService
  ) {}

  getMessages(matrixResult: MatrixResult): Message[] {
    if (matrixResult.resultType === MatrixResultType.Failed) {
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
    } else {
      return [];
    }
  }

  changeUnit(objective: Objective, unit: ObjectiveUnit, data: Dataset): void {
    if (unit === ObjectiveUnit.Machines) {
      if (objective.unit === ObjectiveUnit.Machines) {
        // Units are unchanged, no action required
      } else {
        const recipeIds = data.itemRecipeIds[objective.targetId];
        if (recipeIds.length === 1) {
          this.setUnit(objective.id, { targetId: recipeIds[0], unit });
        } else if (this.chooseRecipePicker != null) {
          this.chooseRecipePicker.selectId
            .pipe(
              first(),
              tap((targetId) => this.setUnit(objective.id, { targetId, unit }))
            )
            .subscribe();
          this.chooseRecipePicker.clickOpen(data, 'recipe', recipeIds);
        } else {
          throw new Error('Recipe picker was not found');
        }
      }
    } else {
      if (objective.unit === ObjectiveUnit.Machines) {
        const itemIds = data.recipeProductIds[objective.targetId];
        if (itemIds.length === 1) {
          this.setUnit(objective.id, { targetId: itemIds[0], unit });
        } else if (this.chooseItemPicker != null) {
          this.chooseItemPicker.selectId
            .pipe(
              first(),
              tap((targetId) => this.setUnit(objective.id, { targetId, unit }))
            )
            .subscribe();
          this.chooseItemPicker.clickOpen(data, 'item', itemIds);
        } else {
          throw new Error('Item picker was not found');
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
