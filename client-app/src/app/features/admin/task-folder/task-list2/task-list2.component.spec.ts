import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskList2Component } from './task-list2.component';

describe('TaskList2Component', () => {
  let component: TaskList2Component;
  let fixture: ComponentFixture<TaskList2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskList2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskList2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
