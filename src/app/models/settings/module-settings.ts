import { Rational } from '../rational';

export interface ModuleSettings {
  count?: Rational;
  id?: string;
}

export function moduleSettingsPayload(
  value: ModuleSettings[] | undefined,
  def: ModuleSettings[] | undefined,
): ModuleSettings[] | undefined {
  if (JSON.stringify(value) === JSON.stringify(def)) return undefined;

  console.log(JSON.stringify(value), JSON.stringify(def));

  // TODO: Compare individual module entries and mark properties as `undefined`
  // where properties match defaults

  return value;
}
