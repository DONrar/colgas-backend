import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapaSelectorPage } from './mapa-selector.page';

describe('MapaSelectorPage', () => {
  let component: MapaSelectorPage;
  let fixture: ComponentFixture<MapaSelectorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MapaSelectorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
