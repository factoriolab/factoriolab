import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';

import { ContentComponent } from '~/components/content/content.component';
import { TestModule } from '~/tests';

import { DropdownTranslateDirective } from './dropdown-translate.directive';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    DropdownModule,
    ContentComponent,
    DropdownTranslateDirective,
  ],
  template: `<p-dropdown
      labDropdownTranslate
      [options]="options"
      [ngModel]="value"
      (onChange)="onChange($event)"
    ></p-dropdown
    ><lab-content></lab-content>`,
})
class TestDropdownTranslateDirectiveComponent {
  options: SelectItem[] = [];
  value = null;
  onChange(_: unknown): void {}
}

describe('DropdownTranslateDirective', () => {
  let component: TestDropdownTranslateDirectiveComponent;
  let fixture: ComponentFixture<TestDropdownTranslateDirectiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, TestDropdownTranslateDirectiveComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestDropdownTranslateDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
