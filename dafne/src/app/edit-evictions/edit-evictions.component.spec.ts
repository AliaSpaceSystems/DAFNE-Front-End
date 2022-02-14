import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEvictionsComponent } from './edit-evictions.component';

describe('EditEvictionsComponent', () => {
  let component: EditEvictionsComponent;
  let fixture: ComponentFixture<EditEvictionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditEvictionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEvictionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
