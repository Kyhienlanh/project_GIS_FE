import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Layer } from './layer';

describe('Layer', () => {
  let component: Layer;
  let fixture: ComponentFixture<Layer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Layer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
