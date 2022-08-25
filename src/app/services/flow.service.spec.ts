import { TestBed } from '@angular/core/testing';

import { TestModule } from 'src/tests';
import { FlowService } from './flow.service';

describe('FlowService', () => {
  let service: FlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(FlowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
