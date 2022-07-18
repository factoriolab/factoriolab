import { Pipe, PipeTransform } from '@angular/core';

import { Game, ItemId } from '~/models';

@Pipe({ name: 'factoryShow' })
export class FactoryShowPipe implements PipeTransform {
  transform(factoryId: string, game: Game): boolean {
    return game !== Game.DysonSphereProgram || factoryId !== ItemId.MiningDrill;
  }
}
