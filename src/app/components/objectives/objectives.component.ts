import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Message } from 'primeng/api';
import { combineLatest, map } from 'rxjs';

import {
  Breakpoint,
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
    this.contentService.width$,
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

  objectiveTypeOptions = objectiveTypeOptions;
  displayRateOptions = displayRateOptions;

  ObjectiveUnit = ObjectiveUnit;
  ObjectiveType = ObjectiveType;

  constructor(
    public trackSvc: TrackService,
    private store: Store<LabState>,
    private translateSvc: TranslateService,
    private contentService: ContentService
  ) {}

  changeUnit(objective: Objective, value: ObjectiveUnit): void {
    // TODO: Need logic to check whether we can switch to a specific
    // recipe / item, and prompt if the user needs to pick one
    console.log(objective, value);
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
