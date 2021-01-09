import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Dataset } from '~/models';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

@Component({
  selector: 'lab-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleComponent extends DialogContainerComponent {
  @Input() data: Dataset;
  @Input() title: string;
  @Input() selected: string[];

  @Output() selectIds = new EventEmitter<string[]>();

  edited = false;
  editValue: string[];

  get width(): number {
    return (
      Math.ceil(Math.sqrt(this.data.complexRecipeIds.length) + 2) * 2.375 + 3
    );
  }

  constructor() {
    super();
  }

  clickOpen(): void {
    this.open = true;
    this.edited = false;
    this.editValue = [...this.selected];
  }

  close(): void {
    if (this.edited) {
      this.selectIds.emit(this.editValue);
    }
    this.open = false;
  }

  clickId(id: string, event: MouseEvent): void {
    this.edited = true;
    if (this.editValue.indexOf(id) === -1) {
      this.editValue.push(id);
    } else {
      this.editValue = this.editValue.filter((i) => i !== id);
    }
    event.stopPropagation();
  }
}
