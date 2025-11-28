import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StartTripPagePage } from './start-trip-page.page';

describe('StartTripPagePage', () => {
  let component: StartTripPagePage;
  let fixture: ComponentFixture<StartTripPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StartTripPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
