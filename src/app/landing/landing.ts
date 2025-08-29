import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faBookOpen,
  faBoxOpen,
  faClockRotateLeft,
  faFileImport,
  faForward,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { FormField } from '~/components/form-field/form-field';
import { InputNumber } from '~/components/input-number/input-number';
import { ObjectiveForm } from '~/components/objective-form';
import { Select } from '~/components/select/select';
import { FileClient } from '~/data/file-client';
import { Game, gameOptions } from '~/data/game';
import { gameInfo } from '~/data/game-info';
import { ObjectiveBase } from '~/state/objectives/objective';
import { ObjectivesStore } from '~/state/objectives/objectives-store';
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
    Button,
    FormField,
    InputNumber,
    Select,
    TranslatePipe,
  ],
  templateUrl: './landing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col items-center justify-center h-dvh gap-2' },
})
export class Landing extends ObjectiveForm {
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly fileClient = inject(FileClient);
  private readonly objectivesStore = inject(ObjectivesStore);
  protected readonly preferencesStore = inject(PreferencesStore);
  protected readonly routerSync = inject(RouterSync);
  private readonly settingsStore = inject(SettingsStore);

  protected readonly data = this.settingsStore.dataset;
  protected readonly modId = this.settingsStore.modId;
  protected readonly modOptions = this.settingsStore.modOptions;
  protected readonly stateOptions = this.settingsStore.stateOptions;
  protected readonly states = this.settingsStore.modStates;
  protected readonly unitOptions = this.settingsStore.objectiveUnitOptions;

  protected readonly faBoxOpen = faBoxOpen;
  protected readonly faBookOpen = faBookOpen;
  protected readonly faClockRotateLeft = faClockRotateLeft;
  protected readonly faForward = faForward;
  protected readonly faFileImport = faFileImport;
  protected readonly faQuestion = faQuestion;
  protected readonly gameOptions = gameOptions;

  addObjective(value: ObjectiveBase): void {
    this.objectivesStore.create(value);
    void this.router.navigate(['list'], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve',
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
