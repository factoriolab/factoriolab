import { Pipe, PipeTransform } from '@angular/core';

import { Game, ItemId } from '~/models';

@Pipe({ name: 'factoryShow' })
export class FactoryShowPipe implements PipeTransform {
  transform(factoryId: string | null | undefined, game: Game): boolean {
    if (factoryId == null) return false;

    return game !== Game.DysonSphereProgram || factoryId !== ItemId.MiningDrill;
  }
}
