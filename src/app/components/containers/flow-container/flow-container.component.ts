import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import {
  SankeyData,
  Step,
  ListMode,
  LinkValue,
  LinkValueOptions,
} from '~/models';
import { State } from '~/store';
import { getLinkValue, SetLinkValueAction } from '~/store/preferences';
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
  linkValue$: Observable<LinkValue>;

  selected: string;
  LinkValueOptions = LinkValueOptions;

  ListMode = ListMode;

  constructor(public store: Store<State>, public ref: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.sankeyData$ = this.store.select(getSankey);
    this.steps$ = this.store.select(getSteps);
    this.linkValue$ = this.store.select(getLinkValue);
  }

  setSelected(value: string) {
    this.selected = value;
    this.ref.detectChanges();
  }

  setLinkValue(value: LinkValue) {
    this.store.dispatch(new SetLinkValueAction(value));
  }
}
