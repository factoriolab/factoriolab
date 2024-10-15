import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

import { RouterService } from '~/services/router.service';

@Component({
  selector: 'lab-id',
  template: '<router-outlet>',
  standalone: true,
  imports: [RouterOutlet],
})
export class IdComponent implements OnInit {
  route = inject(ActivatedRoute);
  routerSvc = inject(RouterService);

  ngOnInit(): void {
    this.routerSvc.route$.next(this.route);
  }
}
