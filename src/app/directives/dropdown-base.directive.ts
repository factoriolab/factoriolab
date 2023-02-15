import { Directive, Input, OnChanges, OnInit, Self } from '@angular/core';
import { Dropdown } from 'primeng/dropdown';

@Directive({
  selector: '[labDropdownBase]',
})
export class DropdownBaseDirective implements OnInit, OnChanges {
  @Input() labDropdownBase: 'icon' | '' | undefined;

  constructor(@Self() private readonly pDropdown: Dropdown) {}

  ngOnInit(): void {
    this.pDropdown.filter = true;
    this.pDropdown.scrollHeight = '40vh';
    this.pDropdown.panelStyleClass = 'tooltip';
    if (this.labDropdownBase) {
      this.pDropdown.styleClass = this.labDropdownBase;
    }
  }

  ngOnChanges(): void {
    if (this.labDropdownBase) {
      this.pDropdown.styleClass = this.labDropdownBase;
    } else {
      this.pDropdown.styleClass = '';
    }
  }
}
