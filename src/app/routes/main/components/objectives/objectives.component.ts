import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Message } from 'primeng/api';
import { combineLatest, EMPTY, first, map, Observable, switchMap } from 'rxjs';

import { PickerComponent } from '~/components/picker/picker.component';
import {
  AdjustedDataset,
  DisplayRate,
  displayRateOptions,
  MatrixResult,
  MaximizeType,
  Objective,
  ObjectiveBase,
  ObjectiveType,
  objectiveTypeOptions,
  ObjectiveUnit,
  rational,
  Rational,
  SimplexResultType,
} from '~/models';
import { ContentService, TrackService, TranslateService } from '~/services';
import { Items, Objectives, Preferences, Recipes, Settings } from '~/store';
import { RateUtility } from '~/utilities';

@Component({
  selector: 'lab-objectives',
  templateUrl: './objectives.component.html',
  styleUrls: ['./objectives.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectivesComponent {
  store = inject(Store);
  translateSvc = inject(TranslateService);
  contentSvc = inject(ContentService);
  trackSvc = inject(TrackService);

  _objectives = this.store.selectSignal(Objectives.selectObjectives);
  result = this.store.selectSignal(Objectives.selectMatrixResult);
  itemsState = this.store.selectSignal(Items.selectItemsState);
  itemIds = this.store.selectSignal(Recipes.selectAvailableItems);
  data = this.store.selectSignal(Recipes.selectAdjustedDataset);
  maximizeType = this.store.selectSignal(Settings.selectMaximizeType);
  beltSpeed = this.store.selectSignal(Settings.selectBeltSpeed);
  dispRateInfo = this.store.selectSignal(Settings.selectDisplayRateInfo);
  rateUnitOptions = this.store.selectSignal(
    Settings.selectObjectiveUnitOptions,
  );
  recipeIds = this.store.selectSignal(Settings.selectAvailableRecipes);
  paused = this.store.selectSignal(Preferences.selectPaused);
  convertObjectiveValues = this.store.selectSignal(
    Preferences.selectConvertObjectiveValues,
  );
  objectives = computed(() => [...this._objectives()]);
  messages$ = combineLatest({
    objectives: this.store.select(Objectives.selectObjectives),
    matrixResult: this.store.select(Objectives.selectMatrixResult),
    itemsState: this.store.select(Items.selectItemsState),
    recipesState: this.store.select(Recipes.selectRecipesState),
  }).pipe(
    switchMap(({ objectives, matrixResult, itemsState, recipesState }) =>
      this.getMessages(objectives, matrixResult, itemsState, recipesState),
    ),
  );

  objectiveTypeOptions = objectiveTypeOptions;
  displayRateOptions = displayRateOptions;

  MaximizeType = MaximizeType;
  ObjectiveUnit = ObjectiveUnit;
  ObjectiveType = ObjectiveType;

  getMessages(
    objectives: Objective[],
    matrixResult: MatrixResult,
    itemsState: Items.ItemsState,
    recipesState: Recipes.RecipesState,
  ): Observable<Message[]> {
    if (matrixResult.resultType === SimplexResultType.Paused) {
      return this.translateSvc
        .get('objectives.pausedMessage')
        .pipe(map((detail): Message[] => [{ severity: 'info', detail }]));
    }

    if (matrixResult.resultType !== SimplexResultType.Failed) return EMPTY;

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
  ): Observable<Message[]> {
    return combineLatest([
      this.translateSvc.get(summary),
      this.translateSvc.get(detail),
      this.translateSvc.get('objectives.errorSimplexInfo', {
        returnCode: matrixResult.returnCode ?? 'unknown',
        simplexStatus: matrixResult.simplexStatus ?? 'unknown',
      }),
    ]).pipe(
      map(([summary, detail, detailInfo]): Message[] => [
        {
          severity: 'error',
          summary,
          detail: `${detail} ${detailInfo}`,
        },
      ]),
    );
  }

  setObjectiveOrder(objectives: Objective[]): void {
    this.setOrder(objectives.map((o) => o.id));
  }

  changeUnit(
    objective: Objective,
    unit: ObjectiveUnit,
    chooseItemPicker: PickerComponent,
    chooseRecipePicker: PickerComponent,
  ): void {
    const data = this.data();
    if (unit === ObjectiveUnit.Machines) {
      if (objective.unit !== ObjectiveUnit.Machines) {
        const recipeIds = data.itemRecipeIds[objective.targetId];
        const updateFn = (recipeId: string): void =>
          this.convertItemsToMachines(objective, recipeId, data);
        if (recipeIds.length === 1) {
          updateFn(recipeIds[0]);
        } else {
          chooseRecipePicker.selectId
            .pipe(first())
            .subscribe((targetId) => updateFn(targetId));
          chooseRecipePicker.clickOpen('recipe', recipeIds);
        }
      }
    } else {
      if (objective.unit === ObjectiveUnit.Machines) {
        const itemIds = Array.from(
          data.adjustedRecipe[objective.targetId].produces,
        );
        const updateFn = (itemId: string): void =>
          this.convertMachinesToItems(objective, itemId, unit, data);

        if (itemIds.length === 1) {
          updateFn(itemIds[0]);
        } else {
          chooseItemPicker.selectId
            .pipe(first())
            .subscribe((itemId) => updateFn(itemId));
          chooseItemPicker.clickOpen('item', itemIds);
        }
      } else {
        // No target conversion required
        this.convertItemsToItems(objective, objective.targetId, unit, data);
      }
    }
  }

  /**
   * Update unit field (non-machines -> machines), then convert and update
   * objective value so that number of items remains constant
   */
  convertItemsToMachines(
    objective: Objective,
    recipeId: string,
    data: AdjustedDataset,
  ): void {
    this.setUnit(objective.id, {
      targetId: recipeId,
      unit: ObjectiveUnit.Machines,
    });

    if (
      !this.convertObjectiveValues() ||
      objective.type === ObjectiveType.Maximize
    )
      return;

    const itemsState = this.itemsState();
    const beltSpeed = this.beltSpeed();
    const dispRateInfo = this.dispRateInfo();
    const oldValue = RateUtility.objectiveNormalizedRate(
      objective,
      itemsState,
      beltSpeed,
      dispRateInfo,
      data,
    );
    const recipe = data.adjustedRecipe[recipeId];
    const newValue = oldValue.div(recipe.output[objective.targetId]);
    this.setValue(objective.id, newValue);
  }

  /**
   * Update unit field (machines -> non-machines), then convert and update
   * objective value so that number of items remains constant
   */
  convertMachinesToItems(
    objective: Objective,
    itemId: string,
    unit: ObjectiveUnit,
    data: AdjustedDataset,
  ): void {
    this.setUnit(objective.id, {
      targetId: itemId,
      unit,
    });

    if (
      !this.convertObjectiveValues() ||
      objective.type === ObjectiveType.Maximize ||
      objective.recipe == null
    )
      return;

    const itemsState = this.itemsState();
    const beltSpeed = this.beltSpeed();
    const dispRateInfo = this.dispRateInfo();
    const factor = RateUtility.objectiveNormalizedRate(
      {
        id: '',
        targetId: itemId,
        value: rational.one,
        unit,
        type: ObjectiveType.Output,
      },
      itemsState,
      beltSpeed,
      dispRateInfo,
      data,
    );
    const oldValue = objective.value.mul(objective.recipe.output[itemId]);
    const newValue = oldValue.div(factor);
    this.setValue(objective.id, newValue);
  }

  /**
   * Update unit field (non-machines -> non-machines), then convert and update
   * objective value so that number of items remains constant
   */
  convertItemsToItems(
    objective: Objective,
    itemId: string,
    unit: ObjectiveUnit,
    data: AdjustedDataset,
  ): void {
    this.setUnit(objective.id, {
      targetId: itemId,
      unit,
    });

    if (
      !this.convertObjectiveValues() ||
      objective.type === ObjectiveType.Maximize
    )
      return;

    const itemsState = this.itemsState();
    const beltSpeed = this.beltSpeed();
    const dispRateInfo = this.dispRateInfo();
    const oldValue = RateUtility.objectiveNormalizedRate(
      objective,
      itemsState,
      beltSpeed,
      dispRateInfo,
      data,
    );
    const factor = RateUtility.objectiveNormalizedRate(
      {
        id: '',
        targetId: itemId,
        value: rational.one,
        unit,
        type: ObjectiveType.Output,
      },
      itemsState,
      beltSpeed,
      dispRateInfo,
      data,
    );
    const newValue = oldValue.div(factor);
    this.setValue(objective.id, newValue);
  }

  addItemObjective(targetId: string): void {
    this.addObjective({ targetId, unit: ObjectiveUnit.Items });
  }

  addRecipeObjective(targetId: string): void {
    this.addObjective({ targetId, unit: ObjectiveUnit.Machines });
  }

  addRecipeLimit(targetId: string): void {
    this.addObjective({
      targetId,
      unit: ObjectiveUnit.Machines,
      type: ObjectiveType.Limit,
    });
  }

  /** Action Dispatch Methods */
  removeObjective(id: string): void {
    this.store.dispatch(Objectives.remove({ id }));
  }

  setOrder(ids: string[]): void {
    this.store.dispatch(Objectives.setOrder({ ids }));
  }

  setTarget(id: string, value: string): void {
    this.store.dispatch(Objectives.setTarget({ id, value }));
  }

  setValue(id: string, value: Rational): void {
    this.store.dispatch(Objectives.setValue({ id, value }));
  }

  setUnit(id: string, objective: ObjectiveBase): void {
    this.store.dispatch(Objectives.setUnit({ id, objective }));
  }

  setType(id: string, value: ObjectiveType): void {
    this.store.dispatch(Objectives.setType({ id, value }));
  }

  addObjective(objective: ObjectiveBase): void {
    this.store.dispatch(Objectives.add({ objective }));
  }

  setDisplayRate(displayRate: DisplayRate, previous: DisplayRate): void {
    this.store.dispatch(Settings.setDisplayRate({ displayRate, previous }));
  }

  setPaused(paused: boolean): void {
    this.store.dispatch(Preferences.setPaused({ paused }));
  }
}
