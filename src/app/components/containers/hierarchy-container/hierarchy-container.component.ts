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
import * as Products from '~/store/products';
import { SunburstComponent } from './sunburst/sunburst.component';

enum HierarchyView {
  Production,
  Consumption,
}

@Component({
  selector: 'lab-hierarchy-container',
  templateUrl: './hierarchy-container.component.html',
  styleUrls: ['./hierarchy-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HierarchyContainerComponent implements OnInit {
  @ViewChild(SunburstComponent) child: SunburstComponent;

  nodes$: Observable<Node>;
  inverseNodes$: Observable<Node>;

  path: Node[] = [];
  selected: Node;
  view: HierarchyView = HierarchyView.Production;

  HierarchyView = HierarchyView;

  get root$() {
    if (this.view === HierarchyView.Production) {
      return this.nodes$;
    } else {
      return this.inverseNodes$;
    }
  }

  get steps() {
    if (this.selected) {
      if (this.selected.id === 'root') {
        return this.selected.children;
      } else if (this.selected.children) {
        return [this.selected, ...this.selected.children];
      } else {
        return [this.selected];
      }
    }

    return [];
  }

  constructor(private store: Store<State>) {}

  ngOnInit(): void {
    this.nodes$ = this.store.select(Products.getNodes);
    this.inverseNodes$ = this.store.select(Products.getInverseNodes);
  }
}
