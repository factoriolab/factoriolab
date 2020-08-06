import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy,
  HostBinding,
} from '@angular/core';

import { Dataset, DefaultTogglePayload } from '~/models';

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
  @Input() disabledRecipes: string[];
  @Input() default: string[];
  @Input() parent: HTMLElement;

  @Output() cancel = new EventEmitter();
  @Output() enableRecipe = new EventEmitter<DefaultTogglePayload>();
  @Output() disableRecipe = new EventEmitter<DefaultTogglePayload>();

  opening = true;
  complexRecipes: string[] = [];

  @HostBinding('style.top.px') get top() {
    return this.parent ? this.parent.getBoundingClientRect().y + 1 : 1;
  }

  @HostBinding('style.left.px') get left() {
    return this.parent ? this.parent.getBoundingClientRect().x - 8 : 1;
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

  isDisabled(id: string) {
    return this.disabledRecipes.some((r) => r === id);
  }

  clickId(id: string, event: MouseEvent) {
    if (this.isDisabled(id)) {
      this.enableRecipe.emit({ id, default: this.default });
    } else {
      this.disableRecipe.emit({ id, default: this.default });
    }
    event.stopPropagation();
  }
}
