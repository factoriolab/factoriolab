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
  ItemsCfg,
  ItemsObj,
  LabState,
  RecipesCfg,
  RecipesObj,
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
    this.store.select(ItemsObj.getItemsObj),
    this.store.select(ItemsObj.getMatrixResult),
    this.store.select(RecipesObj.getRecipesObj),
    this.store.select(ItemsCfg.getItemsCfg),
    this.store.select(RecipesCfg.getRecipesCfg),
    this.store.select(Settings.getDisplayRate),
    this.store.select(Settings.getRateUnitOptions),
    this.store.select(Settings.getOptions),
    this.store.select(Settings.getDataset),
    this.contentService.width$,
  ]).pipe(
    map(
      ([
        itemsObj,
        matrixResult,
        recipesObj,
        itemsCfg,
        recipesCfg,
        displayRate,
        rateUnitOptions,
        options,
        data,
        width,
      ]) => ({
        itemsObj,
        matrixResult,
        recipesObj,
        itemsCfg,
        recipesCfg,
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
  removeItemObj(id: string): void {
    this.store.dispatch(new ItemsObj.RemoveAction(id));
  }

  setItem(id: string, value: string): void {
    this.store.dispatch(new ItemsObj.SetItemAction({ id, value }));
  }

  setRate(id: string, value: string): void {
    this.store.dispatch(new ItemsObj.SetRateAction({ id, value }));
  }

  setRateUnit(id: string, value: RateUnit): void {
    this.store.dispatch(new ItemsObj.SetRateUnitAction({ id, value }));
  }

  setItemType(id: string, value: ObjectiveType): void {
    this.store.dispatch(new ItemsObj.SetTypeAction({ id, value }));
  }

  removeRecipeObj(id: string): void {
    this.store.dispatch(new RecipesObj.RemoveAction(id));
  }

  setRecipe(id: string, value: string): void {
    this.store.dispatch(new RecipesObj.SetRecipeAction({ id, value }));
  }

  setCount(id: string, value: string): void {
    this.store.dispatch(new RecipesObj.SetCountAction({ id, value }));
  }

  setRecipeType(id: string, value: ObjectiveType): void {
    this.store.dispatch(new RecipesObj.SetTypeAction({ id, value }));
  }

  addItemObj(value: string): void {
    this.store.dispatch(new ItemsObj.AddAction(value));
  }

  addRecipeObj(value: string): void {
    this.store.dispatch(new RecipesObj.AddAction(value));
  }

  setDisplayRate(value: DisplayRate, prev: DisplayRate): void {
    this.store.dispatch(new Settings.SetDisplayRateAction({ value, prev }));
  }
}
