import { Pipe, PipeTransform } from '@angular/core';

import { Game, ItemId } from '~/models';

@Pipe({ name: 'machineShow' })
export class MachineShowPipe implements PipeTransform {
  transform(machineId: string | null | undefined, game: Game): boolean {
    if (machineId == null) return false;

    console.log(game, machineId);

    return (
      game !== Game.DysonSphereProgram || machineId !== ItemId.MiningMachine
    );
  }
}
