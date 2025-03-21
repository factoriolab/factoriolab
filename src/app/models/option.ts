export interface Option<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}
