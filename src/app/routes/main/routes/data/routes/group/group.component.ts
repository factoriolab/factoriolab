import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';

import { CollectionTableComponent } from '~/components/collection-table/collection-table.component';
import { Group } from '~/models/data/group';
import { IconClassPipe } from '~/pipes/icon-class.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';

import { DetailComponent } from '../../models/detail.component';

@Component({
  selector: 'lab-group',
  standalone: true,
  imports: [
    BreadcrumbModule,
    CollectionTableComponent,
    IconClassPipe,
    TranslatePipe,
  ],
  templateUrl: './group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupComponent extends DetailComponent {
  obj = computed<Group | undefined>(() => this.data().groupEntities[this.id()]);
  breadcrumb = computed<MenuItem[]>(() => [
    this.parent() ?? {},
    { label: this.obj()?.name },
  ]);
  itemIds = computed(() => {
    const data = this.data();
    const id = this.id();
    return data.itemIds.filter((i) => data.itemEntities[i].group === id);
  });
  recipeIds = computed(() => {
    const data = this.data();
    const id = this.id();
    return data.recipeIds.filter((r) => data.recipeEntities[r].group === id);
  });
}
