import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { initialColumnsState } from '~/state/preferences/columns-state';
import { Mocks } from '~/tests/mocks/mocks';
import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { Steps } from './steps';

describe('Steps', () => {
  let component: Steps;
  let fixture: ComponentFixture<Steps>;
  let mocks: Mocks;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Steps],
    }).compileComponents();

    fixture = TestBed.createComponent(Steps);
    mocks = TestBed.inject(Mocks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('steps', () => {
    it('should filter by the selected id', async () => {
      spyOn(component['objectivesStore'], 'steps').and.returnValue(
        mocks.steps(),
      );
      setInputs(fixture, { selectedId: mocks.step1().id, focus: true });
      await TestBed.inject(ApplicationRef).whenStable();
      expect(component['steps']()).toHaveSize(1);
    });
  });

  describe('sortedSteps', () => {
    it('should sort based on the specified column', () => {
      spyOn<any>(component, 'steps').and.returnValue(mocks.steps());
      component['tableStore'].apply({ sort: 'wagons', asc: true });
      expect(component['sortedSteps']()).toEqual([
        mocks.step2(),
        mocks.step1(),
      ]);
    });
  });

  describe('leftSpan', () => {
    it('should account for the checkbox and tree columns', () => {
      expect(component['leftSpan']()).toEqual(3);
      component['preferencesStore'].apply({
        columns: {
          ...initialColumnsState,
          ...{
            checkbox: { ...initialColumnsState.checkbox, ...{ show: true } },
          },
        },
      });
      expect(component['leftSpan']()).toEqual(4);
    });
  });
});
