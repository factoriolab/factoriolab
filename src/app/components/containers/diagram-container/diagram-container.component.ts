import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { SankeyNode } from 'd3-sankey';
import { Observable } from 'rxjs';

import { Node, Link, SankeyData, Step } from '~/models';
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

  steps: Step[];
  selected: Step[];

  constructor(private store: Store<State>) {}

  ngOnInit(): void {
    this.sankeyData$ = this.store.select(getSankey);
    this.store.select(getSteps).subscribe((s) => (this.steps = s));
  }

  selectNode(value: SankeyNode<Node, Link>) {
    const step = this.steps.find(
      (s) => s.itemId === value.id || s.recipeId === value.id
    );
    this.selected = step ? [step] : null;
    console.log(this.selected);
  }
}
