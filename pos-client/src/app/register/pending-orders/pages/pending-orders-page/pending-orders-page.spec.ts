import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingOrdersPage } from './pending-orders-page';

describe('PendingOrdersPage', () => {
  let component: PendingOrdersPage;
  let fixture: ComponentFixture<PendingOrdersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingOrdersPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingOrdersPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
