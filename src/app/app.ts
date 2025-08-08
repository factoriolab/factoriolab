import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'lab-root',
  imports: [RouterOutlet, TranslatePipe],
  templateUrl: './app.html',
})
export class App {}
