import { LabState } from '~/store';
import * as Datasets from '~/store/datasets';
import { initialFactoriesState } from '~/store/factories';
import { initialItemsState } from '~/store/items';
import { initialPreferencesState } from '~/store/preferences';
import { initialProductsState } from '~/store/products';
import { initialRecipesState } from '~/store/recipes';
import { initialSettingsState } from '~/store/settings';
import { Mocks } from './';

const datasetsState = Datasets.datasetsReducer(
  undefined,
  new Datasets.LoadModAction({
    data: {
      id: initialSettingsState.modId,
      value: Mocks.Data,
    },
    hash: {
      id: initialSettingsState.modId,
      value: Mocks.Hash,
    },
    i18n: null,
  })
);

export const initialState: LabState = {
  datasetsState,
  productsState: initialProductsState,
  itemsState: initialItemsState,
  recipesState: initialRecipesState,
  factoriesState: initialFactoriesState,
  settingsState: initialSettingsState,
  preferencesState: initialPreferencesState,
};
