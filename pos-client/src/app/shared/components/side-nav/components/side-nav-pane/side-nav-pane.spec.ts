import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideNavPane } from './side-nav-pane';

describe('SideNavPane', () => {
  let component: SideNavPane;
  let fixture: ComponentFixture<SideNavPane>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideNavPane]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideNavPane);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
