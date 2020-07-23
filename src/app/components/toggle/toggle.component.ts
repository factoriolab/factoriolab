import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Entities, Dataset } from '~/models';

@Component({
  selector: 'lab-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleComponent {
  _data: Dataset;
  @Input() set data(value: Dataset) {
    this._data = value;
    const simpleRecipes = Object.keys(value.itemRecipeIds).map(
      (i) => value.itemRecipeIds[i]
    );
    this.complexRecipes = value.recipeIds.filter(
      (r) => simpleRecipes.indexOf(r) === -1
    );
  }
  get data() {
    return this._data;
  }
  @Input() recipeDisabled: Entities<boolean>;

  @Output() cancel = new EventEmitter();
  @Output() enableRecipe = new EventEmitter<string>();
  @Output() disableRecipe = new EventEmitter<string>();

  opening = true;
  complexRecipes: string[] = [];

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
