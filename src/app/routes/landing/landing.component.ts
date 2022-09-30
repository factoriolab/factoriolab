import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lab-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {}
