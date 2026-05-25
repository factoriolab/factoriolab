import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { AccordionItem } from './accordion-item';

describe('AccordionItem', () => {
  let component: AccordionItem;
  let fixture: ComponentFixture<AccordionItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, AccordionItem],
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionItem);
    setInputs(fixture, { text: '' });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
