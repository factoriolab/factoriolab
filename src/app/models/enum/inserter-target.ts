import { IdName } from '../id-name';

export enum InserterTarget {
  Chest,
  ExpressTransportBelt,
  FastTransportBelt,
  TransportBelt,
}

export const InserterTargetOptions: IdName[] = [
  { id: InserterTarget.Chest, name: 'Chest' },
  { id: InserterTarget.ExpressTransportBelt, name: 'Express Transport Belt' },
  { id: InserterTarget.FastTransportBelt, name: 'Fast Transport Belt' },
  { id: InserterTarget.TransportBelt, name: 'Transport Belt' },
];
