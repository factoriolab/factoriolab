import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Node } from '~/models';
import { State } from '~/store';
import * as Products from '~/store/products';

@Component({
  selector: 'lab-hierarchy-container',
  templateUrl: './hierarchy-container.component.html',
  styleUrls: ['./hierarchy-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HierarchyContainerComponent implements OnInit {
  nodes$: Observable<Node>;

  constructor(private store: Store<State>) {}

  ngOnInit(): void {
    this.nodes$ = this.store.select(Products.getNodes);
  }
}
