import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { State } from 'src/app/store';
import { Step } from 'src/app/models';
import { getSteps } from 'src/app/store/products';

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
}
