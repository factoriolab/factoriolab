import { KeyValuePipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostBinding,
  inject,
  Input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderListModule } from 'primeng/orderlist';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { first } from 'rxjs';

import { DropdownBaseDirective } from '~/directives/dropdown-base.directive';
import { DropdownTranslateDirective } from '~/directives/dropdown-translate.directive';
import { NoDragDirective } from '~/directives/no-drag.directive';
import { coalesce } from '~/helpers';
import { displayRateOptions } from '~/models/enum/display-rate';
import { Game, gameOptions } from '~/models/enum/game';
import { inserterCapacityOptions } from '~/models/enum/inserter-capacity';
import { inserterTargetOptions } from '~/models/enum/inserter-target';
import { ItemId } from '~/models/enum/item-id';
import { languageOptions } from '~/models/enum/language';
import { maximizeTypeOptions } from '~/models/enum/maximize-type';
import { powerUnitOptions } from '~/models/enum/power-unit';
import { qualityOptions } from '~/models/enum/quality';
import { researchBonusOptions } from '~/models/enum/research-bonus';
import { themeOptions } from '~/models/enum/theme';
import { gameInfo } from '~/models/game-info';
import { rational } from '~/models/rational';
import { BeaconSettings } from '~/models/settings/beacon-settings';
import { ModuleSettings } from '~/models/settings/module-settings';
import { Entities } from '~/models/utils';
import { FilterOptionsPipe } from '~/pipes/filter-options.pipe';
import { IconSmClassPipe } from '~/pipes/icon-class.pipe';
import { ToArrayPipe } from '~/pipes/to-array.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { ContentService } from '~/services/content.service';
import { RecipeService } from '~/services/recipe.service';
import { RouterService } from '~/services/router.service';
import { TranslateService } from '~/services/translate.service';
import { DatasetsService } from '~/store/datasets.service';
import { MachinesService } from '~/store/machines.service';
import { PreferencesService } from '~/store/preferences.service';
import { SettingsService } from '~/store/settings.service';

import { BeaconsOverlayComponent } from '../beacons-overlay/beacons-overlay.component';
import { CostsComponent } from '../costs/costs.component';
import { InputNumberComponent } from '../input-number/input-number.component';
import { ModulesOverlayComponent } from '../modules-overlay/modules-overlay.component';
import { PickerComponent } from '../picker/picker.component';
import { RecipeProductivityComponent } from '../recipe-productivity/recipe-productivity.component';
import { TechPickerComponent } from '../tech-picker/tech-picker.component';
import { TooltipComponent } from '../tooltip/tooltip.component';

@Component({
  selector: 'lab-settings',
  standalone: true,
  imports: [
    FormsModule,
    KeyValuePipe,
    NgClass,
    AccordionModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    InputTextModule,
    MenuModule,
    MultiSelectModule,
    OrderListModule,
    ScrollPanelModule,
    TableModule,
    TooltipModule,
    BeaconsOverlayComponent,
    CostsComponent,
    DropdownBaseDirective,
    DropdownTranslateDirective,
    FilterOptionsPipe,
    IconSmClassPipe,
    InputNumberComponent,
    ModulesOverlayComponent,
    NoDragDirective,
    PickerComponent,
    RecipeProductivityComponent,
    TechPickerComponent,
    ToArrayPipe,
    TooltipComponent,
    TranslatePipe,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  router = inject(Router);
  contentSvc = inject(ContentService);
  datasetsSvc = inject(DatasetsService);
  machinesSvc = inject(MachinesService);
  preferencesSvc = inject(PreferencesService);
  recipeSvc = inject(RecipeService);
  routerSvc = inject(RouterService);
  settingsSvc = inject(SettingsService);
  translateSvc = inject(TranslateService);

  @HostBinding('class.active') @Input() active = false;
  @HostBinding('class.hidden') @Input() hidden = false;

  modId = this.settingsSvc.modId;
  data = this.settingsSvc.dataset;
  savedStates = this.settingsSvc.stateOptions;
  gameStates = this.settingsSvc.modStates;
  settings = this.settingsSvc.settings;
  options = this.settingsSvc.options;
  columnsState = this.settingsSvc.columnsState;
  presetOptions = this.settingsSvc.presetOptions;
  modOptions = this.settingsSvc.modOptions;
  defaults = this.settingsSvc.defaults;
  preferences = this.preferencesSvc.state;
  machinesState = this.machinesSvc.settings;
  machineIds = computed(() => [...this.settings().machineRankIds]);

  state = '';
  editValue = '';
  editState: 'create' | 'edit' | null = null;
  editStateMenu: MenuItem[] = [
    {
      label: 'settings.createSavedState',
      icon: 'fa-solid fa-plus',
      command: (): void => {
        this.openCreateState();
      },
    },
    {
      label: 'settings.saveSavedState',
      icon: 'fa-solid fa-floppy-disk',
      command: (): void => {
        this.preferencesSvc.saveState(
          this.data().modId,
          this.state,
          this.search,
        );
      },
    },
    {
      label: 'settings.editSavedState',
      icon: 'fa-solid fa-pencil',
      command: (): void => {
        this.editValue = this.state;
        this.editState = 'edit';
      },
    },
    {
      label: 'settings.deleteSavedState',
      icon: 'fa-solid fa-trash',
      command: (): void => {
        this.preferencesSvc.removeState(this.data().modId, this.state);
        this.state = '';
      },
    },
  ];
  versionsVisible = false;
  recipeProdVisible = false;

  displayRateOptions = displayRateOptions;
  gameOptions = gameOptions;
  inserterCapacityOptions = inserterCapacityOptions;
  inserterTargetOptions = inserterTargetOptions;
  languageOptions = languageOptions;
  powerUnitOptions = powerUnitOptions;
  researchSpeedOptions = researchBonusOptions;
  themeOptions = themeOptions;
  maximizeTypeOptions = maximizeTypeOptions;
  qualityOptions = qualityOptions;

  ItemId = ItemId;
  rational = rational;
  isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  get search(): string {
    return window.location.search.substring(1);
  }

  constructor() {
    effect(() => {
      const states = this.settingsSvc.modStates();
      this.state = coalesce(
        Object.keys(states).find((s) => states[s] === this.search),
        '',
      );
    });
  }

  clickResetSettings(): void {
    this.translateSvc
      .multi(['settings.reset', 'settings.resetWarning', 'yes', 'cancel'])
      .pipe(first())
      .subscribe(([header, message, acceptLabel, rejectLabel]) => {
        this.contentSvc.confirm({
          icon: 'fa-solid fa-exclamation-triangle',
          header,
          message,
          acceptLabel,
          rejectLabel,
          accept: async () => {
            localStorage.clear();
            await this.router.navigate([this.modId()]);
            this.contentSvc.reload();
          },
        });
      });
  }

  setSearch(search: string): void {
    const tree = this.router.parseUrl(this.router.url);
    const params = new URLSearchParams(search);
    params.forEach((value, key) => (tree.queryParams[key] = value));
    void this.router.navigateByUrl(tree);
  }

  copySearchToClipboard(search: string): void {
    void navigator.clipboard.writeText(search);
  }

  setState(id: string, states: Entities): void {
    const query = states[id];
    if (!query) return;
    this.state = id;
    void this.router.navigate([], {
      queryParams: this.routerSvc.toParams(query),
    });
  }

  clickSaveState(): void {
    if (!this.editValue || !this.editState) return;

    this.preferencesSvc.saveState(
      this.data().modId,
      this.editValue,
      this.search,
    );

    if (this.editState === 'edit' && this.state)
      this.preferencesSvc.removeState(this.data().modId, this.state);

    this.editState = null;
    this.state = this.editValue;
  }

  openCreateState(): void {
    this.editValue = '';
    this.editState = 'create';
  }

  setGame(game: Game): void {
    this.setMod(gameInfo[game].modId);
  }

  setMod(modId: string): void {
    void this.router.navigate([modId, 'list']);
  }

  changeLocations(locationIds: string[]): void {
    this.settingsSvc.updateField(
      'locationIds',
      new Set(locationIds),
      this.settings().defaultLocationIds,
    );
  }

  changeModules(id: string, value: ModuleSettings[]): void {
    const modules = this.recipeSvc.dehydrateModules(
      value,
      coalesce(this.machinesState()[id].moduleOptions, []),
      this.settings().moduleRankIds,
      this.data().machineEntities[id].modules,
    );
    this.machinesSvc.updateEntity(id, { modules });
  }

  changeBeacons(id: string, value: BeaconSettings[]): void {
    const def = this.settings().beacons;
    const beacons = this.recipeSvc.dehydrateBeacons(value, def);
    this.machinesSvc.updateEntity(id, { beacons });
  }

  changeDefaultBeacons(value: BeaconSettings[]): void {
    const def = this.defaults()?.beacons;
    const beacons = this.recipeSvc.dehydrateBeacons(value, def);
    this.settingsSvc.apply({ beacons });
  }

  toggleBeaconReceivers(value: boolean): void {
    const beaconReceivers = value ? rational.one : undefined;
    this.settingsSvc.apply({ beaconReceivers });
  }

  addMachine(id: string): void {
    const ids = [...this.settings().machineRankIds, id];
    this.settingsSvc.updateField(
      'machineRankIds',
      ids,
      this.settings().defaultMachineRankIds,
    );
  }

  setMachine(id: string, value: string): void {
    const ids = this.settings().machineRankIds.map((i) =>
      i === id ? value : i,
    );
    this.settingsSvc.updateField(
      'machineRankIds',
      ids,
      this.settings().defaultMachineRankIds,
    );
  }

  removeMachine(id: string): void {
    const ids = this.settings().machineRankIds.filter((i) => i !== id);
    this.settingsSvc.updateField(
      'machineRankIds',
      ids,
      this.settings().defaultMachineRankIds,
    );
  }
}
