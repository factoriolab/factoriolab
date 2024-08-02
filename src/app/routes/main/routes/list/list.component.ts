import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';
import { MainSharedModule } from '../../main-shared.module';

@Component({
  standalone: true,
  imports: [AppSharedModule, MainSharedModule],
  templateUrl: './list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {}
