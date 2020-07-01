import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';

import { RecipeId } from '~/models';
import { DatasetState } from '~/store/dataset';

@Component({
  selector: 'lab-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleComponent {
  @Input() data: DatasetState;
  @Input() disabledRecipes: RecipeId[];

  @Output() cancel = new EventEmitter();
  @Output() enableRecipe = new EventEmitter<RecipeId>();
  @Output() disableRecipe = new EventEmitter<RecipeId>();

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

  isDisabled(id: RecipeId) {
    return this.disabledRecipes.indexOf(id) !== -1;
  }

  clickId(id: RecipeId, event: MouseEvent) {
    if (this.isDisabled(id)) {
      this.enableRecipe.emit(id);
    } else {
      this.disableRecipe.emit(id);
    }
    event.stopPropagation();
  }

  clickCancel(event: MouseEvent) {
    this.cancel.emit();
    event.stopPropagation();
  }
}
