import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lab-list',
  imports: [],
  templateUrl: './list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex' },
})
export class List {}
