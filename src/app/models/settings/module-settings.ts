import { Rational } from '../rational';

export interface ModuleSettings {
  count?: Rational;
  id?: string;
}

export function areModuleSettingsEqual(
  a: ModuleSettings,
  b: ModuleSettings,
): boolean {
  return a.count?.toString() === b.count?.toString() && a.id === b.id;
}
