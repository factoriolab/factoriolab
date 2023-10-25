import { TestBed } from '@angular/core/testing';

import { Rational } from '~/models';
import { DisplayService } from '~/services';
import { RoundPipe } from './round.pipe';

describe('RoundPipe', () => {
  let pipe: RoundPipe;
  let service: DisplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RoundPipe] });
    pipe = TestBed.inject(RoundPipe);
    service = TestBed.inject(DisplayService);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should call DisplayService method', () => {
      spyOn(service, 'round').and.callThrough();
      expect(pipe.transform(Rational.from([1, 3]))).toEqual('0.33');
      expect(service.round).toHaveBeenCalled();
    });
  });
});
