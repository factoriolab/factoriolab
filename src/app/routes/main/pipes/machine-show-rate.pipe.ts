import { Pipe, PipeTransform } from '@angular/core';

import { Game, ItemId } from '~/models';

@Pipe({ name: 'machineShowRate' })
export class MachineShowRatePipe implements PipeTransform {
  transform(machineId: string, game: Game): boolean {
    return (
      game !== Game.CaptainOfIndustry || machineId !== ItemId.MineControlTower
    );
  }
}
