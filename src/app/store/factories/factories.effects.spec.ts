import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject } from 'rxjs';

import { initialState, ItemId, Mocks, RecipeId } from 'src/tests';
import { LabState } from '../';
import * as Recipes from '../recipes';
import * as Settings from '../settings';
import * as Actions from './factories.actions';
import { FactoriesEffects } from './factories.effects';

describe('FactoriesEffects', () => {
  let effects: FactoriesEffects;
  let actions: ReplaySubject<any>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          initialState,
        }),
        provideMockActions(() => actions),
        FactoriesEffects,
      ],
    });

    effects = TestBed.inject(FactoriesEffects);
    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(
      Recipes.getRecipeSettings,
      Mocks.RecipeSettingsInitial
    );
    mockStore.overrideSelector(Settings.getDataset, Mocks.Dataset);
    mockStore.refreshState();
  });

  describe('resetRecipeSetting$', () => {
    it('should reset when factory modules do not match', () => {
      actions = new ReplaySubject(1);
      actions.next(
        new Actions.RemoveAction({
          value: ItemId.AssemblingMachine3,
          def: Mocks.Defaults.factoryRankIds,
        })
      );
      mockStore.setState({
        ...initialState,
        ...{
          recipesState: {
            [RecipeId.Coal]: { factoryModuleIds: [ItemId.SpeedModule] },
          },
        },
      });
      const results: Action[] = [];
      effects.resetRecipeSettings$.subscribe((a) => results.push(a));
      expect(results).toEqual([
        new Recipes.ResetRecipeModulesAction(RecipeId.Coal),
      ]);
    });

    it('should ignore unaffected settings', () => {
      actions = new ReplaySubject(1);
      actions.next(
        new Actions.RemoveAction({
          value: ItemId.AssemblingMachine3,
          def: Mocks.Defaults.factoryRankIds,
        })
      );
      mockStore.setState({
        ...initialState,
        ...{
          recipesState: {
            [RecipeId.Coal]: { beaconModuleIds: [ItemId.SpeedModule] },
          },
        },
      });
      const results: Action[] = [];
      effects.resetRecipeSettings$.subscribe((a) => results.push(a));
      expect(results).toEqual([]);
    });
  });
});
