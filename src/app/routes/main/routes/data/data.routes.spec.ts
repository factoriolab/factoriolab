import { DataComponent } from './data.component';
import { routes } from './data.routes';
import { CategoryComponent } from './routes/category/category.component';
import { CollectionComponent } from './routes/collection/collection.component';
import { ItemComponent } from './routes/item/item.component';
import { LocationComponent } from './routes/location/location.component';
import { RecipeComponent } from './routes/recipe/recipe.component';

describe('Data Routes', () => {
  it('should load child routes', async () => {
    expect(await routes[0].loadComponent!()).toEqual(CategoryComponent);
    expect(await routes[1].loadComponent!()).toEqual(CollectionComponent);
    expect(await routes[2].loadComponent!()).toEqual(ItemComponent);
    expect(await routes[3].loadComponent!()).toEqual(CollectionComponent);
    expect(await routes[4].loadComponent!()).toEqual(ItemComponent);
    expect(await routes[5].loadComponent!()).toEqual(CollectionComponent);
    expect(await routes[6].loadComponent!()).toEqual(ItemComponent);
    expect(await routes[7].loadComponent!()).toEqual(CollectionComponent);
    expect(await routes[8].loadComponent!()).toEqual(ItemComponent);
    expect(await routes[9].loadComponent!()).toEqual(CollectionComponent);
    expect(await routes[10].loadComponent!()).toEqual(ItemComponent);
    expect(await routes[11].loadComponent!()).toEqual(CollectionComponent);
    expect(await routes[12].loadComponent!()).toEqual(ItemComponent);
    expect(await routes[13].loadComponent!()).toEqual(CollectionComponent);
    expect(await routes[14].loadComponent!()).toEqual(ItemComponent);
    expect(await routes[15].loadComponent!()).toEqual(CollectionComponent);
    expect(await routes[16].loadComponent!()).toEqual(ItemComponent);
    expect(await routes[17].loadComponent!()).toEqual(CollectionComponent);
    expect(await routes[18].loadComponent!()).toEqual(ItemComponent);
    expect(await routes[19].loadComponent!()).toEqual(CollectionComponent);
    expect(await routes[20].loadComponent!()).toEqual(ItemComponent);
    expect(await routes[21].loadComponent!()).toEqual(CollectionComponent);
    expect(await routes[22].loadComponent!()).toEqual(RecipeComponent);
    expect(await routes[23].loadComponent!()).toEqual(CollectionComponent);
    expect(await routes[24].loadComponent!()).toEqual(LocationComponent);
    expect(await routes[25].loadComponent!()).toEqual(CollectionComponent);
    expect(await routes[26].loadComponent!()).toEqual(DataComponent);
  });
});
