import { ItemId } from './item';
import { RecipeId } from './recipe';

export interface Icon {
  id: ItemId | RecipeId;
  position: string;
  size?: number;
  file?: string;
}
