import { IdName } from '../id-name';
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

export const ResearchSpeedOptions: IdName[] = [
  { id: ResearchSpeed.Speed0, name: 'No research bonus' },
  { id: ResearchSpeed.Speed1, name: 'Research speed 1' },
  { id: ResearchSpeed.Speed2, name: 'Research speed 2' },
  { id: ResearchSpeed.Speed3, name: 'Research speed 3' },
  { id: ResearchSpeed.Speed4, name: 'Research speed 4' },
  { id: ResearchSpeed.Speed5, name: 'Research speed 5' },
  { id: ResearchSpeed.Speed6, name: 'Research speed 6' },
];

export const ResearchSpeedVal = {
  [ResearchSpeed.Speed0]: new Rational(BigInt(ResearchSpeed.Speed0)),
  [ResearchSpeed.Speed1]: new Rational(BigInt(ResearchSpeed.Speed1)),
  [ResearchSpeed.Speed2]: new Rational(BigInt(ResearchSpeed.Speed2)),
  [ResearchSpeed.Speed3]: new Rational(BigInt(ResearchSpeed.Speed3)),
  [ResearchSpeed.Speed4]: new Rational(BigInt(ResearchSpeed.Speed4)),
  [ResearchSpeed.Speed5]: new Rational(BigInt(ResearchSpeed.Speed5)),
  [ResearchSpeed.Speed6]: new Rational(BigInt(ResearchSpeed.Speed6)),
};

export const ResearchSpeedFactor = {
  [ResearchSpeed.Speed0]: ResearchSpeedVal[ResearchSpeed.Speed0]
    .add(Rational.hundred)
    .div(Rational.hundred),
  [ResearchSpeed.Speed1]: ResearchSpeedVal[ResearchSpeed.Speed1]
    .add(Rational.hundred)
    .div(Rational.hundred),
  [ResearchSpeed.Speed2]: ResearchSpeedVal[ResearchSpeed.Speed2]
    .add(Rational.hundred)
    .div(Rational.hundred),
  [ResearchSpeed.Speed3]: ResearchSpeedVal[ResearchSpeed.Speed3]
    .add(Rational.hundred)
    .div(Rational.hundred),
  [ResearchSpeed.Speed4]: ResearchSpeedVal[ResearchSpeed.Speed4]
    .add(Rational.hundred)
    .div(Rational.hundred),
  [ResearchSpeed.Speed5]: ResearchSpeedVal[ResearchSpeed.Speed5]
    .add(Rational.hundred)
    .div(Rational.hundred),
  [ResearchSpeed.Speed6]: ResearchSpeedVal[ResearchSpeed.Speed6]
    .add(Rational.hundred)
    .div(Rational.hundred),
};
