import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';

import { Rational, rational } from '~/models/rational';
import { Entities } from '~/models/utils';
import { IconClassPipe } from '~/pipes/icon-class.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { RecipesService } from '~/store/recipes.service';
import { SettingsService } from '~/store/settings.service';

import { DialogComponent } from '../modal';

@Component({
  selector: 'lab-recipe-productivity',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    TableModule,
    IconClassPipe,
    TranslatePipe,
  ],
  templateUrl: './recipe-productivity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeProductivityComponent extends DialogComponent {
  recipesSvc = inject(RecipesService);
  settingsSvc = inject(SettingsService);

  recipesState = this.recipesSvc.settings;
  data = this.settingsSvc.dataset;

  rational = rational;

  editValue: Entities<Rational> = {};

  get modified(): boolean {
    return Object.keys(this.editValue).some(
      (k) => !this.editValue[k].eq(rational.zero),
    );
  }

  open(): void {
    this.editValue = this.data().canProdUpgradeRecipeIds.reduce(
      (e: Entities<Rational>, r) => {
        e[r] = this.recipesState()[r].productivity ?? rational.zero;
        return e;
      },
      {},
    );
    this.show();
  }

  reset(): void {
    this.editValue = this.data().canProdUpgradeRecipeIds.reduce(
      (e: Entities<Rational>, r) => {
        e[r] = rational.zero;
        return e;
      },
      {},
    );
  }

  save(): void {
    this.data().canProdUpgradeRecipeIds.forEach((r) => {
      this.recipesSvc.updateEntityField(
        r,
        'productivity',
        this.editValue[r],
        rational.zero,
      );
    });
  }
}
