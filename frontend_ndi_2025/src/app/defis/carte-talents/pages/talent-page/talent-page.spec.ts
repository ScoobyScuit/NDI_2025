import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalentPage } from './talent-page';

describe('TalentPage', () => {
  let component: TalentPage;
  let fixture: ComponentFixture<TalentPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalentPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TalentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
