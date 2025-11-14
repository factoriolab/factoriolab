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
import { Checkbox } from '~/components/checkbox/checkbox';
import { FormField } from '~/components/form-field/form-field';
import { InputNumber } from '~/components/input-number/input-number';
import { ObjectiveForm } from '~/components/objective-form';
import { Select } from '~/components/select/select';
import { Game, gameOptions } from '~/data/game';
import { gameInfo } from '~/data/game-info';
import { Release } from '~/data/release';
import { ObjectiveBase } from '~/state/objectives/objective';
import { ObjectivesStore } from '~/state/objectives/objectives-store';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { RouterSync } from '~/state/router/router-sync';
import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'lab-landing',
  imports: [
    FormsModule,
    RouterLink,
    FaIconComponent,
    Button,
    Checkbox,
    FormField,
    InputNumber,
    Select,
    TranslatePipe,
  ],
  templateUrl: './landing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex h-dvh flex-col items-center justify-center gap-2' },
})
export class Landing extends ObjectiveForm {
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly objectivesStore = inject(ObjectivesStore);
  protected readonly preferencesStore = inject(PreferencesStore);
  protected readonly release = inject(Release);
  protected readonly routerSync = inject(RouterSync);

  protected readonly data = this.settingsStore.dataset;
  protected readonly faBoxOpen = faBoxOpen;
  protected readonly faBookOpen = faBookOpen;
  protected readonly faClockRotateLeft = faClockRotateLeft;
  protected readonly faForward = faForward;
  protected readonly faFileImport = faFileImport;
  protected readonly faQuestion = faQuestion;
  protected readonly gameOptions = gameOptions;
  protected readonly stateOptions = this.settingsStore.stateOptions;

  async addObjective(value: ObjectiveBase): Promise<void> {
    await this.router.navigate(['list'], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve',
    });

    this.objectivesStore.create(value);
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
