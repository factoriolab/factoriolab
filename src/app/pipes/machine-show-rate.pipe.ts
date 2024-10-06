import { Pipe, PipeTransform } from '@angular/core';

import { Game } from '~/models/enum/game';
import { ItemId } from '~/models/enum/item-id';

@Pipe({ name: 'machineShowRate', standalone: true })
export class MachineShowRatePipe implements PipeTransform {
  transform(machineId: string, game: Game): boolean {
    return (
      game !== Game.CaptainOfIndustry || machineId !== ItemId.MineControlTower
    );
  }
}
