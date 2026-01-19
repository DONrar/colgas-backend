import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoutButtonPage } from './logout-button.page';

describe('LogoutButtonPage', () => {
  let component: LogoutButtonPage;
  let fixture: ComponentFixture<LogoutButtonPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoutButtonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
