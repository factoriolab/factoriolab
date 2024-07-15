import {
  ChangeDetectorRef,
  Component,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({ template: '' })
abstract class ModalComponent {
  cancel = signal(false);
}

@Component({ template: '' })
export abstract class DialogComponent extends ModalComponent {
  ref = inject(ChangeDetectorRef);

  visible = false;

  hide(cancel?: true): void {
    if (cancel === true) this.cancel.set(cancel);
    this.visible = false;
  }

  show(): void {
    this.cancel.set(false);
    this.visible = true;
    this.ref.markForCheck();
  }

  onHide(): void {
    if (this.cancel()) return;
    this.save();
  }

  abstract save(): void;
}

@Component({ template: '' })
export abstract class OverlayComponent extends ModalComponent {
  @ViewChild(OverlayPanel) overlayPanel?: OverlayPanel;

  hide(cancel?: true): void {
    if (cancel === true) this.cancel.set(cancel);
    this.overlayPanel?.hide();
  }

  protected _show(event: Event): void {
    this.cancel.set(false);
    this.overlayPanel?.toggle(event);
  }

  onHide(): void {
    if (this.cancel()) return;
    this.save();
  }

  abstract save(): void;
}
