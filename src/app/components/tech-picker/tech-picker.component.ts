import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable, Subject } from 'rxjs';

import { Dataset } from '~/models';
import { LabState } from '~/store';

type UnlockStatus = 'available' | 'locked' | 'researched';

@Component({
  selector: 'lab-tech-picker',
  templateUrl: './tech-picker.component.html',
  styleUrls: ['./tech-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechPickerComponent {
  @Output() selectIds = new EventEmitter<string[] | null>();

  selectAllCtrl = new FormControl(false);

  data$ = new Subject<Dataset>();
  selection$ = new Subject<string[]>();
  status$: Observable<Record<UnlockStatus, string[]>> = combineLatest([
    this.selection$,
    this.data$,
  ]).pipe(
    map(([selection, data]) => {
      const researched = selection;
      const available: string[] = [];
      const locked: string[] = [];
      for (const id of data.technologyIds) {
        if (selection.indexOf(id) === -1) {
          const tech = data.technologyEntities[id];

          if (
            tech.prerequisites == null ||
            tech.prerequisites.every((p) => selection.indexOf(p) !== -1)
          ) {
            available.push(id);
          } else {
            locked.push(id);
          }
        }
      }

      return { available, locked, researched };
    })
  );
  vm$ = combineLatest([this.selection$, this.status$, this.data$]).pipe(
    map(([selection, status, data]) => ({ selection, status, data }))
  );
  visible = false;

  constructor(private ref: ChangeDetectorRef, private store: Store<LabState>) {}

  clickOpen(data: Dataset, selection: string[] | null): void {
    this.data$.next(data);
    selection = [...(selection ?? data.technologyIds)];
    this.selection$.next(selection);
    this.selectAllCtrl.setValue(selection.length === data.technologyIds.length);
    this.visible = true;
    this.ref.markForCheck();
  }

  selectAll(value: boolean, data: Dataset): void {
    this.selection$.next(value ? [...data.technologyIds] : []);
  }

  clickId(id: string, selection: string[], data: Dataset): void {
    selection = [...selection];
    const index = selection.indexOf(id);
    if (index === -1) {
      selection.push(id);

      // Add any technologies whose prerequisites were not previously met
      let addIds: Set<string>;
      do {
        addIds = new Set<string>();

        for (const id of selection) {
          const tech = data.technologyEntities[id];
          tech.prerequisites
            ?.filter((p) => selection.indexOf(p) === -1)
            .forEach((p) => addIds.add(p));
        }

        selection.push(...addIds);
      } while (addIds.size);
    } else {
      selection.splice(index, 1);

      // Filter out any technologies whose prerequisites are no longer met
      let removeIds: Set<string>;
      do {
        removeIds = new Set<string>();

        for (const id of selection) {
          const tech = data.technologyEntities[id];
          if (tech.prerequisites?.some((p) => selection.indexOf(p) === -1)) {
            removeIds.add(id);
          }
        }

        selection = selection.filter((s) => !removeIds.has(s));
      } while (removeIds.size);
    }

    this.selection$.next(selection);
    this.selectAllCtrl.setValue(selection.length === data.technologyIds.length);
  }

  onHide(selection: string[], data: Dataset): void {
    this.selectIds.emit(
      selection.length === data.technologyIds.length ? null : selection
    );
  }
}
