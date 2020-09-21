import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { SankeyData, Step, ListMode } from '~/models';
import { State } from '~/store';
import { getSankey, getSteps } from '~/store/products';
import { SankeyComponent } from './sankey/sankey.component';

@Component({
  selector: 'lab-flow-container',
  templateUrl: './flow-container.component.html',
  styleUrls: ['./flow-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowContainerComponent implements OnInit {
  @ViewChild(SankeyComponent) child: SankeyComponent;

  sankeyData$: Observable<SankeyData>;
  steps$: Observable<Step[]>;

  selected: string;

  ListMode = ListMode;

  constructor(private store: Store<State>) {}

  ngOnInit(): void {
    this.sankeyData$ = this.store.select(getSankey);
    this.steps$ = this.store.select(getSteps);
  }
}
