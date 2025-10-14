import { Option } from '~/option/option';

export enum InserterTarget {
  Chest = 0,
  ExpressTransportBelt = 1,
  FastTransportBelt = 2,
  TransportBelt = 3,
}

export const inserterTargetOptions: Option<InserterTarget>[] = [
  {
    label: 'options.inserterTarget.chest',
    value: InserterTarget.Chest,
    icon: 'steel-chest',
    iconType: 'item',
  },
  {
    label: 'options.inserterTarget.expressTransportBelt',
    value: InserterTarget.ExpressTransportBelt,
    icon: 'express-transport-belt',
    iconType: 'item',
  },
  {
    label: 'options.inserterTarget.fastTransportBelt',
    value: InserterTarget.FastTransportBelt,
    icon: 'fast-transport-belt',
    iconType: 'item',
  },
  {
    label: 'options.inserterTarget.transportBelt',
    value: InserterTarget.TransportBelt,
    icon: 'transport-belt',
    iconType: 'item',
  },
];
