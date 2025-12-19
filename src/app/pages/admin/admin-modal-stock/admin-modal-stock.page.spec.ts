import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminModalStockPage } from './admin-modal-stock.page';

describe('AdminModalStockPage', () => {
  let component: AdminModalStockPage;
  let fixture: ComponentFixture<AdminModalStockPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminModalStockPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
