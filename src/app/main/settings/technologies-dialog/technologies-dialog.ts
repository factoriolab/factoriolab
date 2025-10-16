import { Dialog, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCheck,
  faFileImport,
  faMagnifyingGlass,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { filter } from 'rxjs';

import { Button } from '~/components/button/button';
import { Checkbox } from '~/components/checkbox/checkbox';
import { Tooltip } from '~/components/tooltip/tooltip';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { TechnologiesImportDialog } from './technologies-import-dialog';
import { TechnologiesSet } from './technologies-set';

@Component({
  selector: 'lab-technologies-dialog',
  imports: [
    FormsModule,
    FaIconComponent,
    Button,
    Checkbox,
    TechnologiesSet,
    TranslatePipe,
    Tooltip,
  ],
  templateUrl: './technologies-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-col p-3 sm:p-6 pt-px gap-3 sm:pt-px sm:gap-6 overflow-hidden max-w-full md:w-[80dvw] xl:w-[60dvw] 2xl:w-[50dvw]',
  },
})
export class TechnologiesDialog {
  protected readonly dialog = inject(Dialog);
  protected readonly dialogRef = inject(DialogRef);
  protected readonly preferencesStore = inject(PreferencesStore);
  private readonly settingsStore = inject(SettingsStore);

  protected readonly filterText = signal('');
  protected readonly selection = linkedSignal(
    () => this.settingsStore.settings().researchedTechnologyIds,
  );

  protected readonly allSelected = computed(
    () => this.selection().size === this.data().technologyIds.length,
  );
  protected readonly status = computed(() => {
    const data = this.data();
    const filter = this.filterText().toLowerCase();
    const set = this.selection();
    let selection = Array.from(set);
    const available: string[] = [];
    const locked: string[] = [];

    let technologyIds = data.technologyIds;
    if (filter) {
      technologyIds = technologyIds.filter((t) =>
        data.itemRecord[t].name.toLowerCase().includes(filter),
      );
      selection = selection.filter((i) => technologyIds.includes(i));
    }

    const researched = selection;
    for (const id of technologyIds) {
      if (!set.has(id)) {
        const tech = data.technologyRecord[id];

        if (
          tech.prerequisites == null ||
          tech.prerequisites.every((p) => set.has(p))
        )
          available.push(id);
        else locked.push(id);
      }
    }

    return { available, locked, researched };
  });

  protected readonly data = this.settingsStore.dataset;
  protected readonly faCheck = faCheck;
  protected readonly faFileImport = faFileImport;
  protected readonly faMagnifyingGlass = faMagnifyingGlass;
  protected readonly faXmark = faXmark;

  selectAll(value: boolean): void {
    this.selection.set(new Set(value ? [...this.data().technologyIds] : null));
  }

  toggleId(id: string): void {
    this.selection.update((s) => {
      const set = new Set(s);
      if (set.has(id)) {
        set.delete(id);

        // Filter out any technologies whose prerequisites are no longer met
        let removeIds: Set<string>;
        do {
          removeIds = new Set<string>();

          for (const id of set) {
            const tech = this.data().technologyRecord[id];
            if (tech.prerequisites?.some((p) => !set.has(p))) removeIds.add(id);
          }

          removeIds.forEach((i) => set.delete(i));
        } while (removeIds.size);
      } else {
        set.add(id);
        this.addPrerequisites(set);
      }

      return set;
    });
  }

  openImport(): void {
    const ref = this.dialog.open<string[]>(TechnologiesImportDialog, {
      data: { header: 'technologies.importHeader' },
    });
    ref.closed.pipe(filter((result) => result != null)).subscribe((result) => {
      const set = new Set(result);
      this.addPrerequisites(set);
      this.selection.set(set);
    });
  }

  save(): void {
    let researchedTechnologyIds: Set<string> | undefined = this.selection();
    const data = this.data();
    if (researchedTechnologyIds?.size === data.technologyIds.length)
      researchedTechnologyIds = undefined;

    this.settingsStore.apply({ researchedTechnologyIds });
    this.dialogRef.close();
  }

  // Add any technologies whose prerequisites were not previously met
  private addPrerequisites(set: Set<string>): void {
    let addIds: Set<string>;
    do {
      addIds = new Set<string>();

      for (const id of set) {
        const tech = this.data().technologyRecord[id];
        tech.prerequisites
          ?.filter((p) => !set.has(p))
          .forEach((p) => addIds.add(p));
      }

      addIds.forEach((i) => set.add(i));
    } while (addIds.size);
  }
}
