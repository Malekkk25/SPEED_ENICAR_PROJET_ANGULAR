import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsychologistShellComponent } from './psychologist-shell';

describe('PsychologistShellComponent', () => {
  let component: PsychologistShellComponent;
  let fixture: ComponentFixture<PsychologistShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PsychologistShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PsychologistShellComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
