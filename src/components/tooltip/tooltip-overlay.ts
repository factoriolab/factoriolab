import { STANDARD_DROPDOWN_BELOW_POSITIONS } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { cva } from 'class-variance-authority';

import { TOOLTIP_DATA } from './tooltip-data';

const host = cva(
  'bg-gray-950 border rounded-xs border-gray-700 p-2 animate-fade-in relative',
  {
    variants: {
      position: {
        above: 'mb-1.5',
        right: 'ms-1.5',
        below: 'mt-1.5',
        left: 'me-1.5',
      },
    },
  },
);

const nub = cva(
  'absolute size-1.75 border-gray-700 bg-gray-950 m-auto border-b border-r',
  {
    variants: {
      position: {
        above: '-bottom-1 left-3 rotate-45',
        right: 'top-0 bottom-0 -left-1 rotate-135',
        below: '-top-1 left-3 rotate-225',
        left: 'top-0 -right-1 bottom-0 rotate-315',
      },
    },
  },
);

@Component({
  selector: 'lab-tooltip-overlay',
  templateUrl: './tooltip-overlay.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
  },
})
export class TooltipOverlay implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly data = inject(TOOLTIP_DATA);

  /**
   * Assume preferred position is taken instead of waiting, so that content is
   * rendered on first cycle (need to know tooltip size to determine what the
   * final position should be)
   */
  private readonly connectedPosition = signal(
    STANDARD_DROPDOWN_BELOW_POSITIONS[0],
  );
  protected readonly position = computed(() => {
    const cp = this.connectedPosition();
    return cp.overlayX === 'start'
      ? cp.overlayY === 'bottom'
        ? 'above'
        : cp.overlayY === 'top'
          ? 'below'
          : 'right'
      : 'left';
  });

  protected readonly hostClass = computed(() =>
    host({ position: this.position() }),
  );
  protected readonly nubClass = computed(() =>
    nub({ position: this.position() }),
  );

  ngOnInit(): void {
    this.data.positionChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((p) => {
        this.connectedPosition.set(p.connectionPair);
      });
  }
}
