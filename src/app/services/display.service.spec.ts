import { TestBed } from '@angular/core/testing';

import { rational } from '~/models/rational';
import { TestModule } from '~/tests';

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

  describe('round', () => {
    it('should round a number to two digits', () => {
      expect(service.round(rational(1n, 3n))).toEqual('0.33');
      expect(service.round(0.3333333333333333)).toEqual('0.33');
      expect(service.round('0.333333333333333333')).toEqual('0.33');
    });
  });

  describe('power', () => {
    it('should convert Rational, string, or numbers to power units', () => {
      expect(service.usage('0.3')).toEqual('0.3 kW');
      expect(service.usage(3000)).toEqual('3 MW');
      expect(service.usage(rational.one)).toEqual('1 kW');
    });
  });

  describe('toBonusPercent', () => {
    it('should handle negative, positive, and zero bonus percent values', () => {
      expect(service.toBonusPercent(rational.one)).toEqual('+100%');
      expect(service.toBonusPercent(rational.zero)).toEqual('');
      expect(service.toBonusPercent(rational(-1n))).toEqual('-100%');
    });
  });
});
