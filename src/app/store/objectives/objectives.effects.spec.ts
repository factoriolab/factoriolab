import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { ReplaySubject } from 'rxjs';

import { DisplayRate } from '~/models/enum/display-rate';
import { rational } from '~/models/rational';

import { setDisplayRate } from '../settings/settings.actions';
import { adjustDisplayRate } from './objectives.actions';
import { ObjectivesEffects } from './objectives.effects';

describe('ObjectivesEffects', () => {
  let effects: ObjectivesEffects;
  let actions: ReplaySubject<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockActions(() => actions), ObjectivesEffects],
    });

    effects = TestBed.inject(ObjectivesEffects);
  });

  describe('adjustDisplayRate$', () => {
    it('should dispatch an action to adjust objective rates', () => {
      actions = new ReplaySubject(1);
      actions.next(
        setDisplayRate({
          displayRate: DisplayRate.PerSecond,
          previous: DisplayRate.PerMinute,
        }),
      );
      const results: Action[] = [];
      effects.adjustDisplayRate$.subscribe((a) => results.push(a));
      expect(results).toEqual([
        adjustDisplayRate({ factor: rational(1n, 60n) }),
      ]);
    });
  });
});
