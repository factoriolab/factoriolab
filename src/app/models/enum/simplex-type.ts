import { SelectItem } from 'primeng/api';

export enum SimplexType {
  Disabled,
  JsBigIntRational,
  WasmFloat64,
}

export const simplexTypeOptions: SelectItem<SimplexType>[] = [
  {
    label: 'options.simplexType.jsBigIntRational',
    value: SimplexType.JsBigIntRational,
  },
  { label: 'options.simplexType.wasmFloat64', value: SimplexType.WasmFloat64 },
  { label: 'options.simplexType.disabled', value: SimplexType.Disabled },
];
