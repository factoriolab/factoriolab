import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import {
  Breakpoint,
  DisplayRate,
  displayRateOptions,
  RateType,
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
    this.store.select(RecipeObjectives.getRecipeObjectives),
    this.store.select(Items.getItemSettings),
    this.store.select(Recipes.getRecipeSettings),
    this.store.select(Settings.getDisplayRate),
    this.store.select(Settings.getRateTypeOptions),
    this.store.select(Settings.getOptions),
    this.store.select(Settings.getDataset),
    this.contentService.width$,
  ]).pipe(
    map(
      ([
        itemObjectives,
        recipeObjectives,
        itemSettings,
        recipeSettings,
        displayRate,
        rateTypeOptions,
        options,
        data,
        width,
      ]) => ({
        itemObjectives,
        recipeObjectives,
        itemSettings,
        recipeSettings,
        displayRate,
        rateTypeOptions,
        options,
        data,
        mobile: width < Breakpoint.Small,
      })
    )
  );

  displayRateOptions = displayRateOptions;

  constructor(
    public trackSvc: TrackService,
    private store: Store<LabState>,
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

  setRateType(id: string, value: RateType): void {
    this.store.dispatch(new ItemObjectives.SetRateTypeAction({ id, value }));
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
