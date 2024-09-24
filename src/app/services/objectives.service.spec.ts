import { TestBed } from '@angular/core/testing';

import { ObjectivesService } from './objectives.service';

describe('ObjectivesService', () => {
  let service: ObjectivesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectivesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
