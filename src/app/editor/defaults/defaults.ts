import { Dialog } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconDefinition } from '@fortawesome/angular-fontawesome';
import {
  faChevronDown,
  faCircle,
  faCircleDot,
  faCircleMinus,
} from '@fortawesome/free-solid-svg-icons';

import { RankSelect } from '~/app/main/settings/rank-select/rank-select';
import { Button } from '~/components/button/button';
import { Checkbox } from '~/components/checkbox/checkbox';
import { FormField } from '~/components/form-field/form-field';
import { Icon } from '~/components/icon/icon';
import { Select } from '~/components/select/select';
import {
  BaseDefaultsJson,
  CustomPresetsJson,
  DefaultsJson,
  HardCodedPresetsJson,
  PresetJson,
} from '~/data/schema/defaults';
import { OptionPipe } from '~/option/option-pipe';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';

import { QuantitiesButton } from '../components/quantities-button/quantities-button';
import {
  QuantitiesDialog,
  QuantitiesDialogData,
} from '../components/quantities-dialog/quantities-dialog';
import { EditorTab } from '../editor-tab';
import { toNumeric, toOptions } from '../object-utils';

const RADIO_ICON_MAP = new Map<boolean | null | undefined, IconDefinition>([
  [true, faCircleDot],
  [false, faCircle],
  [undefined, faCircleMinus],
  [null, faCircleMinus],
]);

@Component({
  selector: 'lab-defaults',
  imports: [
    FormsModule,
    Button,
    Checkbox,
    FormField,
    Icon,
    OptionPipe,
    RankSelect,
    Select,
    TranslatePipe,
    QuantitiesButton,
  ],
  templateUrl: './defaults.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'self-start flex flex-col gap-4' },
})
export class Defaults extends EditorTab {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly dialog = inject(Dialog);

  protected readonly faChevronDown = faChevronDown;
  protected model: PresetJson = { id: 0, label: '' };
  protected readonly radioIconMap = RADIO_ICON_MAP;

  protected readonly fuelOptions = computed(() =>
    toOptions(
      this.edit().data.items.filter((i) => i.fuel),
      this.edit().icons,
    ),
  );
  protected readonly locationOptions = computed(() =>
    toOptions(coalesce(this.edit().data.locations, []), this.edit().icons),
  );
  protected readonly machineOptions = computed(() =>
    toOptions(
      this.edit().data.items.filter((i) => i.machine),
      this.edit().icons,
    ),
  );
  protected readonly moduleOptions = computed(() =>
    toOptions(
      this.edit().data.items.filter((i) => i.module),
      this.edit().icons,
    ),
  );
  protected readonly nullableBeaconOptions = computed(() =>
    toOptions(
      this.edit().data.items.filter((i) => i.beacon),
      this.edit().icons,
      true,
    ),
  );
  protected readonly nullableBeltOptions = computed(() =>
    toOptions(
      this.edit().data.items.filter((i) => i.belt),
      this.edit().icons,
      true,
    ),
  );
  protected readonly nullableCargoWagonOptions = computed(() =>
    toOptions(
      this.edit().data.items.filter((i) => i.cargoWagon),
      this.edit().icons,
      true,
    ),
  );
  protected readonly nullableFluidWagonOptions = computed(() =>
    toOptions(
      this.edit().data.items.filter((i) => i.fluidWagon),
      this.edit().icons,
      true,
    ),
  );
  protected readonly nullableModuleOptions = computed(() =>
    toOptions(
      this.edit().data.items.filter((i) => i.module),
      this.edit().icons,
      true,
    ),
  );
  protected readonly nullablePipeOptions = computed(() =>
    toOptions(
      this.edit().data.items.filter((i) => i.pipe),
      this.edit().icons,
      true,
    ),
  );
  protected readonly recipeOptions = computed(() =>
    toOptions(this.edit().data.recipes, this.edit().icons),
  );
  protected readonly technologyOptions = computed(() =>
    toOptions(
      this.edit().data.items.filter((i) => i.technology),
      this.edit().icons,
    ),
  );

  protected get defaults(): DefaultsJson {
    const { data } = this.edit();
    const defaults = data.defaults ?? {};
    data.defaults = defaults;
    return defaults;
  }

  protected get hardCodedPresets(): HardCodedPresetsJson | undefined {
    if ('presets' in this.defaults) return undefined;
    return this.defaults;
  }

  protected get customPresets(): CustomPresetsJson | undefined {
    if ('presets' in this.defaults) return this.defaults;
    return undefined;
  }

  protected readonly toNumeric = toNumeric;

  switchType(custom: boolean): void {
    this.edit().data.defaults = custom ? { presets: [] } : {};
  }

  editRecipeProductivity(defaults: BaseDefaultsJson): void {
    const { data, icons } = this.edit();
    const options = toOptions(data.items, icons);
    this.dialog
      .open<
        Partial<Record<string, string | number>> | null | undefined,
        QuantitiesDialogData,
        QuantitiesDialog
      >(QuantitiesDialog, { data: { record: coalesce(defaults.recipeProductivity, {}), options, header: 'editor.editRecipeProductivity', optional: true } })
      .closed.subscribe((record) => {
        if (record === null) delete defaults.recipeProductivity;
        else if (record) defaults.recipeProductivity = record;
        this.cd.detectChanges();
      });
  }

  addPreset(defaults: CustomPresetsJson): void {
    defaults.presets.push(this.model);
    this.model = { id: 0, label: '' };
  }

  removePreset(defaults: CustomPresetsJson, id: number): void {
    defaults.presets = defaults.presets.filter((p) => p.id !== id);
  }
}
