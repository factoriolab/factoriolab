import { SelectItem } from 'primeng/api';

export enum InserterTarget {
  Chest,
  ExpressTransportBelt,
  FastTransportBelt,
  TransportBelt,
}

export const inserterTargetOptions: SelectItem<InserterTarget>[] = [
  { label: 'options.InserterTarget.Chest', value: InserterTarget.Chest },
  {
    label: 'options.InserterTarget.ExpressTransportBelt',
    value: InserterTarget.ExpressTransportBelt,
  },
  {
    label: 'options.InserterTarget.FastTransportBelt',
    value: InserterTarget.FastTransportBelt,
  },
  {
    label: 'options.InserterTarget.TransportBelt',
    value: InserterTarget.TransportBelt,
  },
];
