import {
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Store } from '@ngrx/store';

import {
  Step,
  DefaultIdPayload,
  ListMode,
  DefaultPayload,
  IdPayload,
} from '~/models';
import { LabState } from '~/store';
import * as Items from '~/store/items';
import * as Recipes from '~/store/recipes';
import * as Settings from '~/store/settings';
import { ListComponent } from './list/list.component';

@Component({
  selector: 'lab-list-container',
  templateUrl: './list-container.component.html',
  styleUrls: ['./list-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListContainerComponent {
  @ViewChild(ListComponent) child: ListComponent | undefined;

  @Input() mode = ListMode.All;
  @Input() selected: string | undefined;
  @Input() steps: Step[] | undefined;

  constructor(private store: Store<LabState>) {}

  ignoreItem(value: string): void {
    this.store.dispatch(new Items.IgnoreItemAction(value));
  }

  setBelt(data: DefaultIdPayload): void {
    this.store.dispatch(new Items.SetBeltAction(data));
  }

  setWagon(data: DefaultIdPayload): void {
    this.store.dispatch(new Items.SetWagonAction(data));
  }

  setFactory(data: DefaultIdPayload): void {
    this.store.dispatch(new Recipes.SetFactoryAction(data));
  }

  setFactoryModules(data: DefaultIdPayload<string[]>): void {
    this.store.dispatch(new Recipes.SetFactoryModulesAction(data));
  }

  setBeaconCount(data: DefaultIdPayload<string>): void {
    this.store.dispatch(new Recipes.SetBeaconCountAction(data));
  }

  setBeacon(data: DefaultIdPayload): void {
    this.store.dispatch(new Recipes.SetBeaconAction(data));
  }

  setBeaconModules(data: DefaultIdPayload<string[]>): void {
    this.store.dispatch(new Recipes.SetBeaconModulesAction(data));
  }

  setBeaconTotal(data: IdPayload): void {
    this.store.dispatch(new Recipes.SetBeaconTotalAction(data));
  }

  setOverclock(data: DefaultIdPayload<number>): void {
    this.store.dispatch(new Recipes.SetOverclockAction(data));
  }

  resetItem(value: string): void {
    this.store.dispatch(new Items.ResetItemAction(value));
  }

  resetRecipe(value: string): void {
    this.store.dispatch(new Recipes.ResetRecipeAction(value));
  }

  resetIgnore(): void {
    this.store.dispatch(new Items.ResetIgnoreAction());
  }

  resetBelt(): void {
    this.store.dispatch(new Items.ResetBeltAction());
  }

  resetWagon(): void {
    this.store.dispatch(new Items.ResetWagonAction());
  }

  resetFactory(): void {
    this.store.dispatch(new Recipes.ResetFactoryAction());
  }

  resetOverclock(): void {
    this.store.dispatch(new Recipes.ResetOverclockAction());
  }

  resetBeacons(): void {
    this.store.dispatch(new Recipes.ResetBeaconsAction());
  }

  setDisabledRecipes(value: DefaultPayload<string[]>): void {
    this.store.dispatch(new Settings.SetDisabledRecipesAction(value));
  }

  setDefaultRecipe(value: DefaultIdPayload): void {
    this.store.dispatch(new Items.SetRecipeAction(value));
  }
}
