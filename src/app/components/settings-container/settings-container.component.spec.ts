import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Id } from '~/models';
import { TestUtility } from '~/utilities/test';
import { SettingsComponent } from './settings/settings.component';
import { SettingsContainerComponent } from './settings-container.component';

@Component({
  selector: 'lab-test-settings-container',
  template: `
    <div id=${Id.Away}></div>
    <lab-settings-container (cancel)="cancel()"> </lab-settings-container>
  `
})
class TestSettingsContainerComponent {
  @ViewChild(SettingsContainerComponent) child: SettingsContainerComponent;
  cancel() {}
}

describe('SettingsContainerComponent', () => {
  let component: TestSettingsContainerComponent;
  let fixture: ComponentFixture<TestSettingsContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SettingsComponent,
        SettingsContainerComponent,
        TestSettingsContainerComponent
      ]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TestSettingsContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should cancel when clicked away', () => {
    spyOn(component, 'cancel');
    TestUtility.clickId(fixture, Id.Away);
    expect(component.cancel).toHaveBeenCalled();
  });

  it('should not cancel when clicked on', () => {
    spyOn(component, 'cancel');
    TestUtility.clickSelector(fixture, 'lab-settings-container');
    expect(component.cancel).not.toHaveBeenCalled();
  });
});
