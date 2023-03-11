import {
  Datasets,
  ItemsCfg,
  ItemsObj,
  LabState,
  MachinesCfg,
  Preferences,
  RecipesCfg,
  RecipesObj,
  Settings,
} from '~/store';
import { Mocks } from './';

const datasetsState = Datasets.datasetsReducer(
  undefined,
  new Datasets.LoadModAction({
    data: {
      id: Settings.initialSettingsState.modId,
      value: Mocks.Data,
    },
    hash: {
      id: Settings.initialSettingsState.modId,
      value: Mocks.Hash,
    },
    i18n: null,
  })
);

export const initialState: LabState = {
  datasetsState,
  itemsObjState: ItemsObj.initialItemsObjState,
  recipesObjState: RecipesObj.initialRecipeObjectivesState,
  itemsCfgState: ItemsCfg.initialItemsCfgState,
  recipesCfgState: RecipesCfg.initialRecipesState,
  machinesCfgState: MachinesCfg.initialMachinesCfgState,
  settingsState: Settings.initialSettingsState,
  preferencesState: Preferences.initialPreferencesState,
};
