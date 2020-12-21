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

import { Dataset, ItemId } from '~/models';

@Component({
  selector: 'lab-ranker',
  templateUrl: './ranker.component.html',
  styleUrls: ['./ranker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankerComponent {
  @Input() data: Dataset;
  @Input() set rank(value: string[]) {
    this.editValue = [...value];
  }
  @Input() options: string[];
  @Input() parent: HTMLElement;

  @Output() cancel = new EventEmitter();
  @Output() commit = new EventEmitter<string[]>();

  opening = true;
  edited = false;
  editValue: string[];

  ItemId = ItemId;

  @HostBinding('style.top.px') get top() {
    return this.parent ? this.parent.getBoundingClientRect().y - 8 : -8;
  }

  @HostBinding('style.left.px') get left() {
    return this.parent ? this.parent.getBoundingClientRect().x - 8 : -8;
  }

  @HostBinding('style.width.rem') get width() {
    const buttons = this.options.length + 1;
    const iconsPerRow = buttons <= 4 ? buttons : Math.ceil(Math.sqrt(buttons));
    return iconsPerRow * 2.25 + 1.25;
  }

  constructor(private element: ElementRef) {}

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent) {
    if (this.opening) {
      this.opening = false;
    } else if (!this.element.nativeElement.contains(event.target)) {
      if (this.edited) {
        this.commit.emit(this.editValue);
      }
      this.cancel.emit();
    }
  }

  text(id: string) {
    if (this.editValue.length > 1 && this.editValue.indexOf(id) !== -1) {
      return this.editValue.indexOf(id) + 1;
    }
    return null;
  }

  canAdd(id: string) {
    if (!this.edited || id === ItemId.Module) {
      return true;
    }

    if (this.editValue.indexOf(id) !== -1) {
      return false;
    }

    const lim = this.data.itemEntities[id].module.limitation;
    return (
      !lim ||
      !this.editValue.some(
        (i) => this.data.itemEntities[i].module.limitation === lim
      )
    );
  }

  clickId(id: string, event: MouseEvent) {
    if (id === ItemId.Module) {
      this.commit.emit(this.editValue);
      this.cancel.emit();
    } else if (this.canAdd(id)) {
      if (!this.edited) {
        this.edited = true;
        this.editValue = [id];
      } else {
        this.editValue.push(id);
      }
      if (!this.data.itemEntities[id].module.limitation) {
        this.commit.emit(this.editValue);
        this.cancel.emit();
      }
    }
    event.stopPropagation();
  }
}
