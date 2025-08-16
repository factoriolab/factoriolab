import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Aside } from './aside/aside';
import { Header } from './header/header';

@Component({
  selector: 'lab-main',
  imports: [RouterOutlet, Header, Aside],
  templateUrl: './main.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Main {}
