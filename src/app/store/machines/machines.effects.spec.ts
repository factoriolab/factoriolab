import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject } from 'rxjs';

import { initialState, ItemId, Mocks, RecipeId } from 'src/tests';
import { LabState } from '../';
import * as Recipes from '../recipes';
import * as Settings from '../settings';
import * as Actions from './machines.actions';
import { MachinesEffects } from './machines.effects';

describe('MachinesEffects', () => {
  let effects: MachinesEffects;
  let actions: ReplaySubject<unknown>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
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
        MachinesEffects,
      ],
    });

    effects = TestBed.inject(MachinesEffects);
    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(
      Recipes.getRecipesState,
      Mocks.RecipesStateInitial,
    );
    mockStore.overrideSelector(Settings.getDataset, Mocks.AdjustedDataset);
    mockStore.refreshState();
  });

  afterEach(() => mockStore.resetSelectors());

  describe('resetRecipeSetting$', () => {
    it('should reset modules when machine is implicitly changed', () => {
      actions = new ReplaySubject(1);
      actions.next(
        new Actions.RemoveAction({
          value: ItemId.AssemblingMachine3,
          def: Mocks.Defaults.machineRankIds,
        }),
      );
      const results: Action[] = [];
      effects.resetRecipeSettings$.subscribe((a) => results.push(a));
      const mock = mockStore.overrideSelector(
        Recipes.getRecipesState,
        Mocks.RecipesStateInitial,
      );
      mockStore.refreshState();
      mock.setResult({
        ...Mocks.RecipesStateInitial,
        ...{
          [RecipeId.Coal]: {
            ...Mocks.RecipesStateInitial,
            ...{ machineId: ItemId.AssemblingMachine1 },
          },
        },
      });
      mockStore.refreshState();
      expect(results).toEqual([
        new Recipes.ResetRecipeMachineAction(RecipeId.Coal),
      ]);
    });
  });
});
