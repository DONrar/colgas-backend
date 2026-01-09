import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDetalleExpresoPage } from './admin-detalle-expreso.page';

describe('AdminDetalleExpresoPage', () => {
  let component: AdminDetalleExpresoPage;
  let fixture: ComponentFixture<AdminDetalleExpresoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDetalleExpresoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
