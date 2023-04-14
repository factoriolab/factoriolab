import { RouterModule, Routes } from '@angular/router';

import { DataComponent } from './data.component';

export const routes: Routes = [
  {
    path: '',
    component: DataComponent,
    children: [
      {
        path: 'category/:id',
        loadComponent: () =>
          import('./routes/category/category.component').then(
            (c) => c.CategoryComponent
          ),
      },
      {
        path: 'item/:id',
        loadComponent: () =>
          import('./routes/item/item.component').then((c) => c.ItemComponent),
      },
      {
        path: 'recipe/:id',
        loadComponent: () =>
          import('./routes/recipe/recipe.component').then(
            (c) => c.RecipeComponent
          ),
      },
    ],
  },
];

export const DataRoutingModule = RouterModule.forChild(routes);
