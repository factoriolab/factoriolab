import { ComponentFixture, TestBed } from '@angular/core/testing';

import { setInputs, TestModule } from '~/tests';

import { Detail } from './detail';

describe('Detail', () => {
  let component: Detail;
  let fixture: ComponentFixture<Detail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Detail],
    }).compileComponents();

    fixture = TestBed.createComponent(Detail);
    setInputs(fixture, { crumbs: [], obj: undefined, type: 'system' });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
