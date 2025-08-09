import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'lab-root',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class App {}
