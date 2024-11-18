import { InserterCapacity } from './enum/inserter-capacity';
import { InserterTarget } from './enum/inserter-target';
import { ItemId } from './enum/item-id';
import { Rational, rational } from './rational';

export interface InserterSpeed {
  id: string;
  value: Rational;
}

export const InserterData: Record<
  InserterTarget,
  Record<InserterCapacity, InserterSpeed[]>
> = {
  [InserterTarget.Chest]: {
    [InserterCapacity.Capacity0]: [
      { id: ItemId.Inserter, value: rational(0.83) },
      { id: ItemId.LongHandedInserter, value: rational(1.2) },
      { id: ItemId.FastInserter, value: rational(2.31) },
      { id: ItemId.BulkInserter, value: rational(4.62) },
    ],
    [InserterCapacity.Capacity2]: [
      { id: ItemId.Inserter, value: rational(1.67) },
      { id: ItemId.LongHandedInserter, value: rational(2.4) },
      { id: ItemId.FastInserter, value: rational(4.62) },
      { id: ItemId.BulkInserter, value: rational(9.23) },
    ],
    [InserterCapacity.Capacity7]: [
      { id: ItemId.Inserter, value: rational(2.5) },
      { id: ItemId.LongHandedInserter, value: rational(3.6) },
      { id: ItemId.FastInserter, value: rational(6.92) },
      { id: ItemId.BulkInserter, value: rational(27.69) },
    ],
  },
  [InserterTarget.ExpressTransportBelt]: {
    [InserterCapacity.Capacity0]: [
      { id: ItemId.Inserter, value: rational(0.83) },
      { id: ItemId.LongHandedInserter, value: rational(1.2) },
      { id: ItemId.FastInserter, value: rational(2.31) },
      { id: ItemId.BulkInserter, value: rational(4.44) },
    ],
    [InserterCapacity.Capacity2]: [
      { id: ItemId.Inserter, value: rational(1.64) },
      { id: ItemId.LongHandedInserter, value: rational(2.35) },
      { id: ItemId.FastInserter, value: rational(4.44) },
      { id: ItemId.BulkInserter, value: rational(7.74) },
    ],
    [InserterCapacity.Capacity7]: [
      { id: ItemId.Inserter, value: rational(2.43) },
      { id: ItemId.LongHandedInserter, value: rational(3.46) },
      { id: ItemId.FastInserter, value: rational(6.43) },
      { id: ItemId.BulkInserter, value: rational(13.85) },
    ],
  },
  [InserterTarget.FastTransportBelt]: {
    [InserterCapacity.Capacity0]: [
      { id: ItemId.Inserter, value: rational(0.83) },
      { id: ItemId.LongHandedInserter, value: rational(1.2) },
      { id: ItemId.FastInserter, value: rational(2.31) },
      { id: ItemId.BulkInserter, value: rational(4.44) },
    ],
    [InserterCapacity.Capacity2]: [
      { id: ItemId.Inserter, value: rational(1.64) },
      { id: ItemId.LongHandedInserter, value: rational(2.35) },
      { id: ItemId.FastInserter, value: rational(4.44) },
      { id: ItemId.BulkInserter, value: rational(7.06) },
    ],
    [InserterCapacity.Capacity7]: [
      { id: ItemId.Inserter, value: rational(2.37) },
      { id: ItemId.LongHandedInserter, value: rational(3.33) },
      { id: ItemId.FastInserter, value: rational(6) },
      { id: ItemId.BulkInserter, value: rational(10.91) },
    ],
  },
  [InserterTarget.TransportBelt]: {
    [InserterCapacity.Capacity0]: [
      { id: ItemId.Inserter, value: rational(0.83) },
      { id: ItemId.LongHandedInserter, value: rational(1.2) },
      { id: ItemId.FastInserter, value: rational(2.31) },
      { id: ItemId.BulkInserter, value: rational(4.44) },
    ],
    [InserterCapacity.Capacity2]: [
      { id: ItemId.Inserter, value: rational(1.64) },
      { id: ItemId.LongHandedInserter, value: rational(2.35) },
      { id: ItemId.FastInserter, value: rational(4.44) },
      { id: ItemId.BulkInserter, value: rational(5.71) },
    ],
    [InserterCapacity.Capacity7]: [
      { id: ItemId.Inserter, value: rational(2.25) },
      { id: ItemId.LongHandedInserter, value: rational(3.1) },
      { id: ItemId.FastInserter, value: rational(5.29) },
      { id: ItemId.BulkInserter, value: rational(6.79) },
    ],
  },
};
