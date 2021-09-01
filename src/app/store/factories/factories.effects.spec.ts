import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { Action, Store, StoreModule } from '@ngrx/store';

import { RecipeId, ItemId, Mocks } from 'src/tests';
import { metaReducers, reducers, State } from '..';
import { LoadModAction } from '../datasets';
import * as Recipes from '../recipes';
import { RemoveAction } from './factories.actions';
import { FactoriesEffects } from './factories.effects';

describe('FactoriesEffects', () => {
  let store: Store<State>;
  let effects: FactoriesEffects;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(reducers, { metaReducers }),
        EffectsModule.forRoot([FactoriesEffects]),
      ],
    });

    store = TestBed.inject(Store);
    effects = TestBed.inject(FactoriesEffects);
  });

  beforeEach(() => {
    store.dispatch(new LoadModAction({ id: '1.1', value: Mocks.BaseData }));
    store.dispatch(new LoadModAction({ id: 'res', value: Mocks.ModData1 }));
  });

  describe('resetRecipeSetting$', () => {
    it('should ignore unaffected recipe settings', () => {
      store.dispatch(
        new Recipes.SetCostAction({
          id: RecipeId.Coal,
          value: '100',
          def: null,
        })
      );
      spyOn(store, 'dispatch').and.callThrough();
      const effect: Action[] = [];
      effects.resetRecipeSettings$.subscribe((a) => effect.push(a));
      store.dispatch(
        new RemoveAction({
          value: ItemId.AssemblingMachine3,
          def: Mocks.Defaults.factoryRank,
        })
      );
      expect(effect).toEqual([]);
    });

    it('should ignore unaffected module settings', () => {
      store.dispatch(
        new Recipes.SetBeaconCountAction({
          id: RecipeId.Coal,
          value: '1',
          def: null,
        })
      );
      spyOn(store, 'dispatch').and.callThrough();
      const effect: Action[] = [];
      effects.resetRecipeSettings$.subscribe((a) => effect.push(a));
      store.dispatch(
        new RemoveAction({
          value: ItemId.AssemblingMachine3,
          def: Mocks.Defaults.factoryRank,
        })
      );
      expect(effect).toEqual([]);
    });

    it('should reset when factory does not support modules', () => {
      store.dispatch(
        new Recipes.SetBeaconModulesAction({
          id: RecipeId.Coal,
          value: [ItemId.SpeedModule],
          def: [],
        })
      );
      spyOn(store, 'dispatch').and.callThrough();
      const effect: Action[] = [];
      effects.resetRecipeSettings$.subscribe((a) => effect.push(a));
      store.dispatch(
        new RemoveAction({
          value: ItemId.ElectricMiningDrill,
          def: Mocks.Defaults.factoryRank,
        })
      );
      expect(effect).toEqual([
        new Recipes.ResetRecipeModulesAction(RecipeId.Coal),
      ]);
    });

    it('should reset when factory modules do not match', () => {
      store.dispatch(
        new Recipes.SetFactoryModulesAction({
          id: RecipeId.Coal,
          value: [ItemId.SpeedModule],
          def: [],
        })
      );
      spyOn(store, 'dispatch').and.callThrough();
      const effect: Action[] = [];
      effects.resetRecipeSettings$.subscribe((a) => effect.push(a));
      store.dispatch(
        new RemoveAction({
          value: ItemId.AssemblingMachine3,
          def: Mocks.Defaults.factoryRank,
        })
      );
      expect(effect).toEqual([
        new Recipes.ResetRecipeModulesAction(RecipeId.Coal),
      ]);
    });
  });
});
