import { rational } from '~/rational/rational';
import { ObjectiveBase, ObjectiveState } from '~/state/objectives/objective';
import { ObjectiveType } from '~/state/objectives/objective-type';
import { ObjectiveUnit } from '~/state/objectives/objective-unit';

import { ItemId } from '../item-id';
import { RecipeId } from '../recipe-id';

export const mockObjectiveBase: ObjectiveBase = {
  targetId: ItemId.Coal,
  value: rational.one,
  unit: ObjectiveUnit.Items,
  type: ObjectiveType.Output,
};
export const mockObjective1: ObjectiveState = {
  id: '1',
  targetId: ItemId.AdvancedCircuit,
  value: rational.one,
  unit: ObjectiveUnit.Items,
  type: ObjectiveType.Output,
};
export const mockObjective2: ObjectiveState = {
  id: '2',
  targetId: ItemId.IronPlate,
  value: rational.one,
  unit: ObjectiveUnit.Belts,
  type: ObjectiveType.Input,
};
export const mockObjective3: ObjectiveState = {
  id: '3',
  targetId: ItemId.PlasticBar,
  value: rational.one,
  unit: ObjectiveUnit.Items,
  type: ObjectiveType.Maximize,
};
export const mockObjective4: ObjectiveState = {
  id: '4',
  targetId: ItemId.PetroleumGas,
  value: rational(100n),
  unit: ObjectiveUnit.Items,
  type: ObjectiveType.Limit,
};
export const mockObjective5: ObjectiveState = {
  id: '5',
  targetId: RecipeId.PiercingRoundsMagazine,
  value: rational.one,
  unit: ObjectiveUnit.Machines,
  type: ObjectiveType.Output,
};
export const mockObjective6: ObjectiveState = {
  id: '6',
  targetId: RecipeId.CopperPlate,
  value: rational.one,
  unit: ObjectiveUnit.Machines,
  type: ObjectiveType.Input,
};
export const mockObjective7: ObjectiveState = {
  id: '7',
  targetId: RecipeId.FirearmMagazine,
  value: rational.one,
  unit: ObjectiveUnit.Machines,
  type: ObjectiveType.Maximize,
};
export const mockObjective8: ObjectiveState = {
  id: '8',
  targetId: RecipeId.IronPlate,
  value: rational(10n),
  unit: ObjectiveUnit.Machines,
  type: ObjectiveType.Limit,
};
export const mockObjectivesList = [
  mockObjective1,
  mockObjective2,
  mockObjective3,
  mockObjective4,
  mockObjective5,
  mockObjective6,
  mockObjective7,
  mockObjective8,
];
