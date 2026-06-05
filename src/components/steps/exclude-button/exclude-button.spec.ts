import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemId } from '~/tests/item-id';
import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { ExcludeButton } from './exclude-button';

describe('ExcludeButton', () => {
  let component: ExcludeButton;
  let fixture: ComponentFixture<ExcludeButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, ExcludeButton],
    }).compileComponents();

    fixture = TestBed.createComponent(ExcludeButton);
    setInputs(fixture, { itemId: ItemId.ElectronicCircuit });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('tooltip', () => {
    it('should switch based on whether the item is excluded', () => {
      expect(component['tooltip']()).toEqual('steps.excludeItemTooltip');
      component['settingsStore'].apply({
        excludedItemIds: new Set([ItemId.ElectronicCircuit]),
      });
      expect(component['tooltip']()).toEqual('steps.includeItemTooltip');
    });
  });

  describe('changeItemExcluded', () => {
    it('should toggle whether the item is excluded', () => {
      spyOn(component['settingsStore'], 'apply');
      component.changeItemExcluded();
      expect(component['settingsStore'].apply).toHaveBeenCalledWith({
        excludedItemIds: new Set([ItemId.ElectronicCircuit]),
      });
    });
  });
});
