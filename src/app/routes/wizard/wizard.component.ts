import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import { DisplayRate, displayRateOptions, RateType } from '~/models';
import { LabState, Producers, Products, Settings } from '~/store';

enum WizardState {
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

  WizardState = WizardState;

  constructor(private router: Router, private store: Store<LabState>) {}

  selectProduct(value: string): void {
    this.id = value;
    this.state = WizardState.ProductType;
  }

  selectProducer(value: string): void {
    this.id = value;
    this.state = WizardState.Producer;
  }

  openViaState(): void {
    this.store.dispatch(
      new Products.CreateAction({
        id: '0',
        itemId: this.id,
        rate: '1',
        rateType: RateType.Items,
      })
    );
    this.state = WizardState.ProductVia;
  }

  setDisplayRate(value: DisplayRate, prev: DisplayRate): void {
    this.store.dispatch(new Settings.SetDisplayRateAction({ value, prev }));
  }

  createItemsProduct(): void {
    this.store.dispatch(
      new Products.CreateAction({
        id: '0',
        itemId: this.id,
        rate: this.rate,
        rateType: RateType.Items,
      })
    );
    this.router.navigate(['list']);
  }

  createFactoriesProduct(): void {
    this.store.dispatch(
      new Products.CreateAction({
        id: '0',
        itemId: this.id,
        rate: this.rate,
        rateType: RateType.Factories,
      })
    );
    this.router.navigate(['list']);
  }

  createViaProduct(): void {
    this.store.dispatch(
      new Products.CreateAction({
        id: '0',
        itemId: this.id,
        rate: this.rate,
        rateType: this.viaRateType,
        viaId: this.viaId,
      })
    );
    this.router.navigate(['list']);
  }

  createProducer(): void {
    this.store.dispatch(
      new Producers.CreateAction({
        id: '0',
        recipeId: this.id,
        count: this.rate,
      })
    );
    this.router.navigate(['list']);
  }
}
