import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Message } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { MessagesModule } from 'primeng/messages';
import { OrderListModule } from 'primeng/orderlist';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { combineLatest, EMPTY, first, map, Observable, switchMap } from 'rxjs';

import { DropdownTranslateDirective } from '~/directives/dropdown-translate.directive';
import { NoDragDirective } from '~/directives/no-drag.directive';
import { AdjustedDataset } from '~/models/dataset';
import { DisplayRate, displayRateOptions } from '~/models/enum/display-rate';
import { MaximizeType } from '~/models/enum/maximize-type';
import {
  ObjectiveType,
  objectiveTypeOptions,
} from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { SimplexResultType } from '~/models/enum/simplex-result-type';
import { MatrixResult } from '~/models/matrix-result';
import { Objective, ObjectiveBase } from '~/models/objective';
import { Rational, rational } from '~/models/rational';
import { SettingsComplete } from '~/models/settings/settings-complete';
import { IconSmClassPipe } from '~/pipes/icon-class.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { ContentService } from '~/services/content.service';
import { TrackService } from '~/services/track.service';
import { TranslateService } from '~/services/translate.service';
import { selectItemsState } from '~/store/items/items.selectors';
import {
  add,
  remove,
  setOrder,
  setTarget,
  setType,
  setUnit,
  setValue,
} from '~/store/objectives/objectives.actions';
import {
  selectMatrixResult,
  selectObjectives,
} from '~/store/objectives/objectives.selectors';
import { setPaused } from '~/store/preferences/preferences.actions';
import {
  selectConvertObjectiveValues,
  selectPaused,
} from '~/store/preferences/preferences.selectors';
import {
  selectAdjustedDataset,
  selectAvailableItems,
} from '~/store/recipes/recipes.selectors';
import { setDisplayRate } from '~/store/settings/settings.actions';
import {
  selectAvailableRecipes,
  selectBeltSpeed,
  selectDisplayRateInfo,
  selectMaximizeType,
  selectObjectiveUnitOptions,
  selectSettings,
} from '~/store/settings/settings.selectors';
import { RateUtility } from '~/utilities/rate.utility';

import { InputNumberComponent } from '../input-number/input-number.component';
import { PickerComponent } from '../picker/picker.component';
import { TooltipComponent } from '../tooltip/tooltip.component';

@Component({
  selector: 'lab-objectives',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    MessagesModule,
    OrderListModule,
    ToggleButtonModule,
    TooltipModule,
    DropdownTranslateDirective,
    NoDragDirective,
    PickerComponent,
    IconSmClassPipe,
    InputNumberComponent,
    TooltipComponent,
    TranslatePipe,
  ],
  templateUrl: './objectives.component.html',
  styleUrls: ['./objectives.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectivesComponent {
  store = inject(Store);
  contentSvc = inject(ContentService);
  trackSvc = inject(TrackService);
  translateSvc = inject(TranslateService);

  _objectives = this.store.selectSignal(selectObjectives);
  result = this.store.selectSignal(selectMatrixResult);
  itemsState = this.store.selectSignal(selectItemsState);
  itemIds = this.store.selectSignal(selectAvailableItems);
  data = this.store.selectSignal(selectAdjustedDataset);
  maximizeType = this.store.selectSignal(selectMaximizeType);
  beltSpeed = this.store.selectSignal(selectBeltSpeed);
  dispRateInfo = this.store.selectSignal(selectDisplayRateInfo);
  rateUnitOptions = this.store.selectSignal(selectObjectiveUnitOptions);
  recipeIds = this.store.selectSignal(selectAvailableRecipes);
  paused = this.store.selectSignal(selectPaused);
  convertObjectiveValues = this.store.selectSignal(
    selectConvertObjectiveValues,
  );
  objectives = computed(() => [...this._objectives()]);
  messages$ = combineLatest({
    objectives: this.store.select(selectObjectives),
    matrixResult: this.store.select(selectMatrixResult),
    settings: this.store.select(selectSettings),
  }).pipe(
    switchMap(({ objectives, matrixResult, settings }) =>
      this.getMessages(objectives, matrixResult, settings),
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
    settings: SettingsComplete,
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
            ? settings.excludedRecipeIds.has(o.targetId)
            : settings.excludedItemIds.has(o.targetId),
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
        const updateFn = (recipeId: string): void => {
          this.convertItemsToMachines(objective, recipeId, data);
        };
        if (recipeIds.length === 1) {
          updateFn(recipeIds[0]);
        } else {
          chooseRecipePicker.selectId.pipe(first()).subscribe((targetId) => {
            updateFn(targetId);
          });
          chooseRecipePicker.clickOpen('recipe', recipeIds);
        }
      }
    } else {
      if (objective.unit === ObjectiveUnit.Machines) {
        const itemIds = Array.from(
          data.adjustedRecipe[objective.targetId].produces,
        );
        const updateFn = (itemId: string): void => {
          this.convertMachinesToItems(objective, itemId, unit, data);
        };

        if (itemIds.length === 1) {
          updateFn(itemIds[0]);
        } else {
          chooseItemPicker.selectId.pipe(first()).subscribe((itemId) => {
            updateFn(itemId);
          });
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
    this.store.dispatch(remove({ id }));
  }

  setOrder(ids: string[]): void {
    this.store.dispatch(setOrder({ ids }));
  }

  setTarget(id: string, value: string): void {
    this.store.dispatch(setTarget({ id, value }));
  }

  setValue(id: string, value: Rational): void {
    this.store.dispatch(setValue({ id, value }));
  }

  setUnit(id: string, objective: ObjectiveBase): void {
    this.store.dispatch(setUnit({ id, objective }));
  }

  setType(id: string, value: ObjectiveType): void {
    this.store.dispatch(setType({ id, value }));
  }

  addObjective(objective: ObjectiveBase): void {
    this.store.dispatch(add({ objective }));
  }

  setDisplayRate(displayRate: DisplayRate, previous: DisplayRate): void {
    this.store.dispatch(setDisplayRate({ displayRate, previous }));
  }

  setPaused(paused: boolean): void {
    this.store.dispatch(setPaused({ paused }));
  }
}
