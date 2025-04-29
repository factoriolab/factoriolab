import { AsyncPipe, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { SelectModule } from '~/components/select/select.component';
// import { PickerComponent } from '~/components/picker/picker.component';
import { Game, gameOptions } from '~/models/enum/game';
import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { gameInfo } from '~/models/game-info';
import { rational } from '~/models/rational';
import { Optional } from '~/models/utils';
import { IconClassPipe } from '~/pipes/icon-class.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { ContentService } from '~/services/content.service';
import { RouterService } from '~/services/router.service';
import { ObjectivesStore } from '~/store/objectives.store';
import { PreferencesStore } from '~/store/preferences.store';
import { SettingsStore } from '~/store/settings.store';

import { SpinnerComponent } from '../../components/spinner/spinner.component';

@Component({
  selector: 'lab-landing',
  imports: [
    AsyncPipe,
    FormsModule,
    KeyValuePipe,
    RouterLink,
    IconClassPipe,
    // PickerComponent,
    SelectModule,
    TranslatePipe,
    SpinnerComponent,
  ],
  templateUrl: './landing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-2 items-center justify-center h-dvh' },
})
export class LandingComponent {
  router = inject(Router);
  route = inject(ActivatedRoute);
  contentSvc = inject(ContentService);
  objectivesStr = inject(ObjectivesStore);
  preferencesStr = inject(PreferencesStore);
  routerSvc = inject(RouterService);
  settingsStr = inject(SettingsStore);

  modId = this.settingsStr.modId;
  mod = this.settingsStr.mod;
  data = this.settingsStr.dataset;
  settings = this.settingsStr.settings;
  states = this.settingsStr.modStates;
  stateOptions = this.settingsStr.stateOptions;
  modOptions = this.settingsStr.modOptions;

  gameInfo = gameInfo;
  gameOptions = gameOptions;

  selectItem(targetId: string): void {
    this.objectivesStr.create({
      targetId,
      value: rational.one,
      unit: ObjectiveUnit.Items,
      type: ObjectiveType.Output,
    });
    void this.router.navigate(['list'], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve',
    });
  }

  selectRecipe(targetId: string): void {
    this.objectivesStr.create({
      targetId,
      value: rational.one,
      unit: ObjectiveUnit.Machines,
      type: ObjectiveType.Output,
    });
    void this.router.navigate(['list'], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve',
    });
  }

  setState(query: string): void {
    if (!query) return;
    void this.router.navigate(['list'], {
      queryParams: this.routerSvc.toParams(query),
      relativeTo: this.route,
    });
  }

  setGame(game: Optional<Game>): void {
    if (game == null) return;
    this.setMod(gameInfo[game].modId);
  }

  setMod(modId: string): void {
    void this.router.navigate([modId]);
  }
}
