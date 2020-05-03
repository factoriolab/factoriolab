import { Component, OnInit, Input } from '@angular/core';

import { SettingsState } from '~/store/settings';

@Component({
  selector: 'lab-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  @Input() settings: SettingsState;

  constructor() {}

  ngOnInit() {}
}
