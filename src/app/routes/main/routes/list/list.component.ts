import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StepsComponent } from '~/components/steps/steps.component';

@Component({
  selector: 'lab-list',
  standalone: true,
  imports: [StepsComponent],
  templateUrl: './list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {}
