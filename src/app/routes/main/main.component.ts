import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { combineLatest, first, map } from 'rxjs';

import { environment } from 'src/environments';
import { APP, MatrixResultType, SimplexType } from '~/models';
import { ContentService } from '~/services';
import { LabState, Preferences, Products, Settings } from '~/store';

@Component({
  selector: 'lab-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  vm$ = combineLatest([
    this.store.select(Settings.getGame),
    this.store.select(Settings.getMod),
    this.store.select(Products.getProducts),
    this.store.select(Products.getMatrixResult),
    this.contentSvc.settingsActive$,
  ]).pipe(
    map(([game, mod, products, result, settingsActive]) => ({
      game,
      mod,
      products,
      result,
      settingsActive,
    }))
  );

  version = `${APP} ${environment.version}`;
  showSimplexErr = false;
  fixLoading = false;
  simplexErrSub = this.store
    .select(Products.getMatrixResult)
    .subscribe(
      (result) =>
        (this.showSimplexErr = result.resultType === MatrixResultType.Failed)
    );
  tabItems: MenuItem[] = [
    { label: 'app.list', icon: 'fa-solid fa-list', routerLink: 'list' },
    {
      label: 'app.flow',
      icon: 'fa-solid fa-diagram-project',
      routerLink: 'flow',
    },
    {
      label: 'app.matrix',
      icon: 'fa-solid fa-table-cells',
      routerLink: 'matrix',
    },
  ];

  MatrixResultType = MatrixResultType;

  constructor(
    public contentSvc: ContentService,
    private store: Store<LabState>
  ) {}

  tryFixSimplex(): void {
    this.fixLoading = true;
    setTimeout(() => {
      this.store
        .select(Settings.getDefaults)
        .pipe(first())
        .subscribe((def) => {
          this.store.dispatch(
            new Preferences.SetSimplexTypeAction(SimplexType.WasmFloat64)
          );
          this.store.dispatch(
            new Settings.SetDisabledRecipesAction({
              value: [],
              def: def?.disabledRecipeIds,
            })
          );
        });
      this.showSimplexErr = false;
      this.fixLoading = false;
    }, 10);
  }
}
