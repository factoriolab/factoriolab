import { Entities } from './entities';
import { Rational } from './rational';

export interface StepItem {
  id: string;
  items: Rational;
  surplus: Rational;
  belts: Rational;
  wagons: Rational;
  parents: Entities<Rational>;
  outputs: Entities<Rational>;
}
