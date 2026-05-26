import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import { ItemId } from '~/tests/item-id';
import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { Icon } from './icon';

describe('Icon', () => {
  let component: Icon;
  let fixture: ComponentFixture<Icon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Icon],
    }).compileComponents();

    fixture = TestBed.createComponent(Icon);
    setInputs(fixture, { value: 'value' });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('icon', () => {
    it('should return an icon by icon type', () => {
      setInputs(fixture, { value: ItemId.AdvancedCircuit, type: 'item' });
      expect(component['icon']()).toBeTruthy();
    });

    it('should return undefined if an IconDefinition is specified', () => {
      setInputs(fixture, { value: faXmark });
      expect(component['icon']()).toBeUndefined();
    });
  });

  describe('faIcon', () => {
    it('should return the value if it is an IconDefinition', () => {
      setInputs(fixture, { value: faXmark });
      expect(component['faIcon']()).toEqual(faXmark);
    });
  });
});
