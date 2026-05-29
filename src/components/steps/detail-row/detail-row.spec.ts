import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { DetailRow } from './detail-row';

describe('DetailRow', () => {
  let component: DetailRow;
  let fixture: ComponentFixture<DetailRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, DetailRow],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailRow);
    setInputs(fixture, { value: {}, leftSpan: 0 });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // describe('inserterId', () => {
  //   it('should determine the best initial inserterId to use', () => {
  //     expect(component['inserterId']()).toEqual('id');
  //   });
  // });
});
