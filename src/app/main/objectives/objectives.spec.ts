import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import {
  mockObjective1,
  mockObjective5,
  mockObjectiveBase,
} from '~/tests/mocks/objective';
import { TestModule } from '~/tests/test-module';

import { Objectives } from './objectives';

describe('Objectives', () => {
  let component: Objectives;
  let fixture: ComponentFixture<Objectives>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Objectives],
    }).compileComponents();

    fixture = TestBed.createComponent(Objectives);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('addObjective', () => {
    it('should call the objectives store with the passed value', () => {
      spyOn(component['objectivesStore'], 'add');
      component.addObjective(mockObjectiveBase);
      expect(component['objectivesStore'].add).toHaveBeenCalledWith(
        mockObjectiveBase,
      );
    });
  });

  describe('drop', () => {
    it('should call the objectives store with the new order', () => {
      spyOn(component['objectivesStore'], 'setOrder');
      spyOn<any>(component, 'objectives').and.returnValue(['a', 'b']);
      component.drop({ previousIndex: 0, currentIndex: 1 } as CdkDragDrop<
        string[]
      >);
      expect(component['objectivesStore'].setOrder).toHaveBeenCalledWith([
        'b',
        'a',
      ] as any);
    });
  });

  describe('changeTarget', () => {
    it('should pick a recipe', () => {
      spyOn(component['picker'], 'pickRecipe').and.returnValue(of('id'));
      spyOn(component['objectivesStore'], 'updateRecord');
      component.changeTarget(mockObjective5);
      expect(component['objectivesStore'].updateRecord).toHaveBeenCalledWith(
        mockObjective5.id,
        { targetId: 'id' },
      );
    });

    it('should pick an item', () => {
      spyOn(component['picker'], 'pickItem').and.returnValue(of('id'));
      spyOn(component['objectivesStore'], 'updateRecord');
      component.changeTarget(mockObjective1);
      expect(component['objectivesStore'].updateRecord).toHaveBeenCalledWith(
        mockObjective1.id,
        { targetId: 'id' },
      );
    });
  });
});
