import { SelectItem } from 'primeng/api';

import { Rational, rational } from '../rational';

export const researchBonus = {
  speed0: rational(0n),
  speed1: rational(20n),
  speed2: rational(50n),
  speed3: rational(90n),
  speed4: rational(140n),
  speed5: rational(190n),
  speed6: rational(250n),
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
