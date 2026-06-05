import { IconType } from '~/data/icon-type';
import { LinkOption } from '~/option/link-option';

import { CollectionKey } from './collection-key';

export interface CollectionOption extends LinkOption {
  key: CollectionKey;
  iconType: IconType;
}
