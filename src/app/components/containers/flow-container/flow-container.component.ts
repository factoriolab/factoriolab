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
  linkValueOptions,
  IdName,
} from '~/models';
import { State } from '~/store';
import { getLinkValue, SetLinkValueAction } from '~/store/preferences';
import { getSankey, getSteps } from '~/store/products';
import { getIsDsp } from '~/store/settings';
import { SankeyComponent } from './sankey/sankey.component';

@Component({
  selector: 'lab-flow-container',
  templateUrl: './flow-container.component.html',
  styleUrls: ['./flow-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowContainerComponent implements OnInit {
  @ViewChild(SankeyComponent) child: SankeyComponent;

  isDsp$: Observable<boolean>;
  sankeyData$: Observable<SankeyData>;
  steps$: Observable<Step[]>;
  linkValue$: Observable<LinkValue>;

  selected: string;

  ListMode = ListMode;

  constructor(private ref: ChangeDetectorRef, private store: Store<State>) {}

  ngOnInit(): void {
    this.isDsp$ = this.store.select(getIsDsp);
    this.sankeyData$ = this.store.select(getSankey);
    this.steps$ = this.store.select(getSteps);
    this.linkValue$ = this.store.select(getLinkValue);
  }

  linkValueOptions(isDsp: boolean): IdName[] {
    return linkValueOptions(isDsp);
  }

  setSelected(value: string): void {
    this.selected = value;
    this.ref.detectChanges();
  }

  setLinkValue(value: LinkValue): void {
    this.store.dispatch(new SetLinkValueAction(value));
  }
}
