import { ComponentFixture, TestBed } from '@angular/core/testing';

import { setInputs } from '~/tests/utils';

import { Tabs } from './tabs';

describe('Tabs', () => {
  let component: Tabs;
  let fixture: ComponentFixture<Tabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tabs],
    }).compileComponents();

    fixture = TestBed.createComponent(Tabs);
    setInputs(fixture, { tabs: [] });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
