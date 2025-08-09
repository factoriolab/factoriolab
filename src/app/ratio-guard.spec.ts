import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { ratioGuard } from './ratio-guard';

describe('ratioGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => ratioGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
