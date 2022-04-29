import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

import { Dataset } from '~/models';
import { LabState } from '~/store';
import * as Recipes from '~/store/recipes';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

@Component({
  selector: 'lab-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleComponent extends DialogContainerComponent {
  @Input() selected: string[] = [];

  @Output() selectIds = new EventEmitter<string[]>();

  @ViewChild('scrollContainer') scrollContainer:
    | ElementRef<HTMLElement>
    | undefined;

  vm$ = this.store.select(Recipes.getAdjustedDataset).pipe(
    map((data) => ({
      data,
      width: Math.ceil(Math.sqrt(data.complexRecipeIds.length) + 2) * 2.375 + 3,
    }))
  );

  complexRecipeIds: string[] = [];
  edited = false;
  editValue: string[] = [];
  scrollTop = 0;
  search = false;
  searchValue = '';

  constructor(private store: Store<LabState>) {
    super();
  }

  clickOpen(data: Dataset): void {
    this.open = true;
    this.edited = false;
    this.search = false;
    this.searchValue = '';
    this.complexRecipeIds = data.complexRecipeIds;
    this.editValue = [...this.selected];
  }

  close(): void {
    if (this.edited) {
      this.selectIds.emit(this.editValue);
    }
    this.open = false;
  }

  clickId(id: string): void {
    this.edited = true;
    if (this.editValue.indexOf(id) === -1) {
      this.editValue.push(id);
    } else {
      this.editValue = this.editValue.filter((i) => i !== id);
    }
  }

  inputSearch(data: Dataset): void {
    // Filter for matching recipe ids
    let recipeIds = data.complexRecipeIds;
    for (const term of this.searchValue.split(' ')) {
      const regExp = new RegExp(term, 'i');
      recipeIds = recipeIds.filter(
        (i) => data.recipeEntities[i].name.search(regExp) !== -1
      );
    }
    this.complexRecipeIds = recipeIds;
  }

  /** Store scrollTop value on component to improve performance */
  scrollPanel(): void {
    if (this.scrollContainer) {
      this.scrollTop = this.scrollContainer.nativeElement.scrollTop;
    }
  }
}
