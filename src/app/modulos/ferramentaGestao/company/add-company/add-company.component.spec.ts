import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCompanyComponent } from './add-company.component';

describe('AddEmpresaComponent', () => {
  let component: AddCompanyComponent;
  let fixture: ComponentFixture<AddCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
