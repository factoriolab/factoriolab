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
import { Checkbox } from '~/components/checkbox/checkbox';
import { DialogData } from '~/components/dialog/dialog';
import { Select } from '~/components/select/select';
import { EnergyType } from '~/data/schema/energy-type';
import { MachineJson } from '~/data/schema/machine';
import { SiloJson } from '~/data/schema/silo';
import { Option } from '~/option/option';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';

import { QuantitiesButton } from '../../components/quantities-button/quantities-button';
import {
  QuantitiesDialog,
  QuantitiesDialogData,
} from '../../components/quantities-dialog/quantities-dialog';
import { EditorData } from '../../editor.types';
import { moduleEffectOptions, toNullableNumeric } from '../../object-utils';
import { SiloDialog } from '../silo-dialog/silo-dialog';

export interface MachineDialogData {
  machine: MachineJson;
  fuelOptions: Option<string | undefined>[];
  edit: EditorData;
}

@Component({
  selector: 'lab-machine-dialog',
  imports: [
    FormsModule,
    Button,
    Checkbox,
    TranslatePipe,
    Select,
    QuantitiesButton,
  ],
  templateUrl: './machine-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0 lg:max-w-3xl',
  },
})
export class MachineDialog implements DialogData {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly dialog = inject(Dialog);
  protected readonly data = inject<MachineDialogData>(DIALOG_DATA);
  protected readonly dialogRef =
    inject<DialogRef<MachineJson | null | undefined>>(DialogRef);

  protected readonly energySourceOptions: Option<EnergyType | undefined>[] = [
    { label: 'none', value: undefined },
    { label: 'editor.burner', value: EnergyType.Burner },
    { label: 'editor.electric', value: EnergyType.Electric },
  ];
  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faPencil = faPencil;
  protected readonly faPlus = faPlus;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;
  readonly header = 'editor.editMachine';
  protected readonly moduleEffectOptions = moduleEffectOptions;
  protected readonly toNullableNumeric = toNullableNumeric;

  updateFuelCategories(value: string): void {
    try {
      const fuelCategories = value.split(',').map((v) => v.trim());
      if (fuelCategories.length) {
        this.data.machine.fuelCategories = fuelCategories;
        return;
      }
    } catch {
      // Do nothing
    }

    this.data.machine.fuelCategories = undefined;
  }

  editSilo(machine: MachineJson): void {
    this.dialog
      .open<
        SiloJson | null | undefined,
        SiloJson,
        SiloDialog
      >(SiloDialog, { data: coalesce(machine.silo, { parts: 1, launch: 1 }) })
      .closed.subscribe((silo) => {
        if (silo === null) delete machine.silo;
        else if (silo) machine.silo = silo;
        this.cd.detectChanges();
      });
  }

  editConsumption(machine: MachineJson): void {
    const { data, icons } = this.data.edit;
    const options = data.items.map(
      (i): Option => ({
        label: i.name,
        value: i.id,
        icon: icons[i.icon ?? i.id]?.url,
        iconType: 'img',
      }),
    );
    this.dialog
      .open<
        Partial<Record<string, string | number>> | null | undefined,
        QuantitiesDialogData,
        QuantitiesDialog
      >(QuantitiesDialog, { data: { record: coalesce(machine.consumption, {}), options, header: 'editor.editConsumption' } })
      .closed.subscribe((record) => {
        if (record === null) delete machine.consumption;
        else if (record) machine.consumption = record;
        this.cd.detectChanges();
      });
  }
}
