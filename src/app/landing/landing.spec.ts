import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { mockObjectiveBase } from '~/tests/mocks/objective';
import { TestModule } from '~/tests/test-module';

import { Landing } from './landing';

describe('Landing', () => {
  let component: Landing;
  let fixture: ComponentFixture<Landing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Landing],
    }).compileComponents();

    fixture = TestBed.createComponent(Landing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('openPicker', () => {
    it('should navigate and then create an objective', async () => {
      spyOn(component['objectiveForm'], 'openPicker').and.returnValue(
        of(mockObjectiveBase),
      );
      spyOn(component['router'], 'navigate').and.returnValue(
        Promise.resolve(true),
      );
      spyOn(component['objectivesStore'], 'create');
      component.openPicker();
      await TestBed.inject(ApplicationRef).whenStable();
      expect(component['router'].navigate).toHaveBeenCalled();
      expect(component['objectivesStore'].create).toHaveBeenCalledWith(
        mockObjectiveBase,
      );
    });
  });

  describe('setState', () => {
    it('should return if query is falsy', () => {
      spyOn(component['router'], 'navigate');
      component.setState('');
      expect(component['router'].navigate).not.toHaveBeenCalled();
    });

    it('should call the router to navigate', () => {
      spyOn(component['router'], 'navigate');
      component.setState('z=zip');
      expect(component['router'].navigate).toHaveBeenCalledWith(['list'], {
        queryParams: { z: 'zip' },
        relativeTo: component['route'],
      });
    });
  });
});
