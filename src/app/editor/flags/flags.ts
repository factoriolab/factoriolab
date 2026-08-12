import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lab-flags-editor',
  template: 'flags',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagsEditor {}
