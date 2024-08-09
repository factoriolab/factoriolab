import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StepsComponent } from '~/components';

@Component({
  standalone: true,
  imports: [StepsComponent],
  templateUrl: './list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {}
