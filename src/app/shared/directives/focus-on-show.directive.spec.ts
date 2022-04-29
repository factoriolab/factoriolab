import { Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FocusOnShowDirective } from './focus-on-show.directive';

@Component({
  template: `<input #input *ngIf="show" labFocus />`,
})
class TestFocusOnShowDirectiveComponent {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  show = false;
}

describe('FocusOnShowDirective', () => {
  let component: TestFocusOnShowDirectiveComponent;
  let fixture: ComponentFixture<TestFocusOnShowDirectiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FocusOnShowDirective, TestFocusOnShowDirectiveComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestFocusOnShowDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should focus and select the element', () => {
      component.show = true;
      fixture.detectChanges();
      expect(document.activeElement).toBe(component.input.nativeElement);
    });
  });
});
