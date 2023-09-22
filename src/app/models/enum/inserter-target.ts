import { SelectItem } from 'primeng/api';

export enum InserterTarget {
  Chest = 0,
  ExpressTransportBelt = 1,
  FastTransportBelt = 2,
  TransportBelt = 3,
}

export const inserterTargetOptions: SelectItem<InserterTarget>[] = [
  { label: 'options.inserterTarget.chest', value: InserterTarget.Chest },
  {
    label: 'options.inserterTarget.expressTransportBelt',
    value: InserterTarget.ExpressTransportBelt,
  },
  {
    label: 'options.inserterTarget.fastTransportBelt',
    value: InserterTarget.FastTransportBelt,
  },
  {
    label: 'options.inserterTarget.transportBelt',
    value: InserterTarget.TransportBelt,
  },
];
