import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminListaProductosPage } from './admin-lista-productos.page';

describe('AdminListaProductosPage', () => {
  let component: AdminListaProductosPage;
  let fixture: ComponentFixture<AdminListaProductosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminListaProductosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
