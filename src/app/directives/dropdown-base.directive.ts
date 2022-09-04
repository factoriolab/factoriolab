import { Directive, OnInit, Self } from '@angular/core';
import { Dropdown } from 'primeng/dropdown';

@Directive({
  selector: '[labDropdownBase]',
})
export class DropdownBaseDirective implements OnInit {
  constructor(@Self() private readonly pDropdown: Dropdown) {}

  ngOnInit(): void {
    this.pDropdown.appendTo = 'body';
    this.pDropdown.filter = true;
    this.pDropdown.scrollHeight = '40vh';
  }
}
