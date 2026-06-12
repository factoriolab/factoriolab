import { Pipe, PipeTransform } from '@angular/core';
import * as Color from 'color-bits';

@Pipe({ name: 'isLight' })
export class IsLightPipe implements PipeTransform {
  transform(color: string | undefined): boolean {
    if (!color) return false;
    try {
      const parsed = Color.parse(color);
      return Color.getLuminance(parsed) > 0.9;
    } catch {
      return false;
    }
  }
}
