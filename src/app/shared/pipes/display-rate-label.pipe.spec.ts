import { TestBed } from '@angular/core/testing';

import { DisplayRate } from '~/models';
import { DisplayRateLabelPipe } from './display-rate-label.pipe';

describe('DisplayRateLabelPipe', () => {
  let pipe: DisplayRateLabelPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DisplayRateLabelPipe] });
    pipe = TestBed.inject(DisplayRateLabelPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should handle null value', () => {
      expect(pipe.transform(undefined)).toEqual('');
    });

    it('should convert enum to label', () => {
      expect(pipe.transform(DisplayRate.PerHour)).toEqual('/h');
    });
  });
});
