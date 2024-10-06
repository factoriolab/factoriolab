import { Pipe, PipeTransform } from '@angular/core';

import { Game } from '~/models/enum/game';
import { ItemId } from '~/models/enum/item-id';

@Pipe({ name: 'machineShow', standalone: true })
export class MachineShowPipe implements PipeTransform {
  transform(machineId: string | null | undefined, game: Game): boolean {
    if (machineId == null) return false;

    return (
      game !== Game.DysonSphereProgram || machineId !== ItemId.MiningMachine
    );
  }
}
