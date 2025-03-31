import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceteReportComponent } from './balancete-report.component';

describe('BalanceteReportComponent', () => {
  let component: BalanceteReportComponent;
  let fixture: ComponentFixture<BalanceteReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceteReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalanceteReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
