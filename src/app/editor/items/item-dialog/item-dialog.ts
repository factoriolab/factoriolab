import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  faFloppyDisk,
  faPencil,
  faPlus,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { DialogData } from '~/components/dialog/dialog';
import { BeaconJson } from '~/data/schema/beacon';
import { BeltJson } from '~/data/schema/belt';
import { CargoWagonJson } from '~/data/schema/cargo-wagon';
import { FluidWagonJson } from '~/data/schema/fluid-wagon';
import { FuelJson } from '~/data/schema/fuel';
import { InserterJson } from '~/data/schema/inserter';
import { ItemJson } from '~/data/schema/item';
import { MachineJson } from '~/data/schema/machine';
import { ModuleJson } from '~/data/schema/module';
import { TechnologyJson } from '~/data/schema/technology';
import { Option } from '~/option/option';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';

import { EditorData } from '../../editor.types';
import { toNumeric, toOptions } from '../../object-utils';
import { BeaconDialog } from '../beacon-dialog/beacon-dialog';
import { BeltDialog, BeltDialogData } from '../belt-dialog/belt-dialog';
import { CargoWagonDialog } from '../cargo-wagon-dialog/cargo-wagon-dialog';
import { FluidWagonDialog } from '../fluid-wagon-dialog/fluid-wagon-dialog';
import { FuelDialog, FuelDialogData } from '../fuel-dialog/fuel-dialog';
import { InserterDialog } from '../inserter-dialog/inserter-dialog';
import {
  MachineDialog,
  MachineDialogData,
} from '../machine-dialog/machine-dialog';
import { ModuleDialog, ModuleDialogData } from '../module-dialog/module-dialog';
import {
  TechnologyDialog,
  TechnologyDialogData,
} from '../technology-dialog/technology-dialog';

export interface ItemDialogData extends DialogData {
  item: ItemJson;
  edit: EditorData;
}

@Component({
  selector: 'lab-item-dialog',
  imports: [FormsModule, Button, TranslatePipe],
  templateUrl: './item-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0 lg:max-w-3xl',
  },
})
export class ItemDialog {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly dialog = inject(Dialog);
  protected readonly data = inject<ItemDialogData>(DIALOG_DATA);
  protected readonly dialogRef =
    inject<DialogRef<ItemJson | undefined>>(DialogRef);

  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faPencil = faPencil;
  protected readonly faPlus = faPlus;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;
  protected readonly toNumeric = toNumeric;

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
        this.cd.detectChanges();
      });
  }

  editBelt(item: ItemJson): void {
    this.dialog
      .open<
        BeltJson | null | undefined,
        BeltDialogData,
        BeltDialog
      >(BeltDialog, { data: { belt: coalesce(item.belt, { speed: 1 }), header: 'data.belt' } })
      .closed.subscribe((belt) => {
        if (belt === null) delete item.belt;
        else if (belt) item.belt = belt;
        this.cd.detectChanges();
      });
  }

  editPipe(item: ItemJson): void {
    this.dialog
      .open<
        BeltJson | null | undefined,
        BeltDialogData,
        BeltDialog
      >(BeltDialog, { data: { belt: coalesce(item.pipe, { speed: 1 }), header: 'data.pipe' } })
      .closed.subscribe((pipe) => {
        if (pipe === null) delete item.pipe;
        else if (pipe) item.pipe = pipe;
        this.cd.detectChanges();
      });
  }

  editMachine(item: ItemJson): void {
    const edit = this.data.edit;
    const { data, icons } = edit;
    const fuelOptions = toOptions(
      data.items.filter((i) => i.fuel),
      icons,
      true,
    );
    const locationOptions = toOptions(coalesce(data.locations, []), icons);
    this.dialog
      .open<
        MachineJson | null | undefined,
        MachineDialogData,
        MachineDialog
      >(MachineDialog, { data: { machine: coalesce(item.machine, {}), fuelOptions, locationOptions, edit } })
      .closed.subscribe((machine) => {
        if (machine === null) delete item.machine;
        else if (machine) item.machine = machine;
        this.cd.detectChanges();
      });
  }

  editModule(item: ItemJson): void {
    const { data, icons } = this.data.edit;
    const limitationOptions: Option<string | undefined>[] = [
      { label: 'none', value: undefined },
    ];
    for (const limitation of Object.keys(coalesce(data.limitations, {}))) {
      limitationOptions.push({ label: limitation, value: limitation });
    }
    const itemOptions = toOptions(data.items, icons, true);
    this.dialog
      .open<
        ModuleJson | null | undefined,
        ModuleDialogData,
        ModuleDialog
      >(ModuleDialog, { data: { module: coalesce(item.module, {}), limitationOptions, itemOptions } })
      .closed.subscribe((module) => {
        if (module === null) delete item.module;
        else if (module) item.module = module;
        this.cd.detectChanges();
      });
  }

  editFuel(item: ItemJson): void {
    const { data, icons } = this.data.edit;
    const itemOptions = toOptions(data.items, icons, true);
    this.dialog
      .open<
        FuelJson | null | undefined,
        FuelDialogData,
        FuelDialog
      >(FuelDialog, { data: { fuel: coalesce(item.fuel, { category: '', value: 1 }), itemOptions } })
      .closed.subscribe((fuel) => {
        if (fuel === null) delete item.fuel;
        else if (fuel) item.fuel = fuel;
        this.cd.detectChanges();
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
        this.cd.detectChanges();
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
        this.cd.detectChanges();
      });
  }

  editTechnology(item: ItemJson): void {
    const { data, icons } = this.data.edit;
    const prerequisiteOptions = toOptions(
      data.items.filter((i) => i.technology),
      icons,
    );
    const qualityOptions = toOptions(coalesce(data.qualities, []), icons);
    const recipeOptions = toOptions(data.recipes, icons);
    this.dialog
      .open<
        TechnologyJson | null | undefined,
        TechnologyDialogData,
        TechnologyDialog
      >(TechnologyDialog, { data: { technology: coalesce(item.technology, {}), prerequisiteOptions, qualityOptions, recipeOptions } })
      .closed.subscribe((technology) => {
        if (technology === null) delete item.technology;
        else if (technology) item.technology = technology;
        this.cd.detectChanges();
      });
  }

  editInserter(item: ItemJson): void {
    this.dialog
      .open<
        InserterJson | null | undefined,
        InserterJson,
        InserterDialog
      >(InserterDialog, { data: coalesce(item.inserter, { speed: 1 }) })
      .closed.subscribe((inserter) => {
        if (inserter === null) delete item.inserter;
        else if (inserter) item.inserter = inserter;
        this.cd.detectChanges();
      });
  }
}
