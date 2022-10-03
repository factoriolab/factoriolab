import { Component, OnInit } from '@angular/core';

import { RouterService, StateService, ThemeService } from './services';

@Component({
  selector: 'lab-root',
  template: ` <router-outlet></router-outlet> `,
})
export class AppComponent implements OnInit {
  constructor(
    private routerSvc: RouterService,
    private stateSvc: StateService,
    private themeSvc: ThemeService
  ) {}

  ngOnInit(): void {
    this.stateSvc.initialize();
    this.themeSvc.initialize();
    this.routerSvc.initialize();
  }
}
