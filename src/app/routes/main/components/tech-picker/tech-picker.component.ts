import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { FilterService } from 'primeng/api';

import { Game } from '~/models';
import { DialogComponent } from '~/models/modal-component';
import { ContentService } from '~/services';
import { LabState, Preferences, Recipes } from '~/store';

export type UnlockStatus = 'available' | 'locked' | 'researched';

@Component({
  selector: 'lab-tech-picker',
  templateUrl: './tech-picker.component.html',
  styleUrls: ['./tech-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechPickerComponent extends DialogComponent {
  filterSvc = inject(FilterService);
  translateSvc = inject(TranslateService);
  store = inject(Store<LabState>);
  contentSvc = inject(ContentService);

  @Output() selectIds = new EventEmitter<string[] | null>();

  data = this.store.selectSignal(Recipes.getAdjustedDataset);
  showTechLabels = this.store.selectSignal(Preferences.getShowTechLabels);

  filter = signal('');
  selection = signal<string[]>([]);

  allSelected = computed(
    () => this.selection().length === this.data().technologyIds.length,
  );
  status = computed(() => {
    const data = this.data();
    const filter = this.filter();
    let selection = this.selection();
    const set = new Set(selection);
    const available: string[] = [];
    const locked: string[] = [];

    let technologyIds = data.technologyIds;
    if (filter) {
      const technologies = technologyIds.map((i) => data.itemEntities[i]);
      technologyIds = this.filterSvc
        .filter(technologies, ['name'], filter, 'contains')
        .map((t) => t.id);

      selection = selection.filter((i) => technologyIds.includes(i));
    }

    const researched = selection;
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
  });

  importVisible = false;
  importValue = '';

  Game = Game;

  clickOpen(selection: string[] | null): void {
    selection = [...(selection ?? this.data().technologyIds)];
    this.selection.set(selection);
    this.show();
  }

  selectAll(value: boolean): void {
    this.selection.set(value ? [...this.data().technologyIds] : []);
  }

  openImport(input: HTMLTextAreaElement): void {
    this.importVisible = true;
    this.importValue = '';
    setTimeout(() => input.focus());
  }

  copyScriptToClipboard(): void {
    const script = `/c local list = {}
for _, tech in pairs(game.player.force.technologies) do
    if tech.researched then
        list[#list + 1] = tech.name
    end
end
game.write_file("techs.txt", table.concat(list, ","))
`;
    window.navigator.clipboard.writeText(script);
    this.contentSvc.showToast$.next({
      severity: 'success',
      detail: this.translateSvc.instant('techPicker.exportScriptCopied'),
      life: 100000,
      contentStyleClass: 'detail-only',
    });
  }

  importTechs(): void {
    const selection = this.importValue
      .split(',')
      .map((v) => v.trim())
      .map((id) => {
        if (!id) return '';

        const alt = `${id}-technology`;
        if (this.data().technologyIds.includes(alt)) {
          return alt;
        } else if (this.data().technologyIds.includes(id)) {
          return id;
        }

        return '';
      })
      .filter((v) => !!v);

    const set = new Set(selection);
    this.addPrerequisites(set);

    this.selection.set(Array.from(set));
    this.importValue = '';
    this.importVisible = false;
  }

  clickId(id: string): void {
    const set = new Set(this.selection());
    if (set.has(id)) {
      set.delete(id);

      // Filter out any technologies whose prerequisites are no longer met
      let removeIds: Set<string>;
      do {
        removeIds = new Set<string>();

        for (const id of set) {
          const tech = this.data().technologyEntities[id];
          if (tech.prerequisites?.some((p) => !set.has(p))) removeIds.add(id);
        }

        removeIds.forEach((i) => set.delete(i));
      } while (removeIds.size);
    } else {
      set.add(id);

      this.addPrerequisites(set);
    }

    this.selection.set(Array.from(set));
  }

  // Add any technologies whose prerequisites were not previously met
  addPrerequisites(set: Set<string>): void {
    let addIds: Set<string>;
    do {
      addIds = new Set<string>();

      for (const id of set) {
        const tech = this.data().technologyEntities[id];
        tech.prerequisites
          ?.filter((p) => !set.has(p))
          .forEach((p) => addIds.add(p));
      }

      addIds.forEach((i) => set.add(i));
    } while (addIds.size);
  }

  save(): void {
    const selection = this.selection();
    const data = this.data();
    if (selection.length === data.technologyIds.length)
      this.selectIds.emit(null);

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

  /** Action Dispatch Methods */
  setShowTechLabels(value: boolean): void {
    this.store.dispatch(new Preferences.SetShowTechLabelsAction(value));
  }
}
