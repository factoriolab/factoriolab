import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { idGuard } from './id-guard';

describe('idGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => idGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
