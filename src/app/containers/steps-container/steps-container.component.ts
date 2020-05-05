import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Step, RecipeId } from '~/models';
import { State } from '~/store';
import * as Recipe from '~/store/recipe';
import * as Products from '~/store/products';
import * as Settings from '~/store/settings';
import { StepsComponent } from './steps/steps.component';

@Component({
  selector: 'lab-steps-container',
  templateUrl: './steps-container.component.html',
  styleUrls: ['./steps-container.component.scss'],
})
export class StepsContainerComponent implements OnInit {
  @ViewChild(StepsComponent) child: StepsComponent;

  steps$: Observable<Step[]>;
  itemPrecision$: Observable<number>;
  beltPrecision$: Observable<number>;
  factoryPrecision$: Observable<number>;

  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.steps$ = this.store.select(Products.getSteps);
    this.itemPrecision$ = this.store.select(Settings.getItemPrecision);
    this.beltPrecision$ = this.store.select(Settings.getBeltPrecision);
    this.factoryPrecision$ = this.store.select(Settings.getFactoryPrecision);
  }

  editBeaconCount(data: [RecipeId, number]) {
    this.store.dispatch(new Recipe.EditBeaconCountAction(data));
  }
}
