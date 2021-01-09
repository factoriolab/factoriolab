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

  @Output() closeSettings = new EventEmitter();

  data$: Observable<Dataset>;
  base$: Observable<ModInfo[]>;
  factories$: Observable<Factories.FactoriesState>;
  settings$: Observable<Settings.SettingsState>;
  preferences$: Observable<Preferences.PreferencesState>;

  opening = true;

  get isInOverlayMode(): boolean {
    return window
      .getComputedStyle(this.element.nativeElement as HTMLElement)
      .marginRight.startsWith('-');
  }

  constructor(private element: ElementRef, private store: Store<State>) {}

  ngOnInit(): void {
    this.data$ = this.store.select(Settings.getDataset);
    this.base$ = this.store.select(getBaseSets);
    this.factories$ = this.store.select(Factories.getFactorySettings);
    this.settings$ = this.store.select(Settings.getSettings);
    this.preferences$ = this.store.select(Preferences.preferencesState);
  }

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent): void {
    if (this.opening) {
      this.opening = false;
    } else if (
      !this.element.nativeElement.contains(event.target) &&
      this.isInOverlayMode
    ) {
      this.closeSettings.emit();
    }
  }

  resetSettings(): void {
    this.store.dispatch(new ResetAction());
  }

  saveState(value: IdPayload): void {
    this.store.dispatch(new Preferences.SaveStateAction(value));
  }

  deleteState(value: string): void {
    this.store.dispatch(new Preferences.DeleteStateAction(value));
  }

  setPreset(value: Preset): void {
    this.store.dispatch(new Settings.SetPresetAction(value));
  }

  setBase(value: string): void {
    this.store.dispatch(new Settings.SetBaseAction(value));
  }

  setDisabledRecipes(value: DefaultPayload<string[]>): void {
    this.store.dispatch(new Settings.SetDisabledRecipesAction(value));
  }

  setExpensive(value: boolean): void {
    this.store.dispatch(new Settings.SetExpensiveAction(value));
  }

  addFactory(value: DefaultPayload<string, string[]>): void {
    this.store.dispatch(new Factories.AddAction(value));
  }

  removeFactory(value: DefaultPayload<string, string[]>): void {
    this.store.dispatch(new Factories.RemoveAction(value));
  }

  raiseFactory(value: DefaultPayload<string, string[]>): void {
    this.store.dispatch(new Factories.RaiseAction(value));
  }

  setFactory(value: DefaultIdPayload<string, string[]>): void {
    this.store.dispatch(new Factories.SetFactoryAction(value));
  }

  setModuleRank(value: DefaultIdPayload<string[]>): void {
    this.store.dispatch(new Factories.SetModuleRankAction(value));
  }

  setBeaconCount(value: DefaultIdPayload<number>): void {
    this.store.dispatch(new Factories.SetBeaconCountAction(value));
  }

  setBeacon(value: DefaultIdPayload): void {
    this.store.dispatch(new Factories.SetBeaconAction(value));
  }

  setBeaconModule(value: DefaultIdPayload): void {
    this.store.dispatch(new Factories.SetBeaconModuleAction(value));
  }

  setBelt(value: DefaultPayload): void {
    this.store.dispatch(new Settings.SetBeltAction(value));
  }

  setFuel(value: DefaultPayload): void {
    this.store.dispatch(new Settings.SetFuelAction(value));
  }

  setFlowRate(value: number): void {
    this.store.dispatch(new Settings.SetFlowRateAction(value));
  }

  setInserterTarget(value: InserterTarget): void {
    this.store.dispatch(new Settings.SetInserterTargetAction(value));
  }

  setMiningBonus(value: number): void {
    this.store.dispatch(new Settings.SetMiningBonusAction(value));
  }

  setResearchSpeed(value: ResearchSpeed): void {
    this.store.dispatch(new Settings.SetResearchSpeedAction(value));
  }

  setInserterCapacity(value: InserterCapacity): void {
    this.store.dispatch(new Settings.SetInserterCapacityAction(value));
  }

  setDisplayRate(value: DisplayRate): void {
    this.store.dispatch(new Settings.SetDisplayRateAction(value));
  }
}
