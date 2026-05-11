import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Control } from '~/components/control';
import { Select } from '~/components/select/select';
import { TestModule } from '~/tests';

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

  describe('template', () => {
    it('should set the game', () => {
      vi.spyOn(component, 'setGame').mockImplementation(() => {});
      const debugEl = fixture.debugElement.query(By.directive(Select));
      (debugEl.componentInstance as Control).setValue('satisfactory');
      expect(component.setGame).toHaveBeenCalledWith('satisfactory');
    });
  });
});
