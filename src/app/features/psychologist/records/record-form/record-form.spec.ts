import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordFormComponent } from './record-form';

describe('RecordFormComponent', () => {
  let component: RecordFormComponent;
  let fixture: ComponentFixture<RecordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
