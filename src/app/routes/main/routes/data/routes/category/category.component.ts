import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { MenuItem } from 'primeng/api';

import { AppSharedModule } from '~/app-shared.module';
import { Category } from '~/models';
import { DataSharedModule } from '../../data-shared.module';
import { DetailComponent } from '../../models';

@Component({
  standalone: true,
  imports: [AppSharedModule, DataSharedModule],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent extends DetailComponent {
  obj = computed<Category | undefined>(
    () => this.data().categoryEntities[this.id()],
  );
  breadcrumb = computed<MenuItem[]>(() => [
    this.parent(),
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
