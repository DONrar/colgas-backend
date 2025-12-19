import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminEditarProductosPage } from './admin-editar-productos.page';

describe('AdminEditarProductosPage', () => {
  let component: AdminEditarProductosPage;
  let fixture: ComponentFixture<AdminEditarProductosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEditarProductosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
