import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDetallePedidoPage } from './admin-detalle-pedido.page';

describe('AdminDetallePedidoPage', () => {
  let component: AdminDetallePedidoPage;
  let fixture: ComponentFixture<AdminDetallePedidoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDetallePedidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
