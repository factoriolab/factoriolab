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
import {
  Items,
  LabState,
  Objectives,
  Preferences,
  Recipes,
  Settings,
} from '~/store';
import { PickerComponent } from '../picker/picker.component';

@Component({
  selector: 'lab-objectives',
  templateUrl: './objectives.component.html',
  styleUrls: ['./objectives.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectivesComponent {
  messages$ = combineLatest([
    this.store.select(Objectives.getObjectives),
    this.store.select(Objectives.getMatrixResult),
    this.store.select(Items.getItemsState),
    this.store.select(Recipes.getRecipesState),
  ]).pipe(
    map(([objectives, result, itemsState, recipesState]) =>
      this.getMessages(objectives, result, itemsState, recipesState),
    ),
  );
  vm$ = combineLatest({
    objectives: this.store
      .select(Objectives.getObjectives)
      .pipe(map((o) => [...o])),
    matrixResult: this.store.select(Objectives.getMatrixResult),
    itemsState: this.store.select(Items.getItemsState),
    recipesState: this.store.select(Recipes.getRecipesState),
    itemIds: this.store.select(Recipes.getAvailableItems),
    data: this.store.select(Recipes.getAdjustedDataset),
    displayRate: this.store.select(Settings.getDisplayRate),
    rateUnitOptions: this.store.select(Settings.getRateUnitOptions),
    options: this.store.select(Settings.getOptions),
    recipeIds: this.store.select(Settings.getAvailableRecipes),
    paused: this.store.select(Preferences.getPaused),
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

  getMessages(
    objectives: Objective[],
    matrixResult: MatrixResult,
    itemsState: Items.ItemsState,
    recipesState: Recipes.RecipesState,
  ): Message[] {
    if (matrixResult.resultType !== MatrixResultType.Failed) return [];

    if (matrixResult.simplexStatus === 'unbounded') {
      const maxObjectives = objectives.filter(
        (o) => o.type === ObjectiveType.Maximize,
      );

      if (
        maxObjectives.length &&
        objectives.every((o) => o.type !== ObjectiveType.Limit)
      ) {
        // Found maximize objectives but no limits
        return this.buildErrorMessages(
          'objectives.errorUnbounded',
          'objectives.errorNoLimits',
          matrixResult,
        );
      }

      if (
        maxObjectives.some((o) =>
          o.unit === ObjectiveUnit.Machines
            ? recipesState[o.targetId].excluded
            : itemsState[o.targetId].excluded,
        )
      ) {
        // Found an excluded maximize objective
        return this.buildErrorMessages(
          'objectives.errorUnbounded',
          'objectives.errorMaximizeExcluded',
          matrixResult,
        );
      }

      return this.buildErrorMessages(
        'objectives.errorUnbounded',
        'objectives.errorUnboundedDetail',
        matrixResult,
      );
    } else if (matrixResult.simplexStatus === 'no_feasible') {
      return this.buildErrorMessages(
        'objectives.errorInfeasible',
        'objectives.errorInfeasibleDetail',
        matrixResult,
      );
    } else {
      return this.buildErrorMessages(
        'objectives.error',
        'objectives.errorDetail',
        matrixResult,
      );
    }
  }

  buildErrorMessages(
    summary: string,
    detail: string,
    matrixResult: MatrixResult,
  ): Message[] {
    return [
      {
        severity: 'error',
        summary: this.translateSvc.instant(summary),
        detail: `${this.translateSvc.instant(
          detail,
        )} ${this.translateSvc.instant('objectives.errorSimplexInfo', {
          returnCode: matrixResult.returnCode ?? 'unknown',
          simplexStatus: matrixResult.simplexStatus ?? 'unknown',
        })}`,
      },
    ];
  }

  setObjectiveOrder(objectives: Objective[]): void {
    this.setOrder(objectives.map((o) => o.id));
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
          this.setUnit(objective.id, {
            targetId: recipeIds[0],
            unit,
          });
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
        const itemIds = Array.from(data.recipeR[objective.targetId].produces);
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

  setOrder(ids: string[]): void {
    this.store.dispatch(new Objectives.SetOrderAction(ids));
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

  setPaused(value: boolean): void {
    this.store.dispatch(new Preferences.SetPausedAction(value));
  }
}
