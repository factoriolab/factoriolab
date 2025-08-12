import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { FormField } from '~/components/form-field/form-field';
import { Select } from '~/components/select/select';
import { Game, gameOptions } from '~/models/game';
import { gameInfo } from '~/models/game-info';
import { FileClient } from '~/state/file-client';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'lab-landing',
  imports: [AsyncPipe, FormsModule, FormField, Select, TranslatePipe],
  templateUrl: './landing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col items-center justify-center h-dvh gap-2' },
})
export class Landing {
  private readonly router = inject(Router);
  protected readonly fileClient = inject(FileClient);
  private readonly settingsStore = inject(SettingsStore);

  modId = this.settingsStore.modId;
  data = this.settingsStore.dataset;
  modOptions = this.settingsStore.modOptions;

  gameOptions = gameOptions;

  setGame(game: Game): void {
    this.setMod(gameInfo[game].modId);
  }

  setMod(modId: string): void {
    void this.router.navigate([modId]);
  }
}
