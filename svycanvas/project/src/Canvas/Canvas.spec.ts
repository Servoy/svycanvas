import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ServoyPublicService, WindowRefService } from '@servoy/public';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Canvas } from './Canvas';

describe('Canvas', () => {
  let component: Canvas;
  let fixture: ComponentFixture<Canvas>;

  beforeEach(async () => {
    const mockWindowRef = {
      nativeWindow: {
        ...window,
        cancelAnimationFrame: vi.fn(),
        webkitCancelRequestAnimationFrame: undefined,
        mozCancelRequestAnimationFrame: undefined,
        oCancelRequestAnimationFrame: undefined,
        msCancelRequestAnimationFrame: undefined,
      },
    };

    await TestBed.configureTestingModule({
      imports: [Canvas],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ServoyPublicService, useValue: {} },
        { provide: WindowRefService, useValue: mockWindowRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Canvas);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('servoyApi', {
      getMarkupId: vi.fn().mockReturnValue('test-id'),
      trustAsHtml: vi.fn(),
      registerComponent: vi.fn(),
      unRegisterComponent: vi.fn(),
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
