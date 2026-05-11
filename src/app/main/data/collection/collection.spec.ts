import { ComponentFixture, TestBed } from '@angular/core/testing';

import { setInputs, TestModule } from '~/tests';

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
      iconType: 'system',
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
