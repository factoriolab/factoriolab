import { Pipe, PipeTransform } from '@angular/core';
import * as Color from 'color-bits';

@Pipe({ name: 'isLight' })
export class IsLightPipe implements PipeTransform {
  transform(
    iconId: string,
    iconColor: Record<string, string> | null | undefined,
  ): boolean {
    const value = iconColor?.[iconId];
    if (!value) return false;
    const color = Color.parse(value);
    return Color.getLuminance(color) > 0.9;
  }
}
