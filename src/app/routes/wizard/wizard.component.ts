import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

enum ObjectiveType {
  None,
  Product,
  Producer,
}

@Component({
  selector: 'lab-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WizardComponent {
  objectiveTypeCtrl = this.fb.control(ObjectiveType.None);

  ObjectiveType = ObjectiveType;

  constructor(private fb: FormBuilder) {}
}
