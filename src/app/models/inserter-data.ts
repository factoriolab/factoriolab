import { InserterCapacity, InserterTarget, ItemId } from './enum';
import { Rational } from './rational';

export interface InserterSpeed {
  id: ItemId;
  value: Rational;
}

export const InserterData: Record<
  InserterTarget,
  Record<InserterCapacity, InserterSpeed[]>
> = {
  [InserterTarget.Chest]: {
    [InserterCapacity.Capacity0]: [
      {
        id: ItemId.Inserter,
        value: Rational.fromNumber(0.83),
      },
      {
        id: ItemId.LongHandedInserter,
        value: Rational.fromNumber(1.2),
      },
      {
        id: ItemId.FastInserter,
        value: Rational.fromNumber(2.31),
      },
      {
        id: ItemId.StackInserter,
        value: Rational.fromNumber(4.62),
      },
    ],
    [InserterCapacity.Capacity2]: [
      {
        id: ItemId.Inserter,
        value: Rational.fromNumber(1.67),
      },
      {
        id: ItemId.LongHandedInserter,
        value: Rational.fromNumber(2.4),
      },
      {
        id: ItemId.FastInserter,
        value: Rational.fromNumber(4.62),
      },
      {
        id: ItemId.StackInserter,
        value: Rational.fromNumber(9.23),
      },
    ],
    [InserterCapacity.Capacity7]: [
      {
        id: ItemId.Inserter,
        value: Rational.fromNumber(2.5),
      },
      {
        id: ItemId.LongHandedInserter,
        value: Rational.fromNumber(3.6),
      },
      {
        id: ItemId.FastInserter,
        value: Rational.fromNumber(6.92),
      },
      {
        id: ItemId.StackInserter,
        value: Rational.fromNumber(27.69),
      },
    ],
  },
  [InserterTarget.ExpressTransportBelt]: {
    [InserterCapacity.Capacity0]: [
      {
        id: ItemId.Inserter,
        value: Rational.fromNumber(0.83),
      },
      {
        id: ItemId.LongHandedInserter,
        value: Rational.fromNumber(1.2),
      },
      {
        id: ItemId.FastInserter,
        value: Rational.fromNumber(2.31),
      },
      {
        id: ItemId.StackInserter,
        value: Rational.fromNumber(4.44),
      },
    ],
    [InserterCapacity.Capacity2]: [
      {
        id: ItemId.Inserter,
        value: Rational.fromNumber(1.64),
      },
      {
        id: ItemId.LongHandedInserter,
        value: Rational.fromNumber(2.35),
      },
      {
        id: ItemId.FastInserter,
        value: Rational.fromNumber(4.44),
      },
      {
        id: ItemId.StackInserter,
        value: Rational.fromNumber(7.74),
      },
    ],
    [InserterCapacity.Capacity7]: [
      {
        id: ItemId.Inserter,
        value: Rational.fromNumber(2.43),
      },
      {
        id: ItemId.LongHandedInserter,
        value: Rational.fromNumber(3.46),
      },
      {
        id: ItemId.FastInserter,
        value: Rational.fromNumber(6.43),
      },
      {
        id: ItemId.StackInserter,
        value: Rational.fromNumber(13.85),
      },
    ],
  },
  [InserterTarget.FastTransportBelt]: {
    [InserterCapacity.Capacity0]: [
      {
        id: ItemId.Inserter,
        value: Rational.fromNumber(0.83),
      },
      {
        id: ItemId.LongHandedInserter,
        value: Rational.fromNumber(1.2),
      },
      {
        id: ItemId.FastInserter,
        value: Rational.fromNumber(2.31),
      },
      {
        id: ItemId.StackInserter,
        value: Rational.fromNumber(4.44),
      },
    ],
    [InserterCapacity.Capacity2]: [
      {
        id: ItemId.Inserter,
        value: Rational.fromNumber(1.64),
      },
      {
        id: ItemId.LongHandedInserter,
        value: Rational.fromNumber(2.35),
      },
      {
        id: ItemId.FastInserter,
        value: Rational.fromNumber(4.44),
      },
      {
        id: ItemId.StackInserter,
        value: Rational.fromNumber(7.06),
      },
    ],
    [InserterCapacity.Capacity7]: [
      {
        id: ItemId.Inserter,
        value: Rational.fromNumber(2.37),
      },
      {
        id: ItemId.LongHandedInserter,
        value: Rational.fromNumber(3.33),
      },
      {
        id: ItemId.FastInserter,
        value: Rational.fromNumber(6),
      },
      {
        id: ItemId.StackInserter,
        value: Rational.fromNumber(10.91),
      },
    ],
  },
  [InserterTarget.TransportBelt]: {
    [InserterCapacity.Capacity0]: [
      {
        id: ItemId.Inserter,
        value: Rational.fromNumber(0.83),
      },
      {
        id: ItemId.LongHandedInserter,
        value: Rational.fromNumber(1.2),
      },
      {
        id: ItemId.FastInserter,
        value: Rational.fromNumber(2.31),
      },
      {
        id: ItemId.StackInserter,
        value: Rational.fromNumber(4.44),
      },
    ],
    [InserterCapacity.Capacity2]: [
      {
        id: ItemId.Inserter,
        value: Rational.fromNumber(1.64),
      },
      {
        id: ItemId.LongHandedInserter,
        value: Rational.fromNumber(2.35),
      },
      {
        id: ItemId.FastInserter,
        value: Rational.fromNumber(4.44),
      },
      {
        id: ItemId.StackInserter,
        value: Rational.fromNumber(5.71),
      },
    ],
    [InserterCapacity.Capacity7]: [
      {
        id: ItemId.Inserter,
        value: Rational.fromNumber(2.25),
      },
      {
        id: ItemId.LongHandedInserter,
        value: Rational.fromNumber(3.1),
      },
      {
        id: ItemId.FastInserter,
        value: Rational.fromNumber(5.29),
      },
      {
        id: ItemId.StackInserter,
        value: Rational.fromNumber(6.79),
      },
    ],
  },
};
