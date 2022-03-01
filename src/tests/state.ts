import { State } from '~/store';
import { initialDatasetsState } from '~/store/datasets';
import { initialFactoriesState } from '~/store/factories';
import { initialItemsState } from '~/store/items';
import { initialPreferencesState } from '~/store/preferences';
import { initialProductsState } from '~/store/products';
import { initialRecipesState } from '~/store/recipes';
import { initialSettingsState } from '~/store/settings';

export const initialState: State = {
  datasetsState: initialDatasetsState,
  productsState: initialProductsState,
  itemsState: initialItemsState,
  recipesState: initialRecipesState,
  factoriesState: initialFactoriesState,
  settingsState: initialSettingsState,
  preferencesState: initialPreferencesState,
};
