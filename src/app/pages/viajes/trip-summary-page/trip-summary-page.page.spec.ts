import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripSummaryPagePage } from './trip-summary-page.page';

describe('TripSummaryPagePage', () => {
  let component: TripSummaryPagePage;
  let fixture: ComponentFixture<TripSummaryPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TripSummaryPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
