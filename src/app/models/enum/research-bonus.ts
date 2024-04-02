import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';

export const researchBonus = {
  speed0: Rational.zero,
  speed1: new Rational(20n),
  speed2: new Rational(50n),
  speed3: new Rational(90n),
  speed4: new Rational(140n),
  speed5: new Rational(190n),
  speed6: new Rational(250n),
};

export const researchBonusOptions: SelectItem<Rational>[] = [
  { label: 'options.researchBonus.speed0', value: researchBonus.speed0 },
  { label: 'options.researchBonus.speed1', value: researchBonus.speed1 },
  { label: 'options.researchBonus.speed2', value: researchBonus.speed2 },
  { label: 'options.researchBonus.speed3', value: researchBonus.speed3 },
  { label: 'options.researchBonus.speed4', value: researchBonus.speed4 },
  { label: 'options.researchBonus.speed5', value: researchBonus.speed5 },
  { label: 'options.researchBonus.speed6', value: researchBonus.speed6 },
];
