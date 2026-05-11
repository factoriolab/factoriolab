import { ComponentFixture, TestBed } from '@angular/core/testing';

import { setInputs, TestModule } from '~/tests';

import { Steps } from '../steps';
import { DetailRow } from './detail-row';

describe('DetailRow', () => {
  let component: DetailRow;
  let fixture: ComponentFixture<DetailRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, DetailRow],
      providers: [{ provide: Steps, provideValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailRow);
    setInputs(fixture, { value: {} });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
