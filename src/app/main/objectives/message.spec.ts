import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Message } from './message';

describe('Message', () => {
  let component: Message;
  let fixture: ComponentFixture<Message>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Message],
    }).compileComponents();

    fixture = TestBed.createComponent(Message);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
