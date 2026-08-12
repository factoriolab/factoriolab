import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lab-version-editor',
  template: 'version',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionEditor {}
