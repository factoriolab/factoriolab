import { TestBed } from '@angular/core/testing';

import { rational } from '~/models/rational';
import { DisplayService } from '~/services/display.service';

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
      expect(pipe.transform(rational.one)).toEqual('+100%');
      expect(service.toBonusPercent).toHaveBeenCalled();
    });
  });
});
