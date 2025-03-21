import { TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests';

import { DatasetsStore } from './datasets.store';

describe('DatasetsStore', () => {
  let store: DatasetsStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    store = TestBed.inject(DatasetsStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });
});
