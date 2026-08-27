import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, ViewChild, signal, ChangeDetectionStrategy } from '@angular/core';
import { ServoyApiTesting, ServoyPublicService, WindowRefService } from '@servoy/public';
import { Canvas, canvasObject, CanvasOptions } from './Canvas';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { describe, it, expect, vi } from 'vitest';

@Component({
    template: `
        <div style="width: 800px; height: 500px;">
            <svycanvas-Canvas #element
                [servoyApi]="servoyApi"
                [canvasObjects]="canvasObjects()"
                [showGrid]="showGrid()"
                [snapToGrid]="snapToGrid()"
                [gridSize]="gridSize()"
                [canvasOptions]="canvasOptions()"
                [imagesLoader]="imagesLoader()"
                [styleClass]="styleClass()"
                [defObj]="defObj()"
                [isDrawing]="isDrawing()"
                [onReady]="onReadyCallback"
                style="width: 100%; height: 500px">
            </svycanvas-Canvas>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [Canvas],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
class WrapperComponent {
    canvasObjects = signal<canvasObject[]>([]);
    showGrid = signal<boolean>(true);
    snapToGrid = signal<boolean>(true);
    gridSize = signal<number>(50);
    canvasOptions = signal<CanvasOptions>({
        selectable: 1,
        skipTargetFind: false,
        hasRotatingPoint: 1,
        renderOnAddRemove: false,
        skipOffscreen: true,
        ZoomOnMouseScroll: 0,
        animationSpeed: 100
    } as any);
    imagesLoader = signal<any>({});
    styleClass = signal<string>('canvas-border');
    defObj = signal<any>({
        id: '', angle: 0, fontSize: 8, text: '', fontFamily: 'Times New Roman',
        scaleX: 1, scaleY: 1, left: 0, top: 0, width: 50, height: 300, radius: 0,
        fill: '#000000', opacity: 1, mediaName: '', stroke: '', strokeWidth: 1,
        spriteName: '', spriteWidth: 50, spriteHeight: 72, spriteIndex: 0,
        frameTime: 100, objectType: '', rx: 0, ry: 0, flipX: 0, flipY: 0,
        textAlign: 'left', selectable: null, ctrl: null, objects: null, points: null, path: ''
    });
    isDrawing = signal<boolean>(false);
    servoyApi: any;

    private _resolveReady!: () => void;
    readonly gridReady = new Promise<void>(resolve => this._resolveReady = resolve);
    userOnReady?: () => void;

    readonly onReadyCallback = () => {
        this._resolveReady();
        this.userOnReady?.();
    };

    @ViewChild('element') element!: Canvas;
}

async function setupCanvas(overrides?: {
    onReady?: () => void;
    waitForReady?: boolean;
}): Promise<ComponentFixture<WrapperComponent>> {
    const mockWindowRef = {
        nativeWindow: {
            ...window,
            cancelAnimationFrame: vi.fn(),
        },
    };

    await TestBed.configureTestingModule({
        imports: [WrapperComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
            { provide: ServoyPublicService, useValue: {} },
            { provide: WindowRefService, useValue: mockWindowRef },
        ],
        teardown: { destroyAfterEach: false }
    }).compileComponents();

    const fixture = TestBed.createComponent(WrapperComponent);
    const wrapper = fixture.componentInstance;
    wrapper.servoyApi = new ServoyApiTesting() as any;
    if (overrides?.onReady) wrapper.userOnReady = overrides.onReady;
    fixture.detectChanges();

    if (overrides?.waitForReady !== false) {
        await wrapper.gridReady;
        fixture.detectChanges();
    }

    return fixture;
}

describe('Canvas - browser rendering', () => {
    it('should mount the canvas component', async () => {
        const fixture = await setupCanvas();
        const el = fixture.nativeElement.querySelector('svycanvas-Canvas');
        expect(el).not.toBeNull();
    });

    it('should call onReady when canvas is initialized', async () => {
        const onReady = vi.fn();
        await setupCanvas({ onReady });
        expect(onReady).toHaveBeenCalled();
    });

    it('should add an object to the canvas', async () => {
        const fixture = await setupCanvas();
        const canvas = fixture.componentInstance.element;
        expect(canvas.canvas).toBeTruthy();

        const fakeUUID = 'test-uuid-12345';
        (window as any).application = {
            getUUID: () => ({ toString: () => fakeUUID })
        };

        const obj = {
            id: fakeUUID,
            objectType: 'Rect',
            scaleX: 1, scaleY: 1,
            left: 200, width: 100, height: 100,
            angle: 0, opacity: 1,
            strokeWidth: 1, stroke: '#000000',
            top: 100, ctrl: { mtr: false }
        };

        canvas.addObject([obj], true);
        const addedObj = canvas.canvas.getObjects().find((o: any) => o.id === fakeUUID);
        expect(addedObj).toBeTruthy();
        expect(addedObj.id).toBe(fakeUUID);
    });
});
