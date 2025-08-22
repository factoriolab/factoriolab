import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'lab-root',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  host: { class: 'block h-full' },
})
export class App {}
