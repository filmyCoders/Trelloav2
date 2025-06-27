import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageshowComponent } from './imageshow.component';

describe('ImageshowComponent', () => {
  let component: ImageshowComponent;
  let fixture: ComponentFixture<ImageshowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImageshowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageshowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
