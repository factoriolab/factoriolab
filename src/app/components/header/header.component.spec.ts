import { ViewChild, Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Id } from '~/models';
import { TestUtility } from '~/utilities/test';
import { IconComponent } from '../icon/icon.component';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'lab-test-header',
  template: `
    <lab-header (toggleSettings)="toggleSettings()"></lab-header>
  `
})
class TestHeaderComponent {
  @ViewChild(HeaderComponent) child: HeaderComponent;
  toggleSettings() {}
}

describe('HeaderComponent', () => {
  let component: TestHeaderComponent;
  let fixture: ComponentFixture<TestHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IconComponent, HeaderComponent, TestHeaderComponent]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TestHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the settings panel', () => {
    spyOn(component, 'toggleSettings');
    TestUtility.clickId(fixture, Id.HeaderSettings);
    expect(component.toggleSettings).toHaveBeenCalled();
  });

  it('should stop propagation when settings is clicked', () => {
    const testEvent: any = { stopPropagation: () => {} };
    spyOn(testEvent, 'stopPropagation');
    component.child.settingsClicked(testEvent);
    expect(testEvent.stopPropagation).toHaveBeenCalled();
  });
});
