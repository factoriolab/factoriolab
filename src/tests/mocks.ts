import { Component } from '@angular/core';

import modJson from '/public/data/1.1/data.json';
import hashJson from '/public/data/1.1/hash.json';
import { ModData } from '~/data/schema/mod-data';
import { ModHash } from '~/data/schema/mod-hash';
import { rational } from '~/rational/rational';
import { ObjectiveBase } from '~/state/objectives/objective';
import { ObjectiveType } from '~/state/objectives/objective-type';
import { ObjectiveUnit } from '~/state/objectives/objective-unit';

import { ItemId } from './item-id';
import { RecipeId } from './recipe-id';

export const modData = modJson as unknown as ModData;
modData.defaults!.excludedRecipes = [RecipeId.NuclearFuelReprocessing];
modData.locations = [{ id: 'wooden-chest', name: 'Location' }];
export const modHash: ModHash = hashJson;

@Component({ standalone: true, template: '' })
export class MockComponent {}

export const objectiveBase: ObjectiveBase = {
  targetId: ItemId.Coal,
  value: rational.one,
  unit: ObjectiveUnit.Items,
  type: ObjectiveType.Output,
};
