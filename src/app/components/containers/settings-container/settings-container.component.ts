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
  ModInfo,
  DefaultPayload,
  Preset,
  Sort,
  LinkValue,
  IdPayload,
} from '~/models';
import { State } from '~/store';
import { getBaseSets } from '~/store/datasets';
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
  base$: Observable<ModInfo[]>;
  mods$: Observable<ModInfo[]>;
  settings$: Observable<Settings.SettingsState>;

  opening = true;

  constructor(private element: ElementRef, private store: Store<State>) {}

  ngOnInit() {
    this.data$ = this.store.select(Settings.getDataset);
    this.base$ = this.store.select(getBaseSets);
    this.mods$ = this.store.select(Settings.getAvailableMods);
    this.settings$ = this.store.select(Settings.getSettings);
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

  saveState(value: IdPayload) {
    this.store.dispatch(new Settings.SaveStateAction(value));
  }

  deleteState(value: string) {
    this.store.dispatch(new Settings.DeleteStateAction(value));
  }

  setPreset(value: Preset) {
    this.store.dispatch(new Settings.SetPresetAction(value));
  }

  setBase(value: string) {
    this.store.dispatch(new Settings.SetBaseAction(value));
  }

  setMods(value: DefaultPayload<string[]>) {
    this.store.dispatch(new Settings.SetModsAction(value));
  }

  setDisabledRecipes(value: DefaultPayload<string[]>) {
    this.store.dispatch(new Settings.SetDisabledRecipesAction(value));
  }

  setExpensive(value: boolean) {
    this.store.dispatch(new Settings.SetExpensiveAction(value));
  }

  setFactoryRank(value: DefaultPayload<string[]>) {
    this.store.dispatch(new Settings.SetFactoryRankAction(value));
  }

  setModuleRank(value: DefaultPayload<string[]>) {
    this.store.dispatch(new Settings.SetModuleRankAction(value));
  }

  setDrillModule(value: boolean) {
    this.store.dispatch(new Settings.SetDrillModuleAction(value));
  }

  setBeacon(value: DefaultPayload) {
    this.store.dispatch(new Settings.SetBeaconAction(value));
  }

  setBeaconModule(value: DefaultPayload) {
    this.store.dispatch(new Settings.SetBeaconModuleAction(value));
  }

  setBeaconCount(value: DefaultPayload<number>) {
    this.store.dispatch(new Settings.SetBeaconCountAction(value));
  }

  setBelt(value: DefaultPayload) {
    this.store.dispatch(new Settings.SetBeltAction(value));
  }

  setFuel(value: DefaultPayload) {
    this.store.dispatch(new Settings.SetFuelAction(value));
  }

  setFlowRate(value: number) {
    this.store.dispatch(new Settings.SetFlowRateAction(value));
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

  setWagonPrecision(value: number) {
    this.store.dispatch(new Settings.SetWagonPrecisionAction(value));
  }

  setFactoryPrecision(value: number) {
    this.store.dispatch(new Settings.SetFactoryPrecisionAction(value));
  }

  setPowerPrecision(value: number) {
    this.store.dispatch(new Settings.SetPowerPrecisionAction(value));
  }

  setPollutionPrecision(value: number) {
    this.store.dispatch(new Settings.SetPollutionPrecisionAction(value));
  }

  setMiningBonus(value: number) {
    this.store.dispatch(new Settings.SetMiningBonusAction(value));
  }

  setResearchSpeed(value: ResearchSpeed) {
    this.store.dispatch(new Settings.SetResearchSpeedAction(value));
  }

  setSort(value: Sort) {
    this.store.dispatch(new Settings.SetSortAction(value));
  }

  setLinkValue(value: LinkValue) {
    this.store.dispatch(new Settings.SetLinkValueAction(value));
  }

  setTheme(value: Theme) {
    this.store.dispatch(new Settings.SetThemeAction(value));
  }

  resetSettings() {
    this.store.dispatch(new Settings.ResetAction());
  }
}
