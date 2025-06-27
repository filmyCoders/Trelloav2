import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminToasterComponent } from './admin-toaster.component';

describe('AdminToasterComponent', () => {
  let component: AdminToasterComponent;
  let fixture: ComponentFixture<AdminToasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminToasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminToasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
