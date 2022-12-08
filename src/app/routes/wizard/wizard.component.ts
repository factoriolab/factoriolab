import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import { DisplayRate, displayRateOptions, RateType } from '~/models';
import { LabState, Producers, Products, Settings } from '~/store';

export enum WizardState {
  ObjectiveType,
  ProductType,
  ProductItems,
  ProductFactories,
  ProductVia,
  Producer,
}

@Component({
  selector: 'lab-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WizardComponent {
  vm$ = combineLatest([
    this.store.select(Products.getViaOptions),
    this.store.select(Settings.getDataset),
    this.store.select(Settings.getDisplayRate),
    this.store.select(Settings.getRateTypeOptions),
  ]).pipe(
    map(([viaOptions, data, displayRate, rateTypeOptions]) => ({
      viaOptions,
      data,
      displayRate,
      rateTypeOptions,
    }))
  );

  id = '';
  rate = '1';
  viaRateType = RateType.Items;
  viaId = '';
  state = WizardState.ObjectiveType;

  displayRateOptions = displayRateOptions;

  RateType = RateType;
  WizardState = WizardState;

  constructor(private store: Store<LabState>) {}

  selectId(value: string, state: WizardState): void {
    this.id = value;
    this.state = state;
  }

  openViaState(): void {
    this.createProduct(this.id, '1', RateType.Items);
    this.state = WizardState.ProductVia;
  }

  /** Action Dispatch Methods */
  setDisplayRate(value: DisplayRate, prev: DisplayRate): void {
    this.store.dispatch(new Settings.SetDisplayRateAction({ value, prev }));
  }

  createProduct(
    itemId: string,
    rate: string,
    rateType: RateType,
    viaId?: string
  ): void {
    this.store.dispatch(
      new Products.CreateAction({ id: '0', itemId, rate, rateType, viaId })
    );
  }

  createProducer(recipeId: string, count: string): void {
    this.store.dispatch(
      new Producers.CreateAction({ id: '0', recipeId, count })
    );
  }
}
