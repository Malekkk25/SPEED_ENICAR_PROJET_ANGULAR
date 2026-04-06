import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentOverviewComponent } from './student-overview';

describe('StudentOverviewComponent', () => {
  let component: StudentOverviewComponent;
  let fixture: ComponentFixture<StudentOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentOverviewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
