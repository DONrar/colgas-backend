import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminListaPedidosPage } from './admin-lista-pedidos.page';

describe('AdminListaPedidosPage', () => {
  let component: AdminListaPedidosPage;
  let fixture: ComponentFixture<AdminListaPedidosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminListaPedidosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
