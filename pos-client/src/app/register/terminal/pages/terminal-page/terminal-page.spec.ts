import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalPage } from './terminal-page';

describe('TerminalPage', () => {
  let component: TerminalPage;
  let fixture: ComponentFixture<TerminalPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerminalPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerminalPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
