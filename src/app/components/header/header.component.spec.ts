import { ViewChild, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { Mocks, TestUtility, ElementId } from 'src/tests';
import { IconComponent } from '../icon/icon.component';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'lab-test-header',
  template: `
    <lab-header
      [data]="data"
      (toggleSettings)="toggleSettings()"
      (hideHeader)="hideHeader()"
    ></lab-header>
  `,
})
class TestHeaderComponent {
  @ViewChild(HeaderComponent) child: HeaderComponent;
  data = Mocks.Data;
  toggleSettings() {}
  hideHeader() {}
}

describe('HeaderComponent', () => {
  let component: TestHeaderComponent;
  let fixture: ComponentFixture<TestHeaderComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [IconComponent, HeaderComponent, TestHeaderComponent],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TestHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the settings panel', () => {
    spyOn(component, 'toggleSettings');
    TestUtility.clickId(fixture, ElementId.HeaderSettings);
    expect(component.toggleSettings).toHaveBeenCalled();
  });

  it('should close the menu when clicked away', () => {
    component.child.menuOpen = true;
    document.body.click();
    expect(component.child.menuOpen).toBeFalse();
  });

  it('should hide the header', () => {
    spyOn(component, 'hideHeader');
    TestUtility.clickId(fixture, ElementId.HeaderMenuToggle);
    fixture.detectChanges();
    TestUtility.clickId(fixture, ElementId.HeaderHide);
    expect(component.hideHeader).toHaveBeenCalled();
  });
});
