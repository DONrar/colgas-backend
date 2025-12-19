import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpresoConfirmadoPage } from './expreso-confirmado.page';

describe('ExpresoConfirmadoPage', () => {
  let component: ExpresoConfirmadoPage;
  let fixture: ComponentFixture<ExpresoConfirmadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpresoConfirmadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
