import { ItemId } from './item';
import { RateType } from './rate-type';

export interface Product {
  id: number;
  itemId: ItemId;
  rate: number;
  rateType: RateType;
}
