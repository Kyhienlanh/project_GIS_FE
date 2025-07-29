import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxChart } from './checkbox-chart';

describe('CheckboxChart', () => {
  let component: CheckboxChart;
  let fixture: ComponentFixture<CheckboxChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckboxChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
