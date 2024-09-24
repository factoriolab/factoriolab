import { TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests';

import { ObjectivesService } from './objectives.service';

describe('ObjectivesService', () => {
  let service: ObjectivesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(ObjectivesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
