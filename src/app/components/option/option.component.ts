import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'lab-option',
  imports: [],
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'option', tabindex: '0' },
})
export class OptionComponent<T> {
  value = input.required<T>();
  disabled = input<boolean>();
}
