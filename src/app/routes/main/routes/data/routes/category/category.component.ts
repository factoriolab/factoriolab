import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';

import { CollectionTableComponent } from '~/components';
import { Category } from '~/models';
import { IconClassPipe, TranslatePipe } from '~/pipes';
import { DetailComponent } from '../../models';

@Component({
  standalone: true,
  imports: [
    BreadcrumbModule,
    CollectionTableComponent,
    IconClassPipe,
    TranslatePipe,
  ],
  templateUrl: './category.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent extends DetailComponent {
  obj = computed<Category | undefined>(
    () => this.data().categoryEntities[this.id()],
  );
  breadcrumb = computed<MenuItem[]>(() => [
    this.parent() ?? {},
    { label: this.obj()?.name },
  ]);
  itemIds = computed(() => {
    const data = this.data();
    const id = this.id();
    return data.itemIds.filter((i) => data.itemEntities[i].category === id);
  });
  recipeIds = computed(() => {
    const data = this.data();
    const id = this.id();
    return data.recipeIds.filter((r) => data.recipeEntities[r].category === id);
  });
}
