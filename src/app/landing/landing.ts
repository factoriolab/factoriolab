import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Select } from '~/components/select/select';
import { Game, gameOptions } from '~/models/game';
import { gameInfo } from '~/models/game-info';
import { FileClient } from '~/state/file-client';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'lab-landing',
  imports: [AsyncPipe, FormsModule, Select, TranslatePipe],
  templateUrl: './landing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col items-center justify-center h-dvh gap-2' },
})
export class Landing {
  private readonly router = inject(Router);
  protected readonly fileClient = inject(FileClient);
  private readonly settingsStore = inject(SettingsStore);

  data = this.settingsStore.dataset;

  gameOptions = gameOptions;

  setGame(game: Game): void {
    console.log('set game', game);
    this.setMod(gameInfo[game].modId);
  }

  setMod(modId: string): void {
    void this.router.navigate([modId]);
  }

  test(): void {
    console.log('test');
  }
}
