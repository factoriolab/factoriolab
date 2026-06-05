import { rational } from '~/rational/rational';
import { BeaconSettings } from '~/state/beacon-settings';
import { ModuleSettings } from '~/state/module-settings';

import { ItemId } from '../item-id';

export const mockModuleSettings: ModuleSettings[] = [
  {
    id: ItemId.ProductivityModule3,
    count: rational(3n),
  },
  {
    id: '',
    count: rational.one,
  },
];

export const mockBeaconSettings: BeaconSettings[] = [
  {
    count: rational(4n),
    id: ItemId.Beacon,
    modules: [{ id: ItemId.SpeedModule3, count: rational(2n) }],
  },
  {
    count: rational(4n),
    id: ItemId.Beacon,
    modules: [{ id: ItemId.EfficiencyModule3, count: rational(2n) }],
  },
];
