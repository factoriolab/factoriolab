import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';

import {
  DisplayRate,
  ResearchSpeed,
  IdType,
  Theme,
  Dataset,
  ModInfo,
} from '~/models';
import { SettingsState, initialSettingsState } from '~/store/settings';

enum OpenSelect {
  None,
  Mods,
  DisabledRecipes,
  Belt,
  Fuel,
  Factory,
  Module,
  BeaconModule,
}

@Component({
  selector: 'lab-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  @Input() data: Dataset;
  @Input() base: ModInfo[];
  @Input() mods: ModInfo[];
  @Input() settings: SettingsState;

  @Output() setBaseDataset = new EventEmitter<string>();
  @Output() enableMod = new EventEmitter<string>();
  @Output() disableMod = new EventEmitter<string>();
  @Output() setDisplayRate = new EventEmitter<DisplayRate>();
  @Output() setItemPrecision = new EventEmitter<number>();
  @Output() setBeltPrecision = new EventEmitter<number>();
  @Output() setFactoryPrecision = new EventEmitter<number>();
  @Output() setBelt = new EventEmitter<string>();
  @Output() setFuel = new EventEmitter<string>();
  @Output() disableRecipe = new EventEmitter<string>();
  @Output() enableRecipe = new EventEmitter<string>();
  @Output() preferFactory = new EventEmitter<string>();
  @Output() dropFactory = new EventEmitter<string>();
  @Output() preferModule = new EventEmitter<string>();
  @Output() dropModule = new EventEmitter<string>();
  @Output() setBeaconModule = new EventEmitter<string>();
  @Output() setBeaconCount = new EventEmitter<number>();
  @Output() setDrillModule = new EventEmitter<boolean>();
  @Output() setMiningBonus = new EventEmitter<number>();
  @Output() setResearchSpeed = new EventEmitter<ResearchSpeed>();
  @Output() setFlowRate = new EventEmitter<number>();
  @Output() setExpensive = new EventEmitter<boolean>();
  @Output() setTheme = new EventEmitter<Theme>();

  openSelect = OpenSelect.None;
  scrollTop = 0;

  DisplayRate = DisplayRate;
  OpenSelect = OpenSelect;
  ResearchSpeed = ResearchSpeed;
  SelectType = IdType;
  Theme = Theme;

  initial = initialSettingsState;

  get recipeDisabledCount() {
    return Object.keys(this.settings.recipeDisabled).length;
  }

  constructor() {}

  @HostListener('scroll', ['$event'])
  scroll(event: Event) {
    this.scrollTop = (event.target as HTMLElement).scrollTop;
  }

  emitNumber(emitter: EventEmitter<number>, event: any) {
    if (event.target.value) {
      const value = Math.round(Number(event.target.value));
      emitter.emit(value);
    }
  }

  emitString(emitter: EventEmitter<string>, event: any) {
    if (event.target.value) {
      emitter.emit(event.target.value);
    }
  }
}
