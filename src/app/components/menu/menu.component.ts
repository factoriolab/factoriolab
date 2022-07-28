import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'lab-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnInit {
  @HostBinding('class.active')
  @Input()
  active = false;

  constructor() {}

  ngOnInit(): void {}
}
