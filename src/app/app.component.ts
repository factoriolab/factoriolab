import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { environment } from 'src/environments';
import {
  ItemId,
  Mod,
  Product,
  TITLE_DSP,
  TITLE_LAB,
  TITLE_SFY,
  APP,
  MatrixResult,
  MatrixResultType,
  Game,
} from './models';
import { ErrorService, StateService } from './services';
import { State } from './store';
import {
  getProducts,
  getMatrixResult as getSimplexResult,
} from './store/products';
import { getDatasets, getGame } from './store/settings';

@Component({
  selector: 'lab-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('slideLeftRight', [
      transition(':enter', [
        style({ marginLeft: '-24.25rem', marginRight: '1rem', opacity: 0 }),
        animate(
          '300ms ease',
          style({ marginLeft: '*', marginRight: '*', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        style({ marginLeft: '*', marginRight: '*', opacity: 1 }),
        animate(
          '300ms ease',
          style({ marginLeft: '-24.25rem', marginRight: '1rem', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class AppComponent implements OnInit {
  datasets$: Observable<Mod[]>;
  products$: Observable<Product[]>;
  result$: Observable<MatrixResult>;

  ItemId = ItemId;
  MatrixResultType = MatrixResultType;
  Game = Game;

  title: string;
  homeHref: string;
  game: Game;
  showSettings: boolean;
  poll = 'https://www.survey-maker.com/Q62LJFYVL';
  pollKey = 'poll1';
  showPoll = false;
  version = `${APP} ${environment.version}`;

  get lsHidePoll(): boolean {
    return !!localStorage.getItem(this.pollKey);
  }

  constructor(
    public error: ErrorService,
    public store: Store<State>,
    public titleService: Title,
    public state: StateService // Included only to initialize the service
  ) {}

  ngOnInit(): void {
    this.datasets$ = this.store.select(getDatasets);
    this.products$ = this.store.select(getProducts);
    this.result$ = this.store.select(getSimplexResult);
    this.store.select(getGame).subscribe((game) => {
      this.game = game;
      switch (game) {
        case Game.Factorio:
          this.title = TITLE_LAB;
          this.homeHref = 'factorio';
          break;
        case Game.DysonSphereProgram:
          this.title = TITLE_DSP;
          this.homeHref = 'dsp';
          break;
        case Game.Satisfactory:
          this.title = TITLE_SFY;
          this.homeHref = 'satisfactory';
          break;
      }
      this.titleService.setTitle(`${APP} | ${this.title}`);
    });
    if (this.lsHidePoll) {
      this.showPoll = false;
    }
  }

  hidePoll(persist = false): void {
    if (persist) {
      localStorage.setItem(this.pollKey, 'hide');
    }
    this.showPoll = false;
  }
}
