import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { PickerComponent } from '~/components/picker/picker.component';
import { Game, gameOptions } from '~/models/enum/game';
import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { gameInfo } from '~/models/game-info';
import { Objective } from '~/models/objective';
import { rational } from '~/models/rational';
import { IconSmClassPipe } from '~/pipes/icon-class.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { ContentService } from '~/services/content.service';
import { RouterService } from '~/services/router.service';
import { create } from '~/store/objectives/objectives.actions';
import { setBypassLanding } from '~/store/preferences/preferences.actions';
import { preferencesState } from '~/store/preferences/preferences.selectors';
import { selectAvailableItems } from '~/store/recipes/recipes.selectors';
import { setMod } from '~/store/settings/settings.actions';
import {
  selectAvailableRecipes,
  selectDataset,
  selectMod,
  selectModOptions,
  selectSavedStates,
  selectSettings,
} from '~/store/settings/settings.selectors';
import { BrowserUtility } from '~/utilities/browser.utility';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ButtonModule,
    CardModule,
    CheckboxModule,
    DividerModule,
    DropdownModule,
    ProgressSpinnerModule,
    IconSmClassPipe,
    PickerComponent,
    TranslatePipe,
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  router = inject(Router);
  route = inject(ActivatedRoute);
  store = inject(Store);
  contentSvc = inject(ContentService);
  routerSvc = inject(RouterService);

  itemIds = this.store.selectSignal(selectAvailableItems);
  settings = this.store.selectSignal(selectSettings);
  modOptions = this.store.selectSignal(selectModOptions);
  data = this.store.selectSignal(selectDataset);
  mod = this.store.selectSignal(selectMod);
  recipeIds = this.store.selectSignal(selectAvailableRecipes);
  savedStates = this.store.selectSignal(selectSavedStates);
  preferences = this.store.selectSignal(preferencesState);

  gameInfo = gameInfo;
  gameOptions = gameOptions;

  Game = Game;
  BrowserUtility = BrowserUtility;

  selectItem(targetId: string): void {
    this.createObjective({
      id: '0',
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
    this.createObjective({
      id: '0',
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

  setGame(game: Game): void {
    this.setMod(gameInfo[game].modId);
  }

  /** Action Dispatch Methods */
  setMod(modId: string): void {
    this.store.dispatch(setMod({ modId }));
  }

  createObjective(objective: Objective): void {
    this.store.dispatch(create({ objective }));
  }

  setBypassLanding(bypassLanding: boolean): void {
    this.store.dispatch(setBypassLanding({ bypassLanding }));
  }
}
