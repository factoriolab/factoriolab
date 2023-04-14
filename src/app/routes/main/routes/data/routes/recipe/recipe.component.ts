import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AppSharedModule } from '~/app-shared.module';

@Component({
  standalone: true,
  imports: [CommonModule, AppSharedModule],
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeComponent {}
