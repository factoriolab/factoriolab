import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem, Message } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { MessagesModule } from 'primeng/messages';
import { OrderListModule } from 'primeng/orderlist';
import { MenuModule } from 'primeng/menu';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { combineLatest, EMPTY, first, map, Observable } from 'rxjs';

import { DropdownTranslateDirective } from '~/directives/dropdown-translate.directive';
import { NoDragDirective } from '~/directives/no-drag.directive';
import { AdjustedDataset } from '~/models/dataset';
import { displayRateOptions } from '~/models/enum/display-rate';
import { MaximizeType } from '~/models/enum/maximize-type';
import {
  ObjectiveType,
  objectiveTypeOptions,
} from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { SimplexResultType } from '~/models/enum/simplex-result-type';
import { MatrixResult } from '~/models/matrix-result';
import {
  GlobalObjectiveKind,
  globalObjectiveKind,
  globalTargetId,
  isGlobalObjective,
  isRecipeObjective,
  ObjectiveBase,
  ObjectiveState,
} from '~/models/objective';
import { rational } from '~/models/rational';
import { Settings } from '~/models/settings/settings';
import { IconSmClassPipe } from '~/pipes/icon-class.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { ContentService } from '~/services/content.service';
import { RateService } from '~/services/rate.service';
import { TrackService } from '~/services/track.service';
import { TranslateService } from '~/services/translate.service';
import { ItemsService } from '~/store/items.service';
import { ObjectivesService } from '~/store/objectives.service';
import { PreferencesService } from '~/store/preferences.service';
import { RecipesService } from '~/store/recipes.service';
import { SettingsService } from '~/store/settings.service';

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
    MenuModule,
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
  contentSvc = inject(ContentService);
  itemsSvc = inject(ItemsService);
  objectivesSvc = inject(ObjectivesService);
  preferencesSvc = inject(PreferencesService);
  rateSvc = inject(RateService);
  recipesSvc = inject(RecipesService);
  settingsSvc = inject(SettingsService);
  trackSvc = inject(TrackService);
  translateSvc = inject(TranslateService);

  result = this.objectivesSvc.matrixResult;
  itemsState = this.itemsSvc.settings;
  beltSpeed = this.settingsSvc.beltSpeed;
  dispRateInfo = this.settingsSvc.displayRateInfo;
  maximizeType = this.settingsSvc.maximizeType;
  unitOptions = this.settingsSvc.objectiveUnitOptions;
  data = this.recipesSvc.adjustedDataset;
  settings = this.settingsSvc.settings;
  convertObjectiveValues = this.preferencesSvc.convertObjectiveValues;
  paused = this.preferencesSvc.paused;
  objectives = computed(() => [...this.objectivesSvc.objectives()]);

  messages = computed(() => {
    const objectives = this.objectivesSvc.objectives();
    const matrixResult = this.objectivesSvc.matrixResult();
    const settings = this.settingsSvc.settings();

    return this.getMessages(objectives, matrixResult, settings);
  });

  objectiveTypeOptions = objectiveTypeOptions;
  displayRateOptions = displayRateOptions;

  MaximizeType = MaximizeType;
  ObjectiveUnit = ObjectiveUnit;
  ObjectiveType = ObjectiveType;

  getMessages(
    objectives: ObjectiveState[],
    matrixResult: MatrixResult,
    settings: Settings,
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
          isRecipeObjective(o)
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

  isGlobal(obj: ObjectiveBase): boolean {
    return isGlobalObjective(obj);
  }

  globalKind(obj: ObjectiveBase): GlobalObjectiveKind | undefined {
    return globalObjectiveKind(obj);
  }

  globalUnit(obj: ObjectiveBase): string {
    switch (globalObjectiveKind(obj)) {
      case 'power':
        return 'kW';
      case 'pollution':
        return '/m';
      default:
        return '';
    }
  }

  globalKindIcon(obj: ObjectiveBase): string {
    switch (globalObjectiveKind(obj)) {
      case 'power':
        return 'fa-solid fa-bolt';
      case 'pollution':
        return 'fa-solid fa-smog';
      default:
        return 'fa-solid fa-globe';
    }
  }

  globalKindLabel(obj: ObjectiveBase): string {
    switch (globalObjectiveKind(obj)) {
      case 'power':
        return 'objectives.power';
      case 'pollution':
        return 'objectives.pollution';
      default:
        return '';
    }
  }

  editGlobalKindItems(objective: ObjectiveState): MenuItem[] {
    return [
      {
        label: 'Power',
        icon: 'fa-solid fa-bolt',
        command: () => this.changeGlobalKind(objective, 'power'),
      },
      {
        label: 'Pollution',
        icon: 'fa-solid fa-smog',
        command: () => this.changeGlobalKind(objective, 'pollution'),
      },
    ];
  }

  addGlobalMenuItems = computed((): MenuItem[] => {
    const flags = this.data().flags;
    const items: MenuItem[] = [];
    if (flags.has('power'))
      items.push({
        label: 'Power',
        icon: 'fa-solid fa-bolt',
        command: () => this.addGlobal('power'),
      });
    if (flags.has('pollution'))
      items.push({
        label: 'Pollution',
        icon: 'fa-solid fa-smog',
        command: () => this.addGlobal('pollution'),
      });
    return items;
  });

  changeGlobalKind(
    objective: ObjectiveState,
    kind: GlobalObjectiveKind,
  ): void {
    this.objectivesSvc.updateEntity(objective.id, {
      targetId: globalTargetId(kind),
    });
  }

  addGlobal(kind: GlobalObjectiveKind): void {
    this.objectivesSvc.add({
      targetId: globalTargetId(kind),
      unit: ObjectiveUnit.Power,
    });
  }

  changeUnit(
    objective: ObjectiveState,
    unit: ObjectiveUnit,
    chooseItemPicker: PickerComponent,
    chooseRecipePicker: PickerComponent,
  ): void {
    const data = this.data();
    const isRecipeUnit =
      unit === ObjectiveUnit.Machines || unit === ObjectiveUnit.Power;
    const wasRecipeUnit =
      objective.unit === ObjectiveUnit.Machines ||
      (objective.unit === ObjectiveUnit.Power && !isGlobalObjective(objective));

    if (isRecipeUnit) {
      if (wasRecipeUnit) {
        // Recipe -> recipe: same target, just change unit
        this.objectivesSvc.updateEntity(objective.id, { unit });
      } else {
        // Item -> recipe: need to pick a recipe
        const recipeIds = objective.targetId
          ? data.itemRecipeIds[objective.targetId]
          : Array.from(this.settings().availableRecipeIds);
        const updateFn = (recipeId: string): void => {
          this.convertItemsToMachines(objective, recipeId, data);
          // If switching to Power, update unit after conversion
          if (unit === ObjectiveUnit.Power) {
            this.objectivesSvc.updateEntity(objective.id, { unit });
          }
        };
        if (recipeIds.length === 1) {
          updateFn(recipeIds[0]);
        } else {
          chooseRecipePicker.selectId.pipe(first()).subscribe((rid) => {
            updateFn(rid);
          });
          chooseRecipePicker.clickOpen('recipe', recipeIds);
        }
      }
    } else {
      if (wasRecipeUnit && data.adjustedRecipe[objective.targetId]) {
        // Recipe -> item: need to pick an item
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
      } else if (!wasRecipeUnit && !isGlobalObjective(objective)) {
        // Item -> item: no target conversion required
        this.convertItemsToItems(objective, objective.targetId, unit, data);
      } else {
        // Global power -> item: need to pick an item
        chooseItemPicker.selectId.pipe(first()).subscribe((itemId) => {
          this.objectivesSvc.updateEntity(objective.id, {
            targetId: itemId,
            unit,
          });
        });
        chooseItemPicker.clickOpen('item', this.settings().availableItemIds);
      }
    }
  }

  /**
   * Update unit field (non-machines -> machines), then convert and update
   * objective value so that number of items remains constant
   */
  convertItemsToMachines(
    objective: ObjectiveState,
    recipeId: string,
    data: AdjustedDataset,
  ): void {
    this.objectivesSvc.updateEntity(objective.id, {
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
    const oldValue = this.rateSvc.objectiveNormalizedRate(
      objective,
      itemsState,
      beltSpeed,
      dispRateInfo,
      data,
    );
    const recipe = data.adjustedRecipe[recipeId];
    const newValue = oldValue.div(recipe.output[objective.targetId]);
    this.objectivesSvc.updateEntity(objective.id, { value: newValue });
  }

  /**
   * Update unit field (machines -> non-machines), then convert and update
   * objective value so that number of items remains constant
   */
  convertMachinesToItems(
    objective: ObjectiveState,
    itemId: string,
    unit: ObjectiveUnit,
    data: AdjustedDataset,
  ): void {
    this.objectivesSvc.updateEntity(objective.id, {
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
    const factor = this.rateSvc.objectiveNormalizedRate(
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
    this.objectivesSvc.updateEntity(objective.id, { value: newValue });
  }

  /**
   * Update unit field (non-machines -> non-machines), then convert and update
   * objective value so that number of items remains constant
   */
  convertItemsToItems(
    objective: ObjectiveState,
    itemId: string,
    unit: ObjectiveUnit,
    data: AdjustedDataset,
  ): void {
    this.objectivesSvc.updateEntity(objective.id, {
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
    const oldValue = this.rateSvc.objectiveNormalizedRate(
      objective,
      itemsState,
      beltSpeed,
      dispRateInfo,
      data,
    );
    const factor = this.rateSvc.objectiveNormalizedRate(
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
    this.objectivesSvc.updateEntity(objective.id, { value: newValue });
  }
}
