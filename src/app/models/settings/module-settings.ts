import { isArrayEqual } from '~/helpers';
import { Rational } from '../rational';

export interface ModuleSettings {
  count?: Rational;
  id?: string;
}

// export function isModuleSettingsEqual(
//   a: ModuleSettings,
//   b: ModuleSettings,
// ): boolean {
//   return a.count.eq(b.count) && a.id === b.id;
// }

// export function moduleSettingsPayload(
//   value: ModuleSettings[] | undefined,
//   def: ModuleSettings[] | undefined,
// ): ModuleSettings[] | undefined {
//   return isArrayEqual(value, def, isModuleSettingsEqual) ? undefined : value;
// }
