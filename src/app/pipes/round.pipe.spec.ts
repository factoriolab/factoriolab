import { TestBed } from '@angular/core/testing';

import { rational } from '~/models/rational';
import { DisplayService } from '~/services/display.service';

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
      expect(pipe.transform(rational(1n, 3n))).toEqual('0.33');
      expect(service.round).toHaveBeenCalled();
    });
  });
});
