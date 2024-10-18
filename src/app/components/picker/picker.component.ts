import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  input,
  Output,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';

import { TabViewOverrideDirective } from '~/directives/tabview-override.directive';
import { coalesce } from '~/helpers';
import { Group } from '~/models/data/group';
import { Entities } from '~/models/utils';
import { IconSmClassPipe } from '~/pipes/icon-class.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { ContentService } from '~/services/content.service';
import { SettingsService } from '~/store/settings.service';

import { DialogComponent } from '../modal';
import { TooltipComponent } from '../tooltip/tooltip.component';

@Component({
  selector: 'lab-picker',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    InputTextModule,
    ScrollPanelModule,
    TooltipModule,
    TabViewModule,
    IconSmClassPipe,
    TabViewOverrideDirective,
    TooltipComponent,
    TranslatePipe,
  ],
  templateUrl: './picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickerComponent extends DialogComponent {
  filterSvc = inject(FilterService);
  contentSvc = inject(ContentService);
  settingsSvc = inject(SettingsService);

  filterInput = viewChild.required<ElementRef<HTMLInputElement>>('filterInput');

  header = input('');
  @Output() selectId = new EventEmitter<string>();
  @Output() selectIds = new EventEmitter<Set<string>>();

  data = this.settingsSvc.dataset;

  search = '';
  allSelected = false;

  type: 'item' | 'recipe' = 'item';
  isMultiselect = false;
  selection: string | string[] | undefined;
  default: string | string[] | undefined;
  groupEntities: Entities<Group> = {};
  groupIds: string[] = [];
  groupRows: Entities<string[][]> = {};
  // Preserve state prior to any filtering
  allSelectItems: SelectItem<string>[] = [];
  allGroupIds: string[] = [];
  allGroupRows: Entities<string[][]> = {};
  activeIndex = 0;

  clickOpen(
    type: 'item' | 'recipe',
    allIds: string[],
    selection?: string | string[] | Set<string>,
  ): void {
    const data = this.data();
    this.type = type;
    const allIdsSet = new Set(allIds);
    if (selection instanceof Set) selection = Array.from(selection);
    if (Array.isArray(selection)) {
      this.isMultiselect = true;
      this.selection = [...selection];
    } else {
      this.isMultiselect = false;
      this.selection = selection;
    }
    this.search = '';
    this.groupEntities = data.groupEntities;
    if (type === 'item') {
      this.groupRows = {};
      data.groupIds.forEach((c) => {
        if (data.groupItemRows[c]) {
          this.groupRows[c] = [];
          data.groupItemRows[c].forEach((r) => {
            const row = r.filter((i) => allIdsSet.has(i));
            if (row.length) this.groupRows[c].push(row);
          });
        }
      });

      this.allSelectItems = allIds.map(
        (i): SelectItem<string> => ({
          label: data.itemEntities[i].name,
          value: i,
          title: data.itemEntities[i].group,
        }),
      );

      if (Array.isArray(selection)) {
        this.allSelected = selection.length === 0;
      } else if (selection != null) {
        const index = data.groupIds.indexOf(data.itemEntities[selection].group);
        this.activeIndex = index;
      }
    } else {
      this.groupRows = {};
      data.groupIds.forEach((c) => {
        if (data.groupRecipeRows[c]) {
          this.groupRows[c] = [];
          data.groupRecipeRows[c].forEach((r) => {
            const row = r.filter((i) => allIdsSet.has(i));
            if (row.length) this.groupRows[c].push(row);
          });
        }
      });

      this.allSelectItems = allIds.map(
        (i): SelectItem<string> => ({
          label: data.recipeEntities[i].name,
          value: i,
          title: data.recipeEntities[i].group,
        }),
      );

      if (Array.isArray(selection)) {
        this.allSelected = selection.length === 0;
        this.default = [...coalesce(data.defaults?.excludedRecipeIds, [])];
      } else if (selection) {
        const index = data.groupIds.indexOf(
          data.recipeEntities[selection].group,
        );
        this.activeIndex = index;
      }
    }
    this.groupIds = data.groupIds.filter((c) => this.groupRows[c]?.length);
    this.allGroupIds = this.groupIds;
    this.allGroupRows = this.groupRows;
    this.show();

    if (!this.contentSvc.isMobile()) {
      setTimeout(() => {
        this.filterInput().nativeElement.focus();
      });
    }
  }

  selectAll(value: boolean): void {
    if (value) {
      this.selection = [];
    } else {
      this.selection = this.allSelectItems.map((i) => i.value);
    }
  }

  reset(): void {
    this.selection = this.default;
  }

  clickId(id: string): void {
    if (Array.isArray(this.selection)) {
      const index = this.selection.indexOf(id);
      if (index === -1) {
        this.selection.push(id);
      } else {
        this.selection.splice(index, 1);
      }
      this.allSelected = this.selection.length === 0;
    } else {
      this.selectId.emit(id);
      this.visible = false;
    }
  }

  save(): void {
    if (Array.isArray(this.selection)) {
      this.selectIds.emit(new Set(this.selection));
    }
  }

  inputSearch(): void {
    if (!this.search) {
      this.groupIds = this.allGroupIds;
      this.groupRows = this.allGroupRows;
      return;
    }

    // Filter for matching item ids
    const filteredItems = this.filterSvc.filter(
      this.allSelectItems,
      ['label'],
      this.search,
      'contains',
    ) as SelectItem<string>[];

    // Filter for matching group ids
    // (Cache group on the SelectItem `title` field)
    this.groupIds = this.allGroupIds.filter((c) =>
      filteredItems.some((i) => i.title === c),
    );

    // Filter group rows
    this.groupRows = {};
    const ids = filteredItems.map((i) => i.value);
    for (const c of this.groupIds) {
      // Filter each group row
      this.groupRows[c] = [];
      for (const r of this.allGroupRows[c])
        this.groupRows[c].push(r.filter((i) => ids.includes(i)));

      // Filter out empty group rows
      this.groupRows[c] = this.groupRows[c].filter((r) => r.length > 0);
    }

    setTimeout(() => {
      this.ref.markForCheck();
    });
  }
}
