import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';

export enum ResearchSpeed {
  Speed0 = 0,
  Speed1 = 20,
  Speed2 = 50,
  Speed3 = 90,
  Speed4 = 140,
  Speed5 = 190,
  Speed6 = 250,
}

export const researchSpeedOptions: SelectItem<ResearchSpeed>[] = [
  { label: 'options.researchSpeed.speed0', value: ResearchSpeed.Speed0 },
  { label: 'options.researchSpeed.speed1', value: ResearchSpeed.Speed1 },
  { label: 'options.researchSpeed.speed2', value: ResearchSpeed.Speed2 },
  { label: 'options.researchSpeed.speed3', value: ResearchSpeed.Speed3 },
  { label: 'options.researchSpeed.speed4', value: ResearchSpeed.Speed4 },
  { label: 'options.researchSpeed.speed5', value: ResearchSpeed.Speed5 },
  { label: 'options.researchSpeed.speed6', value: ResearchSpeed.Speed6 },
];

export const researchSpeedVal = {
  [ResearchSpeed.Speed0]: new Rational(BigInt(ResearchSpeed.Speed0)),
  [ResearchSpeed.Speed1]: new Rational(BigInt(ResearchSpeed.Speed1)),
  [ResearchSpeed.Speed2]: new Rational(BigInt(ResearchSpeed.Speed2)),
  [ResearchSpeed.Speed3]: new Rational(BigInt(ResearchSpeed.Speed3)),
  [ResearchSpeed.Speed4]: new Rational(BigInt(ResearchSpeed.Speed4)),
  [ResearchSpeed.Speed5]: new Rational(BigInt(ResearchSpeed.Speed5)),
  [ResearchSpeed.Speed6]: new Rational(BigInt(ResearchSpeed.Speed6)),
};

export const researchSpeedFactor = {
  [ResearchSpeed.Speed0]: researchSpeedVal[ResearchSpeed.Speed0]
    .add(Rational.hundred)
    .div(Rational.hundred),
  [ResearchSpeed.Speed1]: researchSpeedVal[ResearchSpeed.Speed1]
    .add(Rational.hundred)
    .div(Rational.hundred),
  [ResearchSpeed.Speed2]: researchSpeedVal[ResearchSpeed.Speed2]
    .add(Rational.hundred)
    .div(Rational.hundred),
  [ResearchSpeed.Speed3]: researchSpeedVal[ResearchSpeed.Speed3]
    .add(Rational.hundred)
    .div(Rational.hundred),
  [ResearchSpeed.Speed4]: researchSpeedVal[ResearchSpeed.Speed4]
    .add(Rational.hundred)
    .div(Rational.hundred),
  [ResearchSpeed.Speed5]: researchSpeedVal[ResearchSpeed.Speed5]
    .add(Rational.hundred)
    .div(Rational.hundred),
  [ResearchSpeed.Speed6]: researchSpeedVal[ResearchSpeed.Speed6]
    .add(Rational.hundred)
    .div(Rational.hundred),
};
