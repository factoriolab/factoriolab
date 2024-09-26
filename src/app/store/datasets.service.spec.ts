import { TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests';

import { DatasetsService } from './datasets.service';

describe('DatasetsService', () => {
  let service: DatasetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(DatasetsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
