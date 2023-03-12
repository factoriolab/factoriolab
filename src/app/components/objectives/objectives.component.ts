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
  ObjectiveType,
  objectiveTypeOptions,
  RateUnit,
} from '~/models';
import { ContentService, TrackService } from '~/services';
import {
  ItemObjectives,
  Items,
  LabState,
  RecipeObjectives,
  Recipes,
  Settings,
} from '~/store';

@Component({
  selector: 'lab-objectives',
  templateUrl: './objectives.component.html',
  styleUrls: ['./objectives.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectivesComponent {
  vm$ = combineLatest([
    this.store.select(ItemObjectives.getItemObjectives),
    this.store.select(ItemObjectives.getMatrixResult),
    this.store.select(RecipeObjectives.getRecipeObjectives),
    this.store.select(Items.getItemsState),
    this.store.select(Recipes.getRecipesState),
    this.store.select(Settings.getDisplayRate),
    this.store.select(Settings.getRateUnitOptions),
    this.store.select(Settings.getOptions),
    this.store.select(Settings.getDataset),
    this.contentService.width$,
  ]).pipe(
    map(
      ([
        itemObjectives,
        matrixResult,
        recipeObjectives,
        itemsState,
        recipesState,
        displayRate,
        rateUnitOptions,
        options,
        data,
        width,
      ]) => ({
        itemObjectives,
        matrixResult,
        recipeObjectives,
        itemsState,
        recipesState,
        displayRate,
        rateUnitOptions,
        options,
        data,
        mobile: width < Breakpoint.Small,
        messages: this.getMessages(matrixResult),
      })
    )
  );

  getMessages(matrixResult: MatrixResult): Message[] {
    if (matrixResult.resultType === MatrixResultType.Failed) {
      return [
        {
          severity: 'error',
          summary: this.translateSvc.instant('objectives.error'),
          detail: this.translateSvc.instant('objectives.errorDetail', {
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

  ObjectiveType = ObjectiveType;

  constructor(
    public trackSvc: TrackService,
    private store: Store<LabState>,
    private translateSvc: TranslateService,
    private contentService: ContentService
  ) {}

  /** Action Dispatch Methods */
  removeItemObjective(id: string): void {
    this.store.dispatch(new ItemObjectives.RemoveAction(id));
  }

  setItem(id: string, value: string): void {
    this.store.dispatch(new ItemObjectives.SetItemAction({ id, value }));
  }

  setRate(id: string, value: string): void {
    this.store.dispatch(new ItemObjectives.SetRateAction({ id, value }));
  }

  setRateUnit(id: string, value: RateUnit): void {
    this.store.dispatch(new ItemObjectives.SetRateUnitAction({ id, value }));
  }

  setItemType(id: string, value: ObjectiveType): void {
    this.store.dispatch(new ItemObjectives.SetTypeAction({ id, value }));
  }

  removeRecipeObjective(id: string): void {
    this.store.dispatch(new RecipeObjectives.RemoveAction(id));
  }

  setRecipe(id: string, value: string): void {
    this.store.dispatch(new RecipeObjectives.SetRecipeAction({ id, value }));
  }

  setCount(id: string, value: string): void {
    this.store.dispatch(new RecipeObjectives.SetCountAction({ id, value }));
  }

  setRecipeType(id: string, value: ObjectiveType): void {
    this.store.dispatch(new RecipeObjectives.SetTypeAction({ id, value }));
  }

  addItemObjective(value: string): void {
    this.store.dispatch(new ItemObjectives.AddAction(value));
  }

  addRecipeObjective(value: string): void {
    this.store.dispatch(new RecipeObjectives.AddAction(value));
  }

  setDisplayRate(value: DisplayRate, prev: DisplayRate): void {
    this.store.dispatch(new Settings.SetDisplayRateAction({ value, prev }));
  }
}
