import { TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests/test-module';

import { MachinesStore } from './machines-store';

describe('MachinesStore', () => {
  let service: MachinesStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(MachinesStore);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
