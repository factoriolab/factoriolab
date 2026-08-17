import { Dialog } from '@angular/cdk/dialog';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  TrackByFunction,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCheck,
  faExclamationTriangle,
  faGrip,
  faPencil,
  faPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { Select } from '~/components/select/select';
import { BeaconJson } from '~/data/schema/beacon';
import { BeltJson } from '~/data/schema/belt';
import { CargoWagonJson } from '~/data/schema/cargo-wagon';
import { FluidWagonJson } from '~/data/schema/fluid-wagon';
import { FuelJson } from '~/data/schema/fuel';
import { ItemJson } from '~/data/schema/item';
import { MachineJson } from '~/data/schema/machine';
import { ModuleJson } from '~/data/schema/module';
import { Option } from '~/option/option';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';

import { EditorTab } from '../editor-tab';
import { emptyItem } from '../object-utils';
import { BeaconDialog } from './beacon-dialog/beacon-dialog';
import { BeltDialog, BeltDialogData } from './belt-dialog/belt-dialog';
import { CargoWagonDialog } from './cargo-wagon-dialog/cargo-wagon-dialog';
import { FluidWagonDialog } from './fluid-wagon-dialog/fluid-wagon-dialog';
import { FuelDialog, FuelDialogData } from './fuel-dialog/fuel-dialog';
import {
  MachineDialog,
  MachineDialogData,
} from './machine-dialog/machine-dialog';
import { ModuleDialog, ModuleDialogData } from './module-dialog/module-dialog';

@Component({
  selector: 'lab-items',
  imports: [
    FormsModule,
    DragDropModule,
    ScrollingModule,
    FaIconComponent,
    Button,
    Select,
    TranslatePipe,
  ],
  templateUrl: './items.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grow' },
})
export class Items extends EditorTab {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly dialog = inject(Dialog);

  protected readonly categoryOptions = computed(() => {
    const { data, icons } = this.edit();
    return data.categories
      .map(
        (c): Option => ({
          label: c.name,
          value: c.id,
          icon: icons[c.icon ?? c.id]?.url,
          iconType: 'img',
        }),
      )
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  protected readonly faGrip = faGrip;
  protected readonly faPencil = faPencil;
  protected readonly faPlus = faPlus;
  protected model = emptyItem();
  protected readonly trackByFn: TrackByFunction<ItemJson> = (
    _,
    item: ItemJson,
  ): string => item.id;

  editBeacon(item: ItemJson): void {
    this.dialog
      .open<
        BeaconJson | null | undefined,
        BeaconJson,
        BeaconDialog
      >(BeaconDialog, { data: coalesce(item.beacon, { effectivity: 1, modules: 1 }) })
      .closed.subscribe((beacon) => {
        if (beacon === null) delete item.beacon;
        else if (beacon) item.beacon = beacon;
        this.forceDetect();
      });
  }

  editBelt(item: ItemJson): void {
    this.dialog
      .open<
        BeltJson | null | undefined,
        BeltDialogData,
        BeltDialog
      >(BeltDialog, { data: { belt: coalesce(item.belt, { speed: 1 }), header: 'editor.editBelt' } })
      .closed.subscribe((belt) => {
        if (belt === null) delete item.belt;
        else if (belt) item.belt = belt;
        this.forceDetect();
      });
  }

  editPipe(item: ItemJson): void {
    this.dialog
      .open<
        BeltJson | null | undefined,
        BeltDialogData,
        BeltDialog
      >(BeltDialog, { data: { belt: coalesce(item.pipe, { speed: 1 }), header: 'editor.editPipe' } })
      .closed.subscribe((pipe) => {
        if (pipe === null) delete item.pipe;
        else if (pipe) item.pipe = pipe;
        this.forceDetect();
      });
  }

  editMachine(item: ItemJson): void {
    const edit = this.edit();
    const { data, icons } = edit;
    const fuelOptions: Option<string | undefined>[] = [
      { label: 'none', value: undefined },
    ];
    for (const item of data.items) {
      if (item.fuel) {
        fuelOptions.push({
          label: item.name,
          value: item.id,
          icon: icons[item.icon ?? item.id]?.url,
          iconType: 'img',
        });
      }
    }
    const locationOptions = coalesce(data.locations, []).map(
      (l): Option => ({
        label: l.name,
        value: l.id,
        icon: icons[l.icon ?? l.id]?.url,
        iconType: 'img',
      }),
    );
    this.dialog
      .open<
        MachineJson | null | undefined,
        MachineDialogData,
        MachineDialog
      >(MachineDialog, { data: { machine: coalesce(item.machine, {}), fuelOptions, locationOptions, edit } })
      .closed.subscribe((machine) => {
        if (machine === null) delete item.machine;
        else if (machine) item.machine = machine;
        this.forceDetect();
      });
  }

  editModule(item: ItemJson): void {
    const { data, icons } = this.edit();
    const limitationOptions: Option<string | undefined>[] = [
      { label: 'none', value: undefined },
    ];
    for (const limitation of Object.keys(coalesce(data.limitations, {}))) {
      limitationOptions.push({ label: limitation, value: limitation });
    }
    const itemOptions: Option<string | undefined>[] = [
      { label: 'none', value: undefined },
    ];
    for (const item of data.items) {
      itemOptions.push({
        label: item.name,
        value: item.id,
        icon: icons[item.icon ?? item.id]?.url,
        iconType: 'img',
      });
    }
    this.dialog
      .open<
        ModuleJson | null | undefined,
        ModuleDialogData,
        ModuleDialog
      >(ModuleDialog, { data: { module: coalesce(item.module, {}), limitationOptions, itemOptions } })
      .closed.subscribe((module) => {
        if (module === null) delete item.module;
        else if (module) item.module = module;
        this.forceDetect();
      });
  }

  editFuel(item: ItemJson): void {
    const { data, icons } = this.edit();
    const itemOptions: Option<string | undefined>[] = [
      { label: 'none', value: undefined },
    ];
    for (const item of data.items) {
      itemOptions.push({
        label: item.name,
        value: item.id,
        icon: icons[item.icon ?? item.id]?.url,
        iconType: 'img',
      });
    }
    this.dialog
      .open<
        FuelJson | null | undefined,
        FuelDialogData,
        FuelDialog
      >(FuelDialog, { data: { fuel: coalesce(item.fuel, { category: '', value: 1 }), itemOptions } })
      .closed.subscribe((fuel) => {
        if (fuel === null) delete item.fuel;
        else if (fuel) item.fuel = fuel;
        this.forceDetect();
      });
  }

  editCargoWagon(item: ItemJson): void {
    this.dialog
      .open<
        CargoWagonJson | null | undefined,
        CargoWagonJson,
        CargoWagonDialog
      >(CargoWagonDialog, { data: coalesce(item.cargoWagon, { size: 1 }) })
      .closed.subscribe((cargoWagon) => {
        if (cargoWagon === null) delete item.cargoWagon;
        else if (cargoWagon) item.cargoWagon = cargoWagon;
        this.forceDetect();
      });
  }

  editFluidWagon(item: ItemJson): void {
    this.dialog
      .open<
        FluidWagonJson | null | undefined,
        FluidWagonJson,
        FluidWagonDialog
      >(FluidWagonDialog, { data: coalesce(item.fluidWagon, { capacity: 1 }) })
      .closed.subscribe((fluidWagon) => {
        if (fluidWagon === null) delete item.fluidWagon;
        else if (fluidWagon) item.fluidWagon = fluidWagon;
        this.forceDetect();
      });
  }

  add(): void {
    const { data } = this.edit();
    const items = [...data.items];
    items.push(this.model);
    data.items = items;
    this.model = emptyItem();
    this.cd.detectChanges();
  }

  private forceDetect(): void {
    const { data } = this.edit();
    data.items = [...data.items];
    this.cd.detectChanges();
  }

  drop(event: CdkDragDrop<unknown>): void {
    const items = [...this.edit().data.items];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.edit().data.items = items;
  }

  changeId(item: ItemJson, id: string): void {
    const { data } = this.edit();
    for (const i of data.items) {
      if (i.machine) {
        if (i.machine.fuel === item.id) i.machine.fuel = id;
        if (i.machine.consumption?.[item.id]) {
          i.machine.consumption[id] = i.machine.consumption[item.id];
          delete i.machine.consumption[item.id];
        }
      }

      if (i.module?.proliferator === item.id) i.module.proliferator = id;
      if (i.fuel?.result === item.id) i.fuel.result = id;
      if (i.technology?.prerequisites?.includes(item.id)) {
        const index = i.technology.prerequisites.indexOf(item.id);
        i.technology.prerequisites[index] = id;
      }
    }

    for (const r of data.recipes) {
      if (r.producers?.includes(item.id)) {
        const index = r.producers.indexOf(item.id);
        r.producers[index] = id;
      }

      if (r.in[item.id]) {
        r.in[id] = r.in[item.id];
        delete r.in[item.id];
      }

      if (r.out[item.id]) {
        r.out[id] = r.out[item.id];
        delete r.out[item.id];
      }

      if (r.catalyst?.[item.id]) {
        r.catalyst[id] = r.catalyst[item.id];
        delete r.catalyst[item.id];
      }

      if (r.part === item.id) r.part = id;
    }

    if (data.defaults) {
      if (data.defaults.beacon === item.id) data.defaults.beacon = id;
      if (data.defaults.beaconModule === item.id)
        data.defaults.beaconModule = id;
      if (data.defaults.cargoWagon === item.id) data.defaults.cargoWagon = id;
      if (data.defaults.fluidWagon === item.id) data.defaults.fluidWagon = id;
      if (data.defaults.fuelRank?.includes(item.id)) {
        const index = data.defaults?.fuelRank.indexOf(item.id);
        data.defaults.fuelRank[index] = id;
      }

      if (data.defaults.moduleRank?.includes(item.id)) {
        const index = data.defaults?.moduleRank.indexOf(item.id);
        data.defaults.moduleRank[index] = id;
      }

      if (data.defaults.researchedTechnologies?.includes(item.id)) {
        const index = data.defaults?.researchedTechnologies.indexOf(item.id);
        data.defaults.researchedTechnologies[index] = item.id;
      }

      if ('presets' in data.defaults) {
        for (const preset of data.defaults.presets) {
          if (preset.beacon === item.id) preset.beacon = id;
          if (preset.beaconModule === item.id) preset.beaconModule = id;
          if (preset.belt === item.id) preset.belt = id;
          if (preset.cargoWagon === item.id) preset.cargoWagon = id;
          if (preset.fluidWagon === item.id) preset.fluidWagon = id;
          if (preset.fuelRank?.includes(item.id)) {
            const index = preset.fuelRank.indexOf(item.id);
            preset.fuelRank[index] = id;
          }

          if (preset.machineRank?.includes(item.id)) {
            const index = preset.machineRank.indexOf(item.id);
            preset.machineRank[index] = id;
          }

          if (preset.moduleRank?.includes(item.id)) {
            const index = preset.moduleRank.indexOf(item.id);
            preset.moduleRank[index] = id;
          }

          if (preset.pipe === item.id) preset.pipe = id;
          if (preset.researchedTechnologies?.includes(item.id)) {
            const index = preset.researchedTechnologies.indexOf(item.id);
            preset.researchedTechnologies[index] = id;
          }
        }
      } else {
        if (data.defaults.minBelt === item.id) data.defaults.minBelt = id;
        if (data.defaults.maxBelt === item.id) data.defaults.maxBelt = id;
        if (data.defaults.minPipe === item.id) data.defaults.minPipe = id;
        if (data.defaults.maxPipe === item.id) data.defaults.maxPipe = id;
        if (data.defaults.minMachineRank?.includes(item.id)) {
          const index = data.defaults.minMachineRank.indexOf(item.id);
          data.defaults.minMachineRank[index] = id;
        }

        if (data.defaults.maxMachineRank?.includes(item.id)) {
          const index = data.defaults.maxMachineRank.indexOf(item.id);
          data.defaults.maxMachineRank[index] = id;
        }
      }
    }

    item.id = id;
  }

  remove(id: string): void {
    const { data } = this.edit();
    this.confirm
      .open({
        header: 'Delete item?',
        message:
          'If this item is in use, deleting it will invalidate some entities. Continue?',
        icon: faExclamationTriangle,
        actions: [
          { text: 'yes', value: 1, icon: faCheck },
          { text: 'cancel', value: 0, icon: faXmark },
        ],
      })
      .subscribe((res) => {
        if (res === 1) {
          data.items = data.items.filter((c) => c.id !== id);
          this.cd.detectChanges();
        }
      });
  }
}
