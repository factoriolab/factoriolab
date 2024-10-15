import { TestBed } from '@angular/core/testing';

import { rational } from '~/models/rational';
import { DisplayService } from '~/services/display.service';

import { UsagePipe } from './usage.pipe';

describe('UsagePipe', () => {
  let pipe: UsagePipe;
  let service: DisplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [UsagePipe] });
    pipe = TestBed.inject(UsagePipe);
    service = TestBed.inject(DisplayService);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should call DisplayService method', () => {
      spyOn(service, 'usage').and.callThrough();
      expect(pipe.transform(rational.one)).toEqual('1 kW');
      expect(service.usage).toHaveBeenCalled();
    });
  });
});
