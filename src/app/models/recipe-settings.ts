import { ItemId } from './item';

export interface RecipeSettings {
  ignore?: boolean;
  belt?: ItemId;
  factory?: ItemId;
  modules?: ItemId[];
  beaconModule?: ItemId;
  beaconCount?: number;
}
