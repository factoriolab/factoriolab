import { Pipe, PipeTransform } from '@angular/core';
import chroma from 'chroma-js';

@Pipe({ name: 'isLight' })
export class IsLightPipe implements PipeTransform {
  transform(color: string | undefined): boolean {
    if (!color) return false;
    try {
      return chroma(color).luminance() > 0.9;
    } catch {
      return false;
    }
  }
}
