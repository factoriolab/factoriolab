import {
  Component,
  HostListener,
  ElementRef,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import {
  DisplayRate,
  ResearchSpeed,
  Theme,
  Dataset,
  ModData,
  Entities,
} from '~/models';
import { State } from '~/store';
import { getBaseEntities, getMods } from '~/store/datasets';
import * as Settings from '~/store/settings';
import { SettingsComponent } from './settings/settings.component';

@Component({
  selector: 'lab-settings-container',
  templateUrl: './settings-container.component.html',
  styleUrls: ['./settings-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsContainerComponent implements OnInit {
  @ViewChild(SettingsComponent) child: SettingsComponent;

  @Output() cancel = new EventEmitter();

  data$: Observable<Dataset>;
  base$: Observable<Entities<ModData>>;
  mods$: Observable<ModData[]>;
  settings$: Observable<Settings.SettingsState>;

  opening = true;

  constructor(private element: ElementRef, private store: Store<State>) {}

  ngOnInit() {
    this.data$ = this.store.select(Settings.getDataset);
    this.base$ = this.store.select(getBaseEntities);
    this.mods$ = this.store.select(getMods);
    this.settings$ = this.store.select(Settings.settingsState);
  }

  isInOverlayMode() {
    return window
      .getComputedStyle(this.element.nativeElement as HTMLElement)
      .marginRight.startsWith('-');
  }

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent) {
    if (this.opening) {
      this.opening = false;
    } else if (
      !this.element.nativeElement.contains(event.target) &&
      this.isInOverlayMode()
    ) {
      this.cancel.emit();
    }
  }

  setBaseDataset(value: ModData) {
    this.store.dispatch(new Settings.SetBaseAction(value));
  }

  enableMod(value: string) {
    this.store.dispatch(new Settings.EnableModAction(value));
  }

  disableMod(value: string) {
    this.store.dispatch(new Settings.DisableModAction(value));
  }

  setDisplayRate(value: DisplayRate) {
    this.store.dispatch(new Settings.SetDisplayRateAction(value));
  }

  setItemPrecision(value: number) {
    this.store.dispatch(new Settings.SetItemPrecisionAction(value));
  }

  setBeltPrecision(value: number) {
    this.store.dispatch(new Settings.SetBeltPrecisionAction(value));
  }

  setFactoryPrecision(value: number) {
    this.store.dispatch(new Settings.SetFactoryPrecisionAction(value));
  }

  setBelt(value: string) {
    this.store.dispatch(new Settings.SetBeltAction(value));
  }

  setFuel(value: string) {
    this.store.dispatch(new Settings.SetFuelAction(value));
  }

  disableRecipe(value: string) {
    this.store.dispatch(new Settings.DisableRecipeAction(value));
  }

  enableRecipe(value: string) {
    this.store.dispatch(new Settings.EnableRecipeAction(value));
  }

  preferFactory(value: string) {
    this.store.dispatch(new Settings.PreferFactoryAction(value));
  }

  dropFactory(value: string) {
    this.store.dispatch(new Settings.DropFactoryAction(value));
  }

  preferModule(value: string) {
    this.store.dispatch(new Settings.PreferModuleAction(value));
  }

  dropModule(value: string) {
    this.store.dispatch(new Settings.DropModuleAction(value));
  }

  setBeaconModule(value: string) {
    this.store.dispatch(new Settings.SetBeaconModuleAction(value));
  }

  setBeaconCount(value: number) {
    this.store.dispatch(new Settings.SetBeaconCountAction(value));
  }

  setDrillModule(value: boolean) {
    this.store.dispatch(new Settings.SetDrillModuleAction(value));
  }

  setMiningBonus(value: number) {
    this.store.dispatch(new Settings.SetMiningBonusAction(value));
  }

  setResearchSpeed(value: ResearchSpeed) {
    this.store.dispatch(new Settings.SetResearchSpeedAction(value));
  }

  setFlowRate(value: number) {
    this.store.dispatch(new Settings.SetFlowRateAction(value));
  }

  setExpensive(value: boolean) {
    this.store.dispatch(new Settings.SetExpensiveAction(value));
  }

  setTheme(value: Theme) {
    this.store.dispatch(new Settings.SetTheme(value));
  }
}
