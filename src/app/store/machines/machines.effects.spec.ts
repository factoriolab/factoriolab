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
          initialState,
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
    mockStore.overrideSelector(Settings.getDataset, Mocks.RawDataset);
    mockStore.refreshState();
  });

  describe('resetRecipeSetting$', () => {
    it('should reset modules when machine modules do not match', () => {
      actions = new ReplaySubject(1);
      actions.next(
        new Actions.RemoveAction({
          value: ItemId.AssemblingMachine3,
          def: Mocks.Defaults.machineRankIds,
        }),
      );
      mockStore.setState({
        ...initialState,
        ...{
          recipesState: {
            [RecipeId.Coal]: { machineModuleIds: [ItemId.SpeedModule] },
          },
        },
      });
      const results: Action[] = [];
      effects.resetRecipeSettings$.subscribe((a) => results.push(a));
      expect(results).toEqual([
        new Recipes.ResetRecipeModulesAction(RecipeId.Coal),
      ]);
    });

    it('should reset fuel when machine is no longer a burner', () => {
      actions = new ReplaySubject(1);
      actions.next(
        new Actions.RemoveAction({
          value: ItemId.AssemblingMachine3,
          def: Mocks.Defaults.machineRankIds,
        }),
      );
      mockStore.setState({
        ...initialState,
        ...{
          recipesState: {
            [RecipeId.Coal]: { fuelId: ItemId.Wood },
          },
        },
      });
      const results: Action[] = [];
      effects.resetRecipeSettings$.subscribe((a) => results.push(a));
      expect(results).toEqual([
        new Recipes.ResetRecipeFuelAction(RecipeId.Coal),
      ]);
    });

    it('should ignore unaffected settings', () => {
      actions = new ReplaySubject(1);
      actions.next(
        new Actions.RemoveAction({
          value: ItemId.AssemblingMachine3,
          def: Mocks.Defaults.machineRankIds,
        }),
      );
      mockStore.setState({
        ...initialState,
        ...{
          recipesState: {
            [RecipeId.Coal]: { beacons: [{ moduleIds: [ItemId.SpeedModule] }] },
          },
        },
      });
      const results: Action[] = [];
      effects.resetRecipeSettings$.subscribe((a) => results.push(a));
      expect(results).toEqual([]);
    });
  });
});
