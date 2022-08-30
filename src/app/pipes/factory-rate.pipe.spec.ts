import { ItemId } from 'src/tests';
import { Rational } from '~/models';
import { FactoryRatePipe } from './factory-rate.pipe';

describe('FactoryRatePipe', () => {
  const pipe = new FactoryRatePipe();

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should transform pumpjack values to percentages', () => {
      expect(pipe.transform(Rational.one, null, ItemId.Pumpjack)).toEqual(
        '100%'
      );
      expect(pipe.transform(Rational.from(1, 3), 3, ItemId.Pumpjack)).toEqual(
        '33.4%'
      );
    });

    it('should transform values using rate pipe', () => {
      spyOn(pipe.rate, 'transform');
      pipe.transform(Rational.one, null, ItemId.AssemblingMachine1);
      expect(pipe.rate.transform).toHaveBeenCalledWith(Rational.one, null);
    });
  });
});
