import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentHistoryComponent } from './student-history';

describe('StudentHistoryComponent', () => {
  let component: StudentHistoryComponent;
  let fixture: ComponentFixture<StudentHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentHistoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
