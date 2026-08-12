import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';

import { Checkbox } from '~/components/checkbox/checkbox';
import { Flag } from '~/state/flags';

import { EditorData } from '../editor.types';

@Component({
  selector: 'lab-flags',
  imports: [Checkbox],
  templateUrl: './flags.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col' },
})
export class Flags {
  protected readonly edit = inject<Signal<EditorData>>(ROUTER_OUTLET_DATA);

  protected readonly flags: Flag[] = [
    'beltStack',
    'consumptionAsDrain',
    'duplicators',
    'hideMachineSettings',
    'inactiveDrain',
    'flowRate',
    'fluidCostRatio',
    'lowEffectPrecision',
    'maximumFactor',
    'minimumFactor',
    'minimumRecipeTime',
    'miningDepletion',
    'miningProductivity',
    'miningSpeed',
    'miningTechnologyBypassLimitations',
    'mods',
    'overclock',
    'pollution',
    'power',
    'proliferator',
    'recipeCostMultiplier',
    'researchProductivity',
    'researchSpeed',
    'resourcePurity',
    'rockets',
    'somersloop',
  ];

  toggleFlag(flag: Flag, value: boolean | undefined): void {
    const data = this.edit().data;
    if (value) {
      data.flags.push(flag);
    } else {
      data.flags = data.flags.filter((f) => f !== flag);
    }
  }
}
