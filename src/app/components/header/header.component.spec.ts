import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MockStore } from '@ngrx/store/testing';

import { Mocks, TestModule } from 'src/tests';
import { Game } from '~/models';
import { Products } from '~/store';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: Router;
  let title: Title;
  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    router = TestBed.inject(Router);
    title = TestBed.inject(Title);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should update the page title with the first product name', () => {
      spyOn(title, 'setTitle');
      mockStore.overrideSelector(Products.getBaseProducts, Mocks.ProductsList);
      mockStore.refreshState();
      expect(title.setTitle).toHaveBeenCalledWith('Wooden chest | title.lab');
    });
  });

  describe('buildGameOptions', () => {
    it('should return a filtered list of game menu items', () => {
      const result = component.buildGameOptions(Game.Factorio);
      expect(result.length).toEqual(3);
      spyOn(component, 'selectGame');
      result[0].command!();
      expect(component.selectGame).toHaveBeenCalled();
    });
  });

  describe('selectGame', () => {
    it('should call the router to navigate', () => {
      spyOn(router, 'navigateByUrl');
      component.selectGame('test');
      expect(router.navigateByUrl).toHaveBeenCalledWith('test');
    });
  });
});
