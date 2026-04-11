import { Pipe, PipeTransform } from '@angular/core';

import { baseRecipeId } from '~/models/data/recipe';
import { IdType } from '~/models/enum/id-type';
import { QUALITY_REGEX } from '~/models/enum/quality';
import { Optional } from '~/models/utils';

@Pipe({ name: 'iconClass', standalone: true })
export class IconClassPipe implements PipeTransform {
  static transform(value: Optional<string>, type: IdType = 'item'): string {
    if (value == null) return '';
    // Strip fuel variant suffix for recipe icons (e.g. iron-plate|f:coal → iron-plate)
    if (type === 'recipe') value = baseRecipeId(value);
    const q = QUALITY_REGEX.exec(value);
    if (q) return `lab-icon ${type} ${q[1]} q${q[2]}`;
    return `lab-icon ${type} ${value}`;
  }

  transform(value: Optional<string>, type: IdType = 'item'): string {
    return IconClassPipe.transform(value, type);
  }
}

@Pipe({ name: 'iconSmClass', standalone: true })
export class IconSmClassPipe implements PipeTransform {
  static transform(value: Optional<string>, type: IdType = 'item'): string {
    if (value == null) return '';
    return `${IconClassPipe.transform(value, type)} sm`;
  }

  transform(value: Optional<string>, type: IdType = 'item'): string {
    return IconSmClassPipe.transform(value, type);
  }
}
