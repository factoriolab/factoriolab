import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { LocationDetail } from './location-detail';

describe('LocationDetail', () => {
  let component: LocationDetail;
  let fixture: ComponentFixture<LocationDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, LocationDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationDetail);
    setInputs(fixture, { id: 'id', collectionLabel: 'collectionLabel' });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
