import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { combineLatest, first, map } from 'rxjs';

import { environment } from 'src/environments';
import { APP, MatrixResultType, SimplexType } from '~/models';
import { ContentService } from '~/services';
import { LabState, Preferences, Products, Settings } from '~/store';

@UntilDestroy()
@Component({
  selector: 'lab-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit {
  vm$ = combineLatest([
    this.store.select(Settings.getGame),
    this.store.select(Settings.getMod),
    this.store.select(Products.getProducts),
    this.store.select(Products.getMatrixResult),
  ]).pipe(
    map(([game, mod, products, result]) => ({
      game,
      mod,
      products,
      result,
    }))
  );

  version = `${APP} ${environment.version}`;
  settingsActive = false;
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

  ngOnInit(): void {
    console.log('init main');
    this.contentSvc.toggleMenu$.pipe(untilDestroyed(this)).subscribe(() => {
      this.settingsActive = !this.settingsActive;
    });
  }

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
