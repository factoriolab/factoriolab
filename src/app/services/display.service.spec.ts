import { TestBed } from '@angular/core/testing';

import { ItemId, Mocks, RecipeId, TestModule } from 'src/tests';
import { Rational } from '~/models';
import { DisplayService } from './display.service';

describe('DisplayService', () => {
  let service: DisplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(DisplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('icon', () => {
    it('should handle null values', () => {
      expect(service.icon(ItemId.Module)).toBeTruthy();
    });
  });

  describe('table', () => {
    it('should generate html for a table', () => {
      expect(service.table([['label', 'value']])).toBeTruthy();
    });
  });

  describe('round', () => {
    it('should round a rational to two digits', () => {
      expect(service.round(Rational.from([1, 3]))).toEqual('0.33');
    });
  });

  describe('power', () => {
    it('should convert Rational, string, or numbers to power units', () => {
      expect(service.usage('0.3')).toEqual('0.3 kW');
      expect(service.usage(3000)).toEqual('3 MW');
      expect(service.usage(Rational.one)).toEqual('1 kW');
    });
  });

  describe('toBonusPercent', () => {
    it('should handle negative, positive, and zero bonus percent values', () => {
      expect(service.toBonusPercent(Rational.one)).toEqual('+100%');
      expect(service.toBonusPercent(Rational.zero)).toEqual('');
      expect(service.toBonusPercent(Rational.minusOne)).toEqual('-100%');
    });
  });

  describe('recipeProcess', () => {
    it('should generate html for a recipe', () => {
      expect(
        service.recipeProcess(
          Mocks.RawDataset.recipeEntities[RecipeId.ElectronicCircuit],
        ),
      ).toBeTruthy();
    });
  });
});
