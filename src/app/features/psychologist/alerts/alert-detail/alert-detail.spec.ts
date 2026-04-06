import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertDetailComponent } from './alert-detail';

describe('AlertDetailComponent', () => {
  let component: AlertDetailComponent;
  let fixture: ComponentFixture<AlertDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
