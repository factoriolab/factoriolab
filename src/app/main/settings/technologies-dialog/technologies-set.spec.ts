import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { TechnologiesSet } from './technologies-set';

describe('TechnologiesSet', () => {
  let component: TechnologiesSet;
  let fixture: ComponentFixture<TechnologiesSet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, TechnologiesSet],
    }).compileComponents();

    fixture = TestBed.createComponent(TechnologiesSet);
    setInputs(fixture, { text: '', ids: [] });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
