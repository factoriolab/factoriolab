import {
  Overlay,
  OverlayRef,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  afterNextRender,
  Directive,
  ElementRef,
  inject,
  Injector,
  input,
  OnDestroy,
} from '@angular/core';

import { TOOLTIP_DATA, TooltipData } from './tooltip-data';
import { TooltipOverlay } from './tooltip-overlay';

@Directive({
  selector: '[labTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(touchstart)': 'show()',
    '(mouseleave)': 'hide()',
    '(touchend)': 'hide()',
  },
})
export class Tooltip implements OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  readonly labTooltip = input<string>();

  private overlayRef: OverlayRef | undefined;

  show(): void {
    const message = this.labTooltip();
    if (this.overlayRef || !message) return;

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withFlexibleDimensions(false)
      .withPositions(STANDARD_DROPDOWN_BELOW_POSITIONS);

    const data: TooltipData = {
      message,
      positionChanges: positionStrategy.positionChanges,
    };

    const injector = Injector.create({
      parent: this.injector,
      providers: [{ provide: TOOLTIP_DATA, useValue: data }],
    });

    const ref = this.overlay.create({ positionStrategy });
    ref.attach(new ComponentPortal(TooltipOverlay, undefined, injector));
    this.overlayRef = ref;

    /** Update position after next render to account for tooltip size */
    afterNextRender(
      () => {
        ref.updatePosition();
      },
      { injector: this.injector },
    );
  }

  hide(): void {
    if (!this.overlayRef) return;
    this.overlayRef.dispose();
    delete this.overlayRef;
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
