import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests/test-module';

import { Data } from './data';

describe('Data', () => {
  let component: Data;
  let fixture: ComponentFixture<Data>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Data],
    }).compileComponents();

    fixture = TestBed.createComponent(Data);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
