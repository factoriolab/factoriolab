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
  InserterTarget,
  InserterCapacity,
} from '~/models';
import { State } from '~/store';
import { ColumnsState, getColumns, SetPrecisionAction } from '~/store/columns';
import { getBaseSets } from '~/store/datasets';
import { ResetAction } from '~/store/app.actions';
import * as Preferences from '~/store/preferences';
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
  columns$: Observable<ColumnsState>;
  preferences$: Observable<Preferences.PreferencesState>;

  opening = true;

  constructor(private element: ElementRef, private store: Store<State>) {}

  ngOnInit() {
    this.data$ = this.store.select(Settings.getDataset);
    this.base$ = this.store.select(getBaseSets);
    this.mods$ = this.store.select(Settings.getAvailableMods);
    this.settings$ = this.store.select(Settings.getSettings);
    this.columns$ = this.store.select(getColumns);
    this.preferences$ = this.store.select(Preferences.preferencesState);
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
    this.store.dispatch(new Preferences.SaveStateAction(value));
  }

  deleteState(value: string) {
    this.store.dispatch(new Preferences.DeleteStateAction(value));
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

  setPrecision(value: IdPayload<number>) {
    this.store.dispatch(new SetPrecisionAction(value));
  }

  setMiningBonus(value: number) {
    this.store.dispatch(new Settings.SetMiningBonusAction(value));
  }

  setResearchSpeed(value: ResearchSpeed) {
    this.store.dispatch(new Settings.SetResearchSpeedAction(value));
  }

  setInserterTarget(value: InserterTarget) {
    this.store.dispatch(new Settings.SetInserterTargetAction(value));
  }

  setInserterCapacity(value: InserterCapacity) {
    this.store.dispatch(new Settings.SetInserterCapacityAction(value));
  }

  setSort(value: Sort) {
    this.store.dispatch(new Preferences.SetSortAction(value));
  }

  setLinkValue(value: LinkValue) {
    this.store.dispatch(new Preferences.SetLinkValueAction(value));
  }

  setTheme(value: Theme) {
    this.store.dispatch(new Preferences.SetThemeAction(value));
  }

  reset() {
    this.store.dispatch(new ResetAction());
  }
}
