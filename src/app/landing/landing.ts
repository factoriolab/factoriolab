import { Dialog } from '@angular/cdk/dialog';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faBox,
  faClockRotateLeft,
  faFileImport,
  faForward,
  faIndustry,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons';

import { FormField } from '~/components/form-field/form-field';
import { Picker, PickerData } from '~/components/picker/picker';
import { Select } from '~/components/select/select';
import { Game, gameOptions } from '~/models/game';
import { gameInfo } from '~/models/game-info';
import { FileClient } from '~/state/file-client';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { RouterSync } from '~/state/router/router-sync';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'lab-landing',
  imports: [
    AsyncPipe,
    FormsModule,
    RouterLink,
    FaIconComponent,
    FormField,
    Select,
    TranslatePipe,
  ],
  templateUrl: './landing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col items-center justify-center h-dvh gap-2' },
})
export class Landing {
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(Dialog);
  protected readonly fileClient = inject(FileClient);
  protected readonly preferencesStore = inject(PreferencesStore);
  protected readonly routerSync = inject(RouterSync);
  private readonly settingsStore = inject(SettingsStore);

  modId = this.settingsStore.modId;
  mod = this.settingsStore.mod;
  data = this.settingsStore.dataset;
  settings = this.settingsStore.settings;
  states = this.settingsStore.modStates;
  stateOptions = this.settingsStore.stateOptions;
  modOptions = this.settingsStore.modOptions;

  faBox = faBox;
  faClockRotateLeft = faClockRotateLeft;
  faForward = faForward;
  faFileImport = faFileImport;
  faIndustry = faIndustry;
  faQuestion = faQuestion;
  gameOptions = gameOptions;

  addItems(): void {
    this.dialog.open<string, PickerData>(Picker, {
      data: {
        header: 'objectives.add',
        type: 'item',
        allIds: this.settings().availableItemIds,
      },
    });
  }

  setState(query: string): void {
    if (!query) return;
    void this.router.navigate(['list'], {
      queryParams: this.routerSync.toParams(query),
      relativeTo: this.route,
    });
  }

  setGame(game: Game): void {
    this.setMod(gameInfo[game].modId);
  }

  setMod(modId: string): void {
    void this.router.navigate([modId]);
  }
}
