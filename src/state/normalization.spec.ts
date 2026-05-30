import { TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { Step } from '~/solver/step';
import { Mocks } from '~/tests/mocks/mocks';
import { spread } from '~/utils/object';

import { Normalization } from './normalization';

describe('Normalization', () => {
  let service: Normalization;
  let mocks: Mocks;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Normalization);
    mocks = TestBed.inject(Mocks);
  });

  describe('sortBySankey', () => {
    it('should sort steps based on sankey node depth', () => {
      const steps = [...mocks.lightOilSteps()];
      service['sortBySankey'](steps);
      const ids = steps.map((s) => s.id);
      expect(ids).toEqual(['0', '3', '4', '2', '1']);
    });

    it('should handle invalid steps', () => {
      const steps = [...mocks.lightOilSteps(), { id: 'a' }, { id: 'b' }];
      service['sortBySankey'](steps);
      const ids = steps.map((s) => s.id);
      expect(ids).toEqual(['0', '3', '4', '2', '1', 'a', 'b']);
    });

    it('should handle empty steps', () => {
      const steps: Step[] = [];
      service['sortBySankey'](steps);
      expect(steps).toEqual([]);
    });

    it('should handle missing recipeId on parent', () => {
      const steps = [...mocks.lightOilSteps()];
      const broken = spread(steps[1], { parents: { '4': rational.one } });
      steps[1] = broken;
      service['sortBySankey'](steps);
      const ids = steps.map((s) => s.id);
      expect(ids).toEqual(['0', '3', '4', '2', '1']);
    });
  });
});
