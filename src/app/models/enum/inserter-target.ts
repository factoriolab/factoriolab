import { IdName } from '../id-name';

export enum InserterTarget {
  Chest,
  ExpressTransportBelt,
  FastTransportBelt,
  TransportBelt,
}

export const InserterTargetOptions: IdName<InserterTarget>[] = [
  { id: InserterTarget.Chest, name: 'Chest' },
  { id: InserterTarget.ExpressTransportBelt, name: 'Express transport belt' },
  { id: InserterTarget.FastTransportBelt, name: 'Fast transport belt' },
  { id: InserterTarget.TransportBelt, name: 'Transport belt' },
];
