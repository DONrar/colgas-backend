import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpresoDetallePage } from './expreso-detalle.page';

describe('ExpresoDetallePage', () => {
  let component: ExpresoDetallePage;
  let fixture: ComponentFixture<ExpresoDetallePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpresoDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
