import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminProductosPagePage } from './admin-productos-page.page';

describe('AdminProductosPagePage', () => {
  let component: AdminProductosPagePage;
  let fixture: ComponentFixture<AdminProductosPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminProductosPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
