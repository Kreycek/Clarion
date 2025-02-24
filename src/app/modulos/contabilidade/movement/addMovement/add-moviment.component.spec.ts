import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMovimentComponent } from './add-moviment.component';

describe('AddMovimentComponent', () => {
  let component: AddMovimentComponent;
  let fixture: ComponentFixture<AddMovimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMovimentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddMovimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
