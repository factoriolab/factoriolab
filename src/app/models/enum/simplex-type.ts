import { SelectItem } from 'primeng/api';

export enum SimplexType {
  JsBigIntRational,
  WasmFloat64,
}

export const simplexTypeOptions: SelectItem<SimplexType>[] = [
  {
    label: 'options.simplexType.jsBigIntRational',
    value: SimplexType.JsBigIntRational,
  },
  { label: 'options.simplexType.wasmFloat64', value: SimplexType.WasmFloat64 },
];
