import { Component, Input } from '@angular/core';
import { Step, Item } from 'src/app/models';

@Component({
  selector: 'lab-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss']
})
export class StepsComponent {
  @Input() steps: Step[];

  constructor() {}

  beaconNumberChange(id: number, event: any) {
    if (event.target.value) {
      const value = event.target.value;
    }
  }
}
