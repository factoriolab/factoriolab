import { Pipe, PipeTransform } from '@angular/core';

import { DisplayService } from '~/services';

@Pipe({ name: 'invertArray' })
export class InvertArrayPipe implements PipeTransform {
  constructor(private displaySvc: DisplayService) {}

  transform(value: string[], all: string[]): string[] {
    return this.displaySvc.invertArray(value, all);
  }
}
