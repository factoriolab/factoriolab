import { DialogData } from '../dialog/dialog';

export interface PickerData extends DialogData {
  type: 'item' | 'recipe';
  allIds: string[] | Set<string>;
  selection?: string | Set<string>;
  default?: string[];
}
