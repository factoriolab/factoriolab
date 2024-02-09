import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Message } from 'primeng/api';
import { first } from 'rxjs';

import { PickerComponent } from '~/components/picker/picker.component';
import {
  Dataset,
  DisplayRate,
  DisplayRateInfo,
  displayRateOptions,
  Entities,
  MatrixResult,
  Objective,
  ObjectiveBase,
  ObjectiveRational,
  ObjectiveType,
  objectiveTypeOptions,
  ObjectiveUnit,
  Rational,
  SimplexResultType,
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
import { RateUtility } from '~/utilities';

@Component({
  selector: 'lab-objectives',
  templateUrl: './objectives.component.html',
  styleUrls: ['./objectives.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectivesComponent {
  store = inject(Store<LabState>);
  translateSvc = inject(TranslateService);
  contentSvc = inject(ContentService);
  trackSvc = inject(TrackService);

  messages = computed(() => {
    const objectives = this.store.selectSignal(Objectives.getObjectives);
    const result = this.store.selectSignal(Objectives.getMatrixResult);
    const itemsState = this.store.selectSignal(Items.getItemsState);
    const recipesState = this.store.selectSignal(Recipes.getRecipesState);
    return this.getMessages(
      objectives(),
      result(),
      itemsState(),
      recipesState(),
    );
  });
  objectives = computed(() => {
    const objectives = this.store.selectSignal(Objectives.getObjectives);
    return [...objectives()];
  });
  objectiveRationals = this.store.selectSignal(
    Objectives.getObjectiveRationals,
  );
  itemsState = this.store.selectSignal(Items.getItemsState);
  itemIds = this.store.selectSignal(Recipes.getAvailableItems);
  data = this.store.selectSignal(Recipes.getAdjustedDataset);
  beltSpeed = this.store.selectSignal(Settings.getBeltSpeed);
  dispRateInfo = this.store.selectSignal(Settings.getDisplayRateInfo);
  rateUnitOptions = this.store.selectSignal(Settings.getRateUnitOptions);
  recipeIds = this.store.selectSignal(Settings.getAvailableRecipes);
  paused = this.store.selectSignal(Preferences.getPaused);

  objectiveTypeOptions = objectiveTypeOptions;
  displayRateOptions = displayRateOptions;

  ObjectiveUnit = ObjectiveUnit;
  ObjectiveType = ObjectiveType;

  getMessages(
    objectives: Objective[],
    matrixResult: MatrixResult,
    itemsState: Items.ItemsState,
    recipesState: Recipes.RecipesState,
  ): Message[] {
    if (matrixResult.resultType === SimplexResultType.Paused)
      return [
        {
          severity: 'info',
          detail: this.translateSvc.instant('objectives.pausedMessage'),
        },
      ];

    if (matrixResult.resultType !== SimplexResultType.Failed) return [];

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
    objectiveRationals: ObjectiveRational[],
    itemsState: Items.ItemsState,
    beltSpeed: Entities<Rational>,
    displayRateInfo: DisplayRateInfo,
    data: Dataset,
    chooseItemPicker: PickerComponent,
    chooseRecipePicker: PickerComponent,
  ): void {
    const objectiveRational = objectiveRationals.find(
      (o) => o.id === objective.id,
    );
    if (objectiveRational == null) return;

    if (unit === ObjectiveUnit.Machines) {
      if (objective.unit !== ObjectiveUnit.Machines) {
        const recipeIds = data.itemRecipeIds[objective.targetId];
        const updateFn = (recipeId: string): void =>
          this.convertItemsToMachines(
            objectiveRational,
            recipeId,
            itemsState,
            beltSpeed,
            displayRateInfo,
            data,
          );
        if (recipeIds.length === 1) {
          updateFn(recipeIds[0]);
        } else {
          chooseRecipePicker.selectId
            .pipe(first())
            .subscribe((targetId) => updateFn(targetId));
          chooseRecipePicker.clickOpen(data, 'recipe', recipeIds);
        }
      }
    } else {
      if (objective.unit === ObjectiveUnit.Machines) {
        const itemIds = Array.from(data.recipeR[objective.targetId].produces);
        const updateFn = (itemId: string): void =>
          this.convertMachinesToItems(
            objectiveRational,
            itemId,
            unit,
            itemsState,
            beltSpeed,
            displayRateInfo,
            data,
          );

        if (itemIds.length === 1) {
          updateFn(itemIds[0]);
        } else {
          chooseItemPicker.selectId
            .pipe(first())
            .subscribe((itemId) => updateFn(itemId));
          chooseItemPicker.clickOpen(data, 'item', itemIds);
        }
      } else {
        // No target conversion required
        this.convertItemsToItems(
          objectiveRational,
          objective.targetId,
          unit,
          itemsState,
          beltSpeed,
          displayRateInfo,
          data,
        );
      }
    }
  }

  /**
   * Update unit field (non-machines -> machines), then convert and update
   * objective value so that number of items remains constant
   */
  convertItemsToMachines(
    objective: ObjectiveRational,
    recipeId: string,
    itemsState: Items.ItemsState,
    beltSpeed: Entities<Rational>,
    displayRateInfo: DisplayRateInfo,
    data: Dataset,
  ): void {
    this.setUnit(objective.id, {
      targetId: recipeId,
      unit: ObjectiveUnit.Machines,
    });

    if (objective.type === ObjectiveType.Maximize) return;

    const oldValue = RateUtility.objectiveNormalizedRate(
      objective,
      itemsState,
      beltSpeed,
      displayRateInfo,
      data,
    );
    const recipe = data.recipeR[recipeId];
    const newValue = oldValue.div(recipe.output[objective.targetId]);
    this.setValue(objective.id, newValue.toString());
  }

  /**
   * Update unit field (machines -> non-machines), then convert and update
   * objective value so that number of items remains constant
   */
  convertMachinesToItems(
    objective: ObjectiveRational,
    itemId: string,
    unit: ObjectiveUnit,
    itemsState: Items.ItemsState,
    beltSpeed: Entities<Rational>,
    displayRateInfo: DisplayRateInfo,
    data: Dataset,
  ): void {
    this.setUnit(objective.id, {
      targetId: itemId,
      unit,
    });

    if (objective.type === ObjectiveType.Maximize || objective.recipe == null)
      return;

    const factor = RateUtility.objectiveNormalizedRate(
      new ObjectiveRational({
        id: '',
        targetId: itemId,
        value: '1',
        unit,
        type: ObjectiveType.Output,
      }),
      itemsState,
      beltSpeed,
      displayRateInfo,
      data,
    );
    const oldValue = objective.value.mul(objective.recipe.output[itemId]);
    const newValue = oldValue.div(factor);
    this.setValue(objective.id, newValue.toString());
  }

  /**
   * Update unit field (non-machines -> non-machines), then convert and update
   * objective value so that number of items remains constant
   */
  convertItemsToItems(
    objective: ObjectiveRational,
    itemId: string,
    unit: ObjectiveUnit,
    itemsState: Items.ItemsState,
    beltSpeed: Entities<Rational>,
    displayRateInfo: DisplayRateInfo,
    data: Dataset,
  ): void {
    this.setUnit(objective.id, {
      targetId: itemId,
      unit,
    });

    if (objective.type === ObjectiveType.Maximize) return;

    const oldValue = RateUtility.objectiveNormalizedRate(
      objective,
      itemsState,
      beltSpeed,
      displayRateInfo,
      data,
    );
    const factor = RateUtility.objectiveNormalizedRate(
      new ObjectiveRational({
        id: '',
        targetId: itemId,
        value: '1',
        unit,
        type: ObjectiveType.Output,
      }),
      itemsState,
      beltSpeed,
      displayRateInfo,
      data,
    );
    const newValue = oldValue.div(factor);
    this.setValue(objective.id, newValue.toString());
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
