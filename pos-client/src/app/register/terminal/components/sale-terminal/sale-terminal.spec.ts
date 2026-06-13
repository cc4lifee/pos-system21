import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleTerminal } from './sale-terminal';

describe('SaleTerminal', () => {
  let component: SaleTerminal;
  let fixture: ComponentFixture<SaleTerminal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleTerminal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleTerminal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
