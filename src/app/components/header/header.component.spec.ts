import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { MockStore } from '@ngrx/store/testing';

import { Mocks, TestModule } from 'src/tests';
import { Game, gameOptions } from '~/models';
import { Objectives } from '~/store';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let title: Title;
  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    title = TestBed.inject(Title);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should update the page title with the first objective name', () => {
      spyOn(title, 'setTitle');
      mockStore.overrideSelector(
        Objectives.getBaseObjectives,
        Mocks.ObjectivesList,
      );
      mockStore.refreshState();
      expect(title.setTitle).toHaveBeenCalledWith(
        'Advanced circuit | FactorioLab',
      );
    });
  });

  describe('buildGameOptions', () => {
    it('should return a filtered list of game menu items', () => {
      const result = component.buildGameOptions(Game.Factorio);
      expect(result.length).toEqual(gameOptions.length - 1);
    });
  });

  describe('cancelRouterLink', () => {
    it('should prevent the dropdown from being treated as an anchor', () => {
      const event = {
        preventDefault: (): void => {},
        stopPropagation: (): void => {},
      };
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');
      component.cancelRouterLink(event as any);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });
});
