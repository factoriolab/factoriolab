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
  Dataset,
  ModInfo,
  DefaultPayload,
  Preset,
  IdPayload,
  InserterTarget,
  InserterCapacity,
  DefaultIdPayload,
} from '~/models';
import { State } from '~/store';
import { ResetAction } from '~/store/app.actions';
import { getBaseSets } from '~/store/datasets';
import * as Factories from '~/store/factories';
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

  @Output() close = new EventEmitter();

  data$: Observable<Dataset>;
  base$: Observable<ModInfo[]>;
  factories$: Observable<Factories.FactoriesState>;
  settings$: Observable<Settings.SettingsState>;
  preferences$: Observable<Preferences.PreferencesState>;

  opening = true;

  constructor(private element: ElementRef, private store: Store<State>) {}

  ngOnInit() {
    this.data$ = this.store.select(Settings.getDataset);
    this.base$ = this.store.select(getBaseSets);
    this.factories$ = this.store.select(Factories.getFactorySettings);
    this.settings$ = this.store.select(Settings.getSettings);
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
      this.close.emit();
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

  setDisabledRecipes(value: DefaultPayload<string[]>) {
    this.store.dispatch(new Settings.SetDisabledRecipesAction(value));
  }

  setExpensive(value: boolean) {
    this.store.dispatch(new Settings.SetExpensiveAction(value));
  }

  addFactory(value: DefaultPayload<string, string[]>) {
    this.store.dispatch(new Factories.AddAction(value));
  }

  removeFactory(value: DefaultPayload<string, string[]>) {
    this.store.dispatch(new Factories.RemoveAction(value));
  }

  raiseFactory(value: DefaultPayload<string, string[]>) {
    this.store.dispatch(new Factories.RaiseAction(value));
  }

  setFactory(value: DefaultIdPayload<string, string[]>) {
    this.store.dispatch(new Factories.SetFactoryAction(value));
  }

  setModuleRank(value: DefaultIdPayload<string[]>) {
    this.store.dispatch(new Factories.SetModuleRankAction(value));
  }

  setBeaconCount(value: DefaultIdPayload<number>) {
    this.store.dispatch(new Factories.SetBeaconCountAction(value));
  }

  setBeacon(value: DefaultIdPayload) {
    this.store.dispatch(new Factories.SetBeaconAction(value));
  }

  setBeaconModule(value: DefaultIdPayload) {
    this.store.dispatch(new Factories.SetBeaconModuleAction(value));
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

  setDisplayRate(value: DisplayRate) {
    this.store.dispatch(new Settings.SetDisplayRateAction(value));
  }

  reset() {
    this.store.dispatch(new ResetAction());
  }
}
