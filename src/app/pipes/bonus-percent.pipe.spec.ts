import { TestBed } from '@angular/core/testing';

import { Rational } from '~/models';
import { DisplayService } from '~/services';
import { BonusPercentPipe } from './bonus-percent.pipe';

describe('BonusPercentPipe', () => {
  let pipe: BonusPercentPipe;
  let service: DisplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [BonusPercentPipe] });
    pipe = TestBed.inject(BonusPercentPipe);
    service = TestBed.inject(DisplayService);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should call DisplayService method', () => {
      spyOn(service, 'toBonusPercent').and.callThrough();
      expect(pipe.transform(Rational.one)).toEqual('+100%');
      expect(service.toBonusPercent).toHaveBeenCalled();
    });
  });
});
