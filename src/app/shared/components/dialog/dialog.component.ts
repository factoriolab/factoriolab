import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

@Component({
  selector: 'lab-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  @Output() closeDialog = new EventEmitter();

  opening = true;

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent): void {
    if (this.opening) {
      this.opening = false;
    } else if (
      !this.el.nativeElement.contains(event.target as Node) &&
      document.contains(event.target as Node)
    ) {
      this.closeDialog.emit();
    }
  }
}
