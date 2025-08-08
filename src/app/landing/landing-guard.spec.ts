import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { landingGuard } from './landing-guard';

describe('landingGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => landingGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
