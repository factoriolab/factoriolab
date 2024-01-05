import { Pipe, PipeTransform } from '@angular/core';

import { Game, ItemId } from '~/models';

@Pipe({ name: 'machineShow' })
export class MachineShowPipe implements PipeTransform {
  transform(machineId: string | null | undefined, game: Game): boolean {
    if (machineId == null) return false;

    return (
      game !== Game.DysonSphereProgram || machineId !== ItemId.MiningMachine
    );
  }
}
