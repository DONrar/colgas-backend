import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminListaExpresoPage } from './admin-lista-expreso.page';

describe('AdminListaExpresoPage', () => {
  let component: AdminListaExpresoPage;
  let fixture: ComponentFixture<AdminListaExpresoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminListaExpresoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
