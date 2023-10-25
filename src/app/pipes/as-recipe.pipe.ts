import { Pipe, PipeTransform } from '@angular/core';

import { Recipe } from '~/models';

/**
 * Does not do any actual checking, mainly used to restore typing inside
 * templates which cast to `any`
 */
@Pipe({ name: 'asRecipe' })
export class AsRecipePipe implements PipeTransform {
  transform(value: unknown): Recipe {
    return value as Recipe;
  }
}
