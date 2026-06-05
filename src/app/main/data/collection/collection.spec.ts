import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { Collection } from './collection';

describe('Collection', () => {
  let component: Collection;
  let fixture: ComponentFixture<Collection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Collection],
    }).compileComponents();

    fixture = TestBed.createComponent(Collection);
    setInputs(fixture, {
      label: 'label',
      key: 'categoryIds',
      iconType: 'category',
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
