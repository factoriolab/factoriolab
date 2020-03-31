import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { State } from '~/store';
import { EditBeaconCountAction } from '~/store/recipe';
import { getSteps } from '~/store/products';
import { Step } from '~/models';

@Component({
  selector: 'lab-steps-container',
  templateUrl: './steps-container.component.html',
  styleUrls: ['./steps-container.component.scss']
})
export class StepsContainerComponent implements OnInit {
  steps$: Observable<Step[]>;

  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.steps$ = this.store.select(getSteps);
  }

  editBeaconCount(data: [string, number]) {
    this.store.dispatch(new EditBeaconCountAction(data));
  }
}
