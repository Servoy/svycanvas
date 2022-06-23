import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { Canvas } from './Canvas';

describe('Canvas', () => {
  let component: Canvas;
  let fixture: ComponentFixture<Canvas>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ Canvas ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Canvas);
    component = fixture.componentInstance;
    component.servoyApi =  jasmine.createSpyObj('ServoyApi', ['getMarkupId','trustAsHtml','registerComponent','unRegisterComponent']);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
