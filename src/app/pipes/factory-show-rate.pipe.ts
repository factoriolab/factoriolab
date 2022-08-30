import { Pipe, PipeTransform } from '@angular/core';

import { Game, ItemId } from '~/models';

@Pipe({ name: 'factoryShowRate' })
export class FactoryShowRatePipe implements PipeTransform {
  transform(factoryId: string, game: Game): boolean {
    return (
      game !== Game.CaptainOfIndustry || factoryId !== ItemId.MineControlTower
    );
  }
}
