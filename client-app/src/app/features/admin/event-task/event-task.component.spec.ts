import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTaskComponent } from './event-task.component';

describe('EventTaskComponent', () => {
  let component: EventTaskComponent;
  let fixture: ComponentFixture<EventTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventTaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
