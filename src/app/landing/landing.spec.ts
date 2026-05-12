import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, TestModule } from '~/tests';

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

  describe('addObjective', () => {
    it('should navigate and then create an objective', async () => {
      vi.spyOn(component['router'], 'navigate').mockReturnValue(
        Promise.resolve(true),
      );
      vi.spyOn(component['objectivesStore'], 'create');
      await component.addObjective(Mocks.objectiveBase);
      expect(component['router'].navigate).toHaveBeenCalled();
      expect(component['objectivesStore'].create).toHaveBeenCalledWith(
        Mocks.objectiveBase,
      );
    });
  });

  describe('setState', () => {
    it('should return if query is falsy', () => {
      vi.spyOn(component['router'], 'navigate');
      component.setState('');
      expect(component['router'].navigate).not.toHaveBeenCalled();
    });

    it('should call the router to navigate', () => {
      vi.spyOn(component['router'], 'navigate');
      component.setState('z=zip');
      expect(component['router'].navigate).toHaveBeenCalledWith(['list'], {
        queryParams: { z: 'zip' },
        relativeTo: component['route'],
      });
    });
  });

  describe('setGame', () => {
    it('should map a game to its default mod id', () => {
      vi.spyOn(component, 'setMod').mockImplementation(() => {});
      component.setGame('factorio');
      expect(component.setMod).toHaveBeenCalledWith('spa');
    });
  });

  describe('setMod', () => {
    it('should navigate using the router', () => {
      vi.spyOn(component['router'], 'navigate');
      component.setMod('id');
      expect(component['router'].navigate).toHaveBeenCalledWith(['id']);
    });
  });
});
