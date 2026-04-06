import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordListComponent } from './record-list';

describe('RecordListComponent', () => {
  let component: RecordListComponent;
  let fixture: ComponentFixture<RecordListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
