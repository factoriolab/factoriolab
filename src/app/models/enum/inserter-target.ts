import { SelectItem } from 'primeng/api';

export enum InserterTarget {
  Chest,
  ExpressTransportBelt,
  FastTransportBelt,
  TransportBelt,
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
