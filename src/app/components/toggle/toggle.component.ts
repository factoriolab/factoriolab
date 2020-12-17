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

import { Dataset } from '~/models';

@Component({
  selector: 'lab-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleComponent {
  @Input() data: Dataset;
  @Input() set disabledRecipes(value: string[]) {
    this.editValue = [...value];
  }
  @Input() parent: HTMLElement;

  @Output() cancel = new EventEmitter();
  @Output() commit = new EventEmitter<string[]>();

  opening = true;
  edited = false;
  editValue: string[];

  @HostBinding('style.top.px') get top() {
    return this.parent ? this.parent.getBoundingClientRect().y + 1 : 1;
  }

  @HostBinding('style.left.px') get left() {
    return this.parent ? this.parent.getBoundingClientRect().x + 1 : 1;
  }

  @HostBinding('style.width.rem') get width() {
    return (
      Math.ceil(Math.sqrt(this.data.complexRecipeIds.length) + 2) * 2.25 + 1.25
    );
  }

  constructor(private element: ElementRef) {}

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent) {
    if (this.opening) {
      this.opening = false;
    } else if (!this.element.nativeElement.contains(event.target)) {
      if (this.edited) {
        this.commit.emit(this.editValue);
      } else {
        this.cancel.emit();
      }
    }
  }

  clickId(id: string, event: MouseEvent) {
    this.edited = true;
    if (this.editValue.indexOf(id) === -1) {
      this.editValue.push(id);
    } else {
      this.editValue = this.editValue.filter((i) => i !== id);
    }
    event.stopPropagation();
  }
}
