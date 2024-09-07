// import { TestBed } from '@angular/core/testing';
// import { provideMockActions } from '@ngrx/effects/testing';
// import { Action } from '@ngrx/store';
// import { MockStore, provideMockStore } from '@ngrx/store/testing';
// import { ReplaySubject } from 'rxjs';

// import { initialState, ItemId, Mocks, RecipeId } from 'src/tests';
// import * as Settings from '.';
// import { LabState } from '..';
// import * as Recipes from '../recipes';
// import * as Actions from './settings.actions';
// import { SettingsEffects } from './settings.effects';

// describe('SettingsEffects', () => {
//   let effects: SettingsEffects;
//   let actions: ReplaySubject<unknown>;
//   let mockStore: MockStore<LabState>;

//   beforeEach(async () => {
//     TestBed.configureTestingModule({
//       providers: [
//         provideMockStore({
//           initialState: {
//             ...initialState,
//             ...{
//               recipesState: {
//                 [ItemId.Coal]: { beacons: [] },
//               },
//             },
//           },
//         }),
//         provideMockActions(() => actions),
//         SettingsEffects,
//       ],
//     });

//     effects = TestBed.inject(SettingsEffects);
//     mockStore = TestBed.inject(MockStore);
//     mockStore.overrideSelector(
//       Recipes.selectRecipesState,
//       Mocks.RecipesStateInitial,
//     );
//     mockStore.overrideSelector(Settings.selectDataset, Mocks.AdjustedDataset);
//     mockStore.refreshState();
//   });

//   afterEach(() => mockStore.resetSelectors());

//   describe('resetRecipeSetting$', () => {
//     it('should reset modules when machine is implicitly changed', () => {
//       actions = new ReplaySubject(1);
//       actions.next(
//         Actions.remove({
//           id: ItemId.AssemblingMachine3,
//           def: Mocks.Defaults.machineRankIds,
//         }),
//       );
//       const results: Action[] = [];
//       effects.resetRecipeSettings$.subscribe((a) => results.push(a));
//       const mock = mockStore.overrideSelector(
//         Recipes.selectRecipesState,
//         Mocks.RecipesStateInitial,
//       );
//       mockStore.refreshState();
//       mock.setResult({
//         ...Mocks.RecipesStateInitial,
//         ...{
//           [RecipeId.Coal]: {
//             ...Mocks.RecipesStateInitial,
//             ...{ machineId: ItemId.AssemblingMachine1 },
//           },
//         },
//       });
//       mockStore.refreshState();
//       expect(results).toEqual([
//         Recipes.resetRecipeMachines({ ids: [RecipeId.Coal] }),
//       ]);
//     });
//   });
// });
