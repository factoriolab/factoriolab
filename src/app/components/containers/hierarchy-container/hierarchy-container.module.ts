import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { HierarchyRoutingModule } from './hierarchy-container-routing.module';
import { HierarchyContainerComponent } from './hierarchy-container.component';
import { SunburstComponent } from './sunburst/sunburst.component';

@NgModule({
  imports: [CommonModule, HierarchyRoutingModule],
  declarations: [HierarchyContainerComponent, SunburstComponent],
})
export class HierarchyContainerModule {}
