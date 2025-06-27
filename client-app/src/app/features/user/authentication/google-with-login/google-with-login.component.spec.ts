import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleWithLoginComponent } from './google-with-login.component';

describe('GoogleWithLoginComponent', () => {
  let component: GoogleWithLoginComponent;
  let fixture: ComponentFixture<GoogleWithLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GoogleWithLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleWithLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
