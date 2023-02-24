import { TestBed } from '@angular/core/testing';

import { TestModule } from 'src/tests';
import { StateService } from './state.service';

describe('StateService', () => {
  let service: StateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
    });
    service = TestBed.inject(StateService);
    service.initialize();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
