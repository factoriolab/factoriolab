import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject } from 'rxjs';

import { initialState, ItemId, Mocks, RecipeId } from '~/tests';

import { LabState } from '../index';
import { resetRecipeMachines } from '../recipes/recipes.actions';
import { selectRecipesState } from '../recipes/recipes.selectors';
import { setMachineRank } from './settings.actions';
import { SettingsEffects } from './settings.effects';
import { selectDataset } from './settings.selectors';

describe('SettingsEffects', () => {
  let effects: SettingsEffects;
  let actions: ReplaySubject<unknown>;
  let mockStore: MockStore<LabState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          initialState: {
            ...initialState,
            ...{
              recipesState: {
                [ItemId.Coal]: { beacons: [] },
              },
            },
          },
        }),
        provideMockActions(() => actions),
        SettingsEffects,
      ],
    });

    effects = TestBed.inject(SettingsEffects);
    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(selectRecipesState, Mocks.recipesStateInitial);
    mockStore.overrideSelector(selectDataset, Mocks.adjustedDataset);
    mockStore.refreshState();
  });

  afterEach(() => {
    mockStore.resetSelectors();
  });

  describe('resetRecipeSetting$', () => {
    it('should reset modules when machine is implicitly changed', () => {
      actions = new ReplaySubject(1);
      actions.next(
        setMachineRank({
          value: [ItemId.ElectricFurnace, ItemId.MiningDrill],
          def: Mocks.defaults.machineRankIds,
        }),
      );
      const results: Action[] = [];
      effects.resetRecipeSettings$.subscribe((a) => results.push(a));
      const mock = mockStore.overrideSelector(
        selectRecipesState,
        Mocks.recipesStateInitial,
      );
      mockStore.refreshState();
      mock.setResult({
        ...Mocks.recipesStateInitial,
        ...{
          [RecipeId.Coal]: {
            ...Mocks.recipesStateInitial,
            ...{ machineId: ItemId.AssemblingMachine1 },
          },
        },
      });
      mockStore.refreshState();
      expect(results).toEqual([resetRecipeMachines({ ids: [RecipeId.Coal] })]);
    });
  });
});
