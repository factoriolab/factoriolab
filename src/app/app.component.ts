import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take, map } from 'rxjs/operators';

import { environment } from 'src/environments';
import {
  Dataset,
  FuelType,
  ItemId,
  Mod,
  Product,
  TITLE_DSP,
  TITLE_LAB,
} from './models';
import { ErrorService, RouterService } from './services';
import { State } from './store';
import { initialFactoriesState } from './store/factories';
import { getProducts, getZipState } from './store/products';
import {
  getDataset,
  getDatasets,
  getIsDsp,
  initialSettingsState,
} from './store/settings';

@Component({
  selector: 'lab-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('slideLeftRight', [
      transition(':enter', [
        style({ marginLeft: '-25rem', marginRight: '1rem', opacity: 0 }),
        animate(
          '300ms ease',
          style({ marginLeft: '*', marginRight: '*', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        style({ marginLeft: '*', marginRight: '*', opacity: 1 }),
        animate(
          '300ms ease',
          style({ marginLeft: '-25rem', marginRight: '1rem', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class AppComponent implements OnInit {
  datasets$: Observable<Mod[]>;
  data$: Observable<Dataset>;
  products$: Observable<Product[]>;

  ItemId = ItemId;

  title: string;
  showSettings: boolean;
  poll = 'https://linkto.run/p/0UD8IV6X';
  pollKey = 'poll0';
  showPoll = false;
  first = true;

  get lsHidePoll(): boolean {
    return !!localStorage.getItem(this.pollKey);
  }

  constructor(
    public error: ErrorService,
    public router: RouterService,
    public store: Store<State>,
    public titleService: Title
  ) {}

  homeHref(isDsp: boolean): string {
    return isDsp ? 'list?s=dsp' : 'list?p=';
  }

  ngOnInit(): void {
    this.datasets$ = this.store.select(getDatasets);
    this.data$ = this.store.select(getDataset);
    this.products$ = this.store.select(getProducts);
    this.store.select(getZipState).subscribe((s) => {
      let skip = false;
      if (this.first) {
        // First update: if there are no modified settings, leave base URL.
        if (
          Object.keys(s.items).length === 0 &&
          Object.keys(s.recipes).length === 0 &&
          JSON.stringify(s.factories) ===
            JSON.stringify(initialFactoriesState) &&
          JSON.stringify(s.settings) === JSON.stringify(initialSettingsState)
        ) {
          // No modified settings, skip first update.
          skip = true;
        }
        // Don't check again later, always update.
        this.first = false;
      }
      if (!skip) {
        this.router.updateUrl(
          s.products,
          s.items,
          s.recipes,
          s.factories,
          s.settings
        );
      }
    });
    this.store.select(getIsDsp).subscribe((dsp) => {
      this.title = dsp ? TITLE_DSP : TITLE_LAB;
      this.titleService.setTitle(`FactorioLab | ${this.title}`);
    });
    if (this.lsHidePoll) {
      this.showPoll = false;
    }

    // Used only in development to update hash files
    // istanbul ignore next
    if (environment.debug) {
      this.datasets$
        .pipe(
          filter((d) => !!d.length),
          take(1),
          map((d) => d[0].id)
        )
        .subscribe((id) => {
          this.router
            .requestHash(id)
            .pipe(take(1))
            .subscribe((h) => {
              this.data$.pipe(take(1)).subscribe((d) => {
                console.log(id);
                console.log(
                  JSON.stringify(
                    d.complexRecipeIds.filter((i) => !d.itemEntities[i])
                  )
                );
                const old = JSON.stringify(h);
                for (const id of [...d.itemIds]
                  .sort()
                  .filter((i) => h.items.indexOf(i) === -1)) {
                  h.items.push(id);
                }
                for (const id of [...d.beaconIds]
                  .sort()
                  .filter((i) => h.beacons.indexOf(i) === -1)) {
                  h.beacons.push(id);
                }
                for (const id of [...d.beltIds]
                  .sort()
                  .filter((i) => h.belts.indexOf(i) === -1)) {
                  h.belts.push(id);
                }
                if (d.fuelIds[FuelType.Chemical]) {
                  for (const id of [...d.fuelIds[FuelType.Chemical]]
                    .sort()
                    .filter((i) => h.fuels.indexOf(i) === -1)) {
                    h.fuels.push(id);
                  }
                }
                for (const id of [...d.cargoWagonIds, ...d.fluidWagonIds]
                  .sort()
                  .filter((i) => h.wagons.indexOf(i) === -1)) {
                  h.wagons.push(id);
                }
                for (const id of [...d.factoryIds]
                  .sort()
                  .filter((i) => h.factories.indexOf(i) === -1)) {
                  h.factories.push(id);
                }
                for (const id of [...d.moduleIds]
                  .sort()
                  .filter((i) => h.modules.indexOf(i) === -1)) {
                  h.modules.push(id);
                }
                for (const id of [...d.recipeIds]
                  .sort()
                  .filter((i) => h.recipes.indexOf(i) === -1)) {
                  h.recipes.push(id);
                }
                if (old === JSON.stringify(h)) {
                  console.log('No change in hash');
                } else {
                  console.log('New hash:');
                  console.log(JSON.stringify(h));
                }
              });
            });
        });
    }
  }

  hidePoll(persist = false): void {
    if (persist) {
      localStorage.setItem(this.pollKey, 'hide');
    }
    this.showPoll = false;
  }
}
