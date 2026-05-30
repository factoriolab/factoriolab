import { TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';

import { InserterStackPipe } from './inserter-stack-pipe';

describe('InserterStackPipe', () => {
  let pipe: InserterStackPipe;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      pipe = new InserterStackPipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should generate a string representing the inserter stack effects of a technology', () => {
      expect(
        pipe.transform([{ value: rational.one, category: 'bulk' }]),
      ).toEqual('+1 (bulk)');
    });
  });
});
