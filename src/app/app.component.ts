import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import * as data from 'src/assets/0-18.json';
import { ItemId } from './models';
import { RouterService } from './services/router.service';
import { State } from './store';
import { LoadDatasetAction } from './store/dataset';
import { getZipState, AddAction } from './store/products';

@Component({
  selector: 'lab-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  settingsOpen: boolean;

  constructor(private router: RouterService, private store: Store<State>) {
    this.store.dispatch(new LoadDatasetAction((data as any).default));
    if (!location.hash) {
      this.store.dispatch(new AddAction(ItemId.WoodenChest));
    }
  }

  ngOnInit() {
    this.store.select(getZipState).subscribe((s) => {
      this.router.updateUrl(s.products, s.recipe, s.settings, s.data);
    });
  }

  toggleSettings() {
    this.settingsOpen = !this.settingsOpen;
  }
}
