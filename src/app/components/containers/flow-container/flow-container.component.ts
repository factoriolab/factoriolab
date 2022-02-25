import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

import {
  SankeyData,
  ListMode,
  LinkValue,
  linkValueOptions,
  SankeyAlign,
  sankeyAlignOptions,
} from '~/models';
import { State } from '~/store';
import * as Preferences from '~/store/preferences';
import { getSankey, getSteps } from '~/store/products';
import { getGame } from '~/store/settings';
import { ExportUtility } from '~/utilities';
import { SankeyComponent } from './sankey/sankey.component';

@Component({
  selector: 'lab-flow-container',
  templateUrl: './flow-container.component.html',
  styleUrls: ['./flow-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowContainerComponent {
  @ViewChild(SankeyComponent) child: SankeyComponent | undefined;

  sankeyData$ = this.store.select(getSankey);
  steps$ = this.store.select(getSteps);
  linkText$ = this.store.select(Preferences.getLinkText);
  linkSize$ = this.store.select(Preferences.getLinkSize);
  sankeyAlign$ = this.store.select(Preferences.getSankeyAlign);
  options$ = this.store.select(getGame).pipe(map((g) => linkValueOptions(g)));

  selected: string | undefined;
  sankeyAlignOptions = sankeyAlignOptions;

  ListMode = ListMode;

  constructor(private ref: ChangeDetectorRef, private store: Store<State>) {}

  setSelected(value: string): void {
    const split = value.split('|');
    this.selected = split[split.length - 1];
    this.ref.detectChanges();
  }

  setLinkSize(value: LinkValue): void {
    this.store.dispatch(new Preferences.SetLinkSizeAction(value));
  }

  setLinkText(value: LinkValue): void {
    this.store.dispatch(new Preferences.SetLinkTextAction(value));
  }

  setSankeyAlign(value: SankeyAlign): void {
    this.store.dispatch(new Preferences.SetSankeyAlignAction(value));
  }

  export(data: SankeyData): void {
    ExportUtility.saveAsJson(JSON.stringify(data));
  }
}
