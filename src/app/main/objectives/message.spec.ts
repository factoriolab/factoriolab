import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests/test-module';

import { Message } from './message';

describe('Message', () => {
  let component: Message;
  let fixture: ComponentFixture<Message>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Message],
    }).compileComponents();

    fixture = TestBed.createComponent(Message);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
