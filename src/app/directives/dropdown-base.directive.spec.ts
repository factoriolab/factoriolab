import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';

import { ContentComponent } from '~/components/content/content.component';
import { TestModule } from '~/tests';

import { DropdownBaseDirective } from './dropdown-base.directive';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    DropdownModule,
    ContentComponent,
    DropdownBaseDirective,
  ],
  template: `<p-dropdown
      labDropdownBase
      [options]="options"
      [ngModel]="value"
      (onChange)="onChange($event)"
    ></p-dropdown
    ><lab-content></lab-content>`,
})
class TestDropdownBaseDirectiveComponent {
  options: SelectItem[] = [];
  value = null;
  onChange(_: unknown): void {}
}

describe('DropdownBaseDirective', () => {
  let component: TestDropdownBaseDirectiveComponent;
  let fixture: ComponentFixture<TestDropdownBaseDirectiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, TestDropdownBaseDirectiveComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestDropdownBaseDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
