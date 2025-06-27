import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLoaderComponent } from './admin-loader.component';

describe('AdminLoaderComponent', () => {
  let component: AdminLoaderComponent;
  let fixture: ComponentFixture<AdminLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
