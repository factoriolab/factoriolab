import { IdName } from '../id-name';

export enum InserterTarget {
  Chest,
  ExpressTransportBelt,
  FastTransportBelt,
  TransportBelt,
}

export const InserterTargetOptions: IdName<InserterTarget>[] = [
  { id: InserterTarget.Chest, name: 'options.InserterTarget.Chest' },
  { id: InserterTarget.ExpressTransportBelt, name: 'options.InserterTarget.ExpressTransportBelt' },
  { id: InserterTarget.FastTransportBelt, name: 'options.InserterTarget.FastTransportBelt' },
  { id: InserterTarget.TransportBelt, name: 'options.InserterTarget.TransportBelt' },
];
