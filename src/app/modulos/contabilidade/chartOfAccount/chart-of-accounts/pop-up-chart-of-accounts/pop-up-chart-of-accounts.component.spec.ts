import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpChartOfAccountsComponent } from './pop-up-chart-of-accounts.component';

describe('PopUpChartOfAccountsComponent', () => {
  let component: PopUpChartOfAccountsComponent;
  let fixture: ComponentFixture<PopUpChartOfAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopUpChartOfAccountsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpChartOfAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
