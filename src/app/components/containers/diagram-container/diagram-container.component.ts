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
  selector: 'lab-diagram-container',
  templateUrl: './diagram-container.component.html',
  styleUrls: ['./diagram-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramContainerComponent implements OnInit {
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
