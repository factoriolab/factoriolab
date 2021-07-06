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
import {
  getLinkText,
  getLinkSize,
  SetLinkTextAction,
  SetLinkSizeAction,
} from '~/store/preferences';
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
  linkText$: Observable<LinkValue>;
  linkSize$: Observable<LinkValue>;

  selected: string;

  ListMode = ListMode;

  constructor(private ref: ChangeDetectorRef, private store: Store<State>) {}

  ngOnInit(): void {
    this.isDsp$ = this.store.select(getIsDsp);
    this.sankeyData$ = this.store.select(getSankey);
    this.steps$ = this.store.select(getSteps);
    this.linkText$ = this.store.select(getLinkText);
    this.linkSize$ = this.store.select(getLinkSize);
  }

  linkValueOptions(isDsp: boolean): IdName<LinkValue>[] {
    return linkValueOptions(isDsp);
  }

  setSelected(value: string): void {
    const split = value.split(':');
    this.selected = split[split.length - 1];
    this.ref.detectChanges();
  }

  setLinkSize(value: LinkValue): void {
    this.store.dispatch(new SetLinkSizeAction(value));
  }

  setLinkText(value: LinkValue): void {
    this.store.dispatch(new SetLinkTextAction(value));
  }
}
