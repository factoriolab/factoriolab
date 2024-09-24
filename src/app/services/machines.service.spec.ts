import { TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests';

import { MachinesService } from './machines.service';

describe('MachinesService', () => {
  let service: MachinesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(MachinesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
