import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
} from '@angular/core';

import { Dataset } from '~/models';
import { TrackService } from '~/services';
import { DialogContainerComponent } from '../dialog/dialog-container.component';

@Component({
  selector: 'lab-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleComponent extends DialogContainerComponent {
  @ViewChild('scrollContainer') scrollContainer: ElementRef<HTMLElement>;

  @Input() data: Dataset;
  @Input() selected: string[];

  @Output() selectIds = new EventEmitter<string[]>();

  edited = false;
  editValue: string[];
  search: boolean;
  searchValue: string;
  complexRecipeIds: string[];
  scrollTop = 0;

  get width(): number {
    return (
      Math.ceil(Math.sqrt(this.data.complexRecipeIds.length) + 2) * 2.375 + 3
    );
  }

  constructor(public track: TrackService) {
    super();
  }

  clickOpen(): void {
    this.open = true;
    this.edited = false;
    this.search = false;
    this.searchValue = '';
    this.complexRecipeIds = this.data.complexRecipeIds;
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

  inputSearch(): void {
    // Filter for matching recipe ids
    let recipeIds = this.data.complexRecipeIds;
    for (const term of this.searchValue.split(' ')) {
      const regExp = new RegExp(term, 'i');
      recipeIds = recipeIds.filter(
        (i) => this.data.recipeEntities[i].name.search(regExp) !== -1
      );
    }
    this.complexRecipeIds = recipeIds;
  }

  /** Store scrollTop value on component to improve performance */
  scrollPanel(): void {
    this.scrollTop = this.scrollContainer.nativeElement.scrollTop;
  }
}
