import { Pipe, PipeTransform } from '@angular/core';

import { RecipeJson } from '~/models/data/recipe';

/**
 * Does not do any actual checking, mainly used to restore typing inside
 * templates which cast to `any`
 */
@Pipe({ name: 'asRecipe', standalone: true })
export class AsRecipePipe implements PipeTransform {
  transform(value: unknown): RecipeJson {
    return value as RecipeJson;
  }
}
