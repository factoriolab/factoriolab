import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Node } from '~/models';
import { State } from '~/store';
import * as Dataset from '~/store/dataset';
import * as Products from '~/store/products';
import { SunburstComponent } from './sunburst/sunburst.component';

@Component({
  selector: 'lab-hierarchy-container',
  templateUrl: './hierarchy-container.component.html',
  styleUrls: ['./hierarchy-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HierarchyContainerComponent implements OnInit {
  @ViewChild(SunburstComponent) child: SunburstComponent;

  data$: Observable<Dataset.DatasetState>;
  nodes$: Observable<Node>;

  path: Node[] = [];
  selected: Node;

  constructor(private store: Store<State>) {}

  ngOnInit(): void {
    this.data$ = this.store.select(Dataset.getDatasetState);
    this.nodes$ = this.store.select(Products.getNodes);
  }
}
