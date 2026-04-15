import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartConsultationButtonComponent } from './start-consultation-button-component.component';

describe('StartConsultationButtonComponent', () => {
  let component: StartConsultationButtonComponent;
  let fixture: ComponentFixture<StartConsultationButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartConsultationButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartConsultationButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
