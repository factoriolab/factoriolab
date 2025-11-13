import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Breadcrumb } from '~/components/breadcrumb/breadcrumb';
import { Icon } from '~/components/icon/icon';
import { IconType } from '~/data/icon-type';
import { Category } from '~/data/schema/category';
import { Item } from '~/data/schema/item';
import { Recipe } from '~/data/schema/recipe';
import { LinkOption } from '~/option/link-option';
import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'lab-detail',
  imports: [Breadcrumb, Icon, TranslatePipe],
  templateUrl: './detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Detail {
  readonly crumbs = input.required<LinkOption[]>();
  readonly obj = input.required<Category | Item | Recipe | undefined>();
  readonly type = input.required<IconType>();
}
