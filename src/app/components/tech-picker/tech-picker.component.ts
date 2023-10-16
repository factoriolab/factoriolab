import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { FilterService } from 'primeng/api';
import { combineLatest, map, Observable, ReplaySubject, startWith } from 'rxjs';

import { Dataset } from '~/models';
import { ContentService } from '~/services';
import { LabState, Preferences } from '~/store';

export type UnlockStatus = 'available' | 'locked' | 'researched';

@Component({
  selector: 'lab-tech-picker',
  templateUrl: './tech-picker.component.html',
  styleUrls: ['./tech-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechPickerComponent {
  @Output() selectIds = new EventEmitter<string[] | null>();

  filterCtrl = new FormControl('');
  selectAllCtrl = new FormControl(false);

  data$ = new ReplaySubject<Dataset>(1);
  selection$ = new ReplaySubject<string[]>(1);
  status$: Observable<Record<UnlockStatus, string[]>> = combineLatest([
    this.selection$,
    this.data$,
    this.filterCtrl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([selection, data, filter]) => {
      let technologyIds = data.technologyIds;
      if (filter) {
        const technologies = technologyIds.map((i) => data.itemEntities[i]);
        technologyIds = this.filterSvc
          .filter(technologies, ['name'], filter, 'contains')
          .map((t) => t.id);

        selection = selection.filter((i) => technologyIds.includes(i));
      }

      const set = new Set(selection);
      const researched = selection;
      const available: string[] = [];
      const locked: string[] = [];
      for (const id of technologyIds) {
        if (!set.has(id)) {
          const tech = data.technologyEntities[id];

          if (
            tech.prerequisites == null ||
            tech.prerequisites.every((p) => set.has(p))
          ) {
            available.push(id);
          } else {
            locked.push(id);
          }
        }
      }

      return { available, locked, researched };
    }),
  );
  vm$ = combineLatest({
    selection: this.selection$,
    status: this.status$,
    data: this.data$,
    showTechLabels: this.store.select(Preferences.getShowTechLabels),
    isMobile: this.contentSvc.isMobile$,
  });
  visible = false;
  importVisible = false;
  importValue = '';

  constructor(
    private ref: ChangeDetectorRef,
    private filterSvc: FilterService,
    private store: Store<LabState>,
    private contentSvc: ContentService,
  ) {}

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

  openImport(input: HTMLTextAreaElement): void {
    this.importVisible = true;
    setTimeout(() => input.focus());
  }

  importTechs(data: Dataset): void {
    const selection = this.importValue
      .split(',')
      .map((v) => v.trim())
      .map((id) => {
        if (!id) return '';

        const alt = `${id}-technology`;
        if (data.technologyIds.includes(alt)) {
          return alt;
        } else if (data.technologyIds.includes(id)) {
          return id;
        }

        return '';
      })
      .filter((v) => !!v);

    const set = new Set(selection);
    this.addPrerequisites(set, data);

    this.selection$.next(Array.from(set));
    this.selectAllCtrl.setValue(set.size === data.technologyIds.length);
    this.importValue = '';
  }

  clickId(id: string, selection: string[], data: Dataset): void {
    const set = new Set(selection);
    if (set.has(id)) {
      set.delete(id);

      // Filter out any technologies whose prerequisites are no longer met
      let removeIds: Set<string>;
      do {
        removeIds = new Set<string>();

        for (const id of set) {
          const tech = data.technologyEntities[id];
          if (tech.prerequisites?.some((p) => !set.has(p))) {
            removeIds.add(id);
          }
        }

        removeIds.forEach((i) => set.delete(i));
      } while (removeIds.size);
    } else {
      set.add(id);

      this.addPrerequisites(set, data);
    }

    this.selection$.next(Array.from(set));
    this.selectAllCtrl.setValue(set.size === data.technologyIds.length);
  }

  // Add any technologies whose prerequisites were not previously met
  addPrerequisites(set: Set<string>, data: Dataset): void {
    let addIds: Set<string>;
    do {
      addIds = new Set<string>();

      for (const id of set) {
        const tech = data.technologyEntities[id];
        tech.prerequisites
          ?.filter((p) => !set.has(p))
          .forEach((p) => addIds.add(p));
      }

      addIds.forEach((i) => set.add(i));
    } while (addIds.size);
  }

  onHide(selection: string[], data: Dataset): void {
    if (selection.length === data.technologyIds.length) {
      this.selectIds.emit(null);
    } else {
      /**
       * Filter for only technologies not listed as prerequisites for other
       * researched technologies, to create minimal set
       */
      const filteredSelection = selection.filter(
        (a) =>
          !selection.some((b) => {
            const techB = data.technologyEntities[b];
            return techB.prerequisites && techB.prerequisites.indexOf(a) !== -1;
          }),
      );
      this.selectIds.emit(filteredSelection);
    }
  }

  /** Action Dispatch Methods */
  setShowTechLabels(value: boolean): void {
    this.store.dispatch(new Preferences.SetShowTechLabelsAction(value));
  }
}
