import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideNavMenuItems } from './side-nav-menu-items';

describe('SideNavMenuItems', () => {
  let component: SideNavMenuItems;
  let fixture: ComponentFixture<SideNavMenuItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideNavMenuItems]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideNavMenuItems);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
