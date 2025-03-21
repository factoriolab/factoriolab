import { TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests';

import { MachinesStore } from './machines.store';

describe('MachinesStore', () => {
  let store: MachinesStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    store = TestBed.inject(MachinesStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });
});
