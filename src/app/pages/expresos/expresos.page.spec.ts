import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpresosPage } from './expresos.page';

describe('ExpresosPage', () => {
  let component: ExpresosPage;
  let fixture: ComponentFixture<ExpresosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpresosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
