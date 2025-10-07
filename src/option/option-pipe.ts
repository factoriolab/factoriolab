import { Pipe, PipeTransform } from '@angular/core';

import { Option } from './option';

@Pipe({ name: 'option' })
export class OptionPipe implements PipeTransform {
  transform<T>(value: T, options: Option<T>[]): Option<T> | undefined {
    return options.find((o) => o.value === value);
  }
}
