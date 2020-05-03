import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Step, RecipeId } from '~/models';
import { State } from '~/store';
import * as Recipe from '~/store/recipe';
import * as Products from '~/store/products';
import { StepsComponent } from './steps/steps.component';

@Component({
  selector: 'lab-steps-container',
  templateUrl: './steps-container.component.html',
  styleUrls: ['./steps-container.component.scss'],
})
export class StepsContainerComponent implements OnInit {
  @ViewChild(StepsComponent) child: StepsComponent;

  steps$: Observable<Step[]>;

  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.steps$ = this.store.select(Products.getSteps);
  }

  editBeaconCount(data: [RecipeId, number]) {
    this.store.dispatch(new Recipe.EditBeaconCountAction(data));
  }
}
