import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEmpresaComponent } from './add-empresa.component';

describe('AddEmpresaComponent', () => {
  let component: AddEmpresaComponent;
  let fixture: ComponentFixture<AddEmpresaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEmpresaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
