import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';

import { Category } from '~/models/data/category';
import { IconClassPipe } from '~/pipes/icon-class.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';

import { DetailComponent } from '../../models/detail.component';

@Component({
  selector: 'lab-location',
  standalone: true,
  imports: [BreadcrumbModule, IconClassPipe, TranslatePipe],
  templateUrl: './location.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationComponent extends DetailComponent {
  obj = computed<Category | undefined>(
    () => this.data().locationEntities[this.id()],
  );
  breadcrumb = computed<MenuItem[]>(() => [
    this.parent() ?? {},
    { label: this.obj()?.name },
  ]);
}
