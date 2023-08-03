import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomHandler } from 'primeng/dom';
import { TabView } from 'primeng/tabview';

import { TestModule } from 'src/tests';

@Component({
  template: `<p-tabView></p-tabView>`,
})
class TestTabViewOverrideDirectiveComponent {
  @ViewChild(TabView) child?: TabView;
}

describe('TabViewOverrideDirective', () => {
  let component: TestTabViewOverrideDirectiveComponent;
  let fixture: ComponentFixture<TestTabViewOverrideDirectiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestTabViewOverrideDirectiveComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TestTabViewOverrideDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('updateButtonState', () => {
    it('should disable forward button if scrollLeft is greater than scrollWidth - width', () => {
      spyOn(DomHandler, 'getWidth').and.returnValue(10000);
      component.child!.updateButtonState();
      expect(component.child!.forwardIsDisabled).toBeTrue();
    });

    it('should do nothing if content is undefined', () => {
      spyOn(DomHandler, 'getWidth');
      component.child!.content = undefined;
      component.child!.updateButtonState();
      expect(DomHandler.getWidth).not.toHaveBeenCalled();
    });
  });
});
