import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Entities } from '~/models';
import { DatasetState } from '~/store/dataset';

@Component({
  selector: 'lab-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleComponent {
  @Input() data: DatasetState;
  @Input() recipeDisabled: Entities<boolean>;

  @Output() cancel = new EventEmitter();
  @Output() enableRecipe = new EventEmitter<string>();
  @Output() disableRecipe = new EventEmitter<string>();

  opening = true;

  get complexRecipes() {
    return this.data.recipeIds.filter((r) => !this.data.itemEntities[r]);
  }

  constructor(private element: ElementRef) {}

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent) {
    if (this.opening) {
      this.opening = false;
    } else if (!this.element.nativeElement.contains(event.target)) {
      this.cancel.emit();
    }
  }

  clickId(id: string, event: MouseEvent) {
    if (this.recipeDisabled[id]) {
      this.enableRecipe.emit(id);
    } else {
      this.disableRecipe.emit(id);
    }
    event.stopPropagation();
  }
}
