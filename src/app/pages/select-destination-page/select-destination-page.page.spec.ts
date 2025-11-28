mport { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectDestinationPagePage } from './select-destination-page.page';

describe('SelectDestinationPagePage', () => {
  let component: SelectDestinationPagePage;
  let fixture: ComponentFixture<SelectDestinationPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectDestinationPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
