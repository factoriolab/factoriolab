import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject } from 'rxjs';

import { initialState, ItemId, Mocks, RecipeId } from 'src/tests';
import { LabState } from '../';
import * as Recipes from '../recipe-configs';
import * as Settings from '../settings';
import * as Actions from './machine-configs.actions';
import { MachinesCfgEffects } from './machine-configs.effects';

describe('MachinesCfgEffects', () => {
  let effects: MachinesCfgEffects;
  let actions: ReplaySubject<any>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          initialState,
        }),
        provideMockActions(() => actions),
        MachinesCfgEffects,
      ],
    });

    effects = TestBed.inject(MachinesCfgEffects);
    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(
      Recipes.getRecipesCfg,
      Mocks.RecipeSettingsInitial
    );
    mockStore.overrideSelector(Settings.getDataset, Mocks.Dataset);
    mockStore.refreshState();
  });

  describe('resetRecipeSetting$', () => {
    it('should reset when machine modules do not match', () => {
      actions = new ReplaySubject(1);
      actions.next(
        new Actions.RemoveAction({
          value: ItemId.AssemblingMachine3,
          def: Mocks.Defaults.machineRankIds,
        })
      );
      mockStore.setState({
        ...initialState,
        ...{
          recipesCfgState: {
            [RecipeId.Coal]: { machineModuleIds: [ItemId.SpeedModule] },
          },
        },
      });
      const results: Action[] = [];
      effects.resetRecipesCfg$.subscribe((a) => results.push(a));
      expect(results).toEqual([
        new Recipes.ResetRecipeModulesAction(RecipeId.Coal),
      ]);
    });

    it('should ignore unaffected settings', () => {
      actions = new ReplaySubject(1);
      actions.next(
        new Actions.RemoveAction({
          value: ItemId.AssemblingMachine3,
          def: Mocks.Defaults.machineRankIds,
        })
      );
      mockStore.setState({
        ...initialState,
        ...{
          recipesCfgState: {
            [RecipeId.Coal]: { beacons: [{ moduleIds: [ItemId.SpeedModule] }] },
          },
        },
      });
      const results: Action[] = [];
      effects.resetRecipesCfg$.subscribe((a) => results.push(a));
      expect(results).toEqual([]);
    });
  });
});
