/* eslint-disable @typescript-eslint/no-unused-expressions */
import { canvasObject, CanvasOptions, Canvas } from './Canvas';
import { MountConfig } from 'cypress/angular'
import { ServoyApi, ServoyApiTesting, ServoyPublicTestingModule, JSEvent } from '@servoy/public'
import { Component, SimpleChanges, Input, Renderer2, ChangeDetectorRef, Output, EventEmitter, Inject, ViewChild } from '@angular/core';

@Component({
	template: `
		<svycanvas-Canvas  #element
            [servoyApi]= "servoyApi"
            [canvasObjects]= "canvasObjects"
			[showGrid]= "showGrid"
			[snapToGrid]= "snapToGrid"
			[gridSize]= "gridSize"
			[canvasOptions]= "canvasOptions"
			[imagesLoader]= "imagesLoader"
			[styleClass]= "styleClass"
			[defObj]= "defObj"
			[isDrawing]= "isDrawing"
			[isReady]= "isReady"
			[canvas]= "canvas"
			[render]= "render"
			[grid]= "grid"
			[objects]= "objects"
			[reselect]= "reselect"
			[zoom]= "zoom"
			[zoomX]= "zoomX"
			[zoomY]= "zoomY"
			[objNum]= "objNum"
			[onClick]= "onClick"
			[onLongPress]= "onLongPress"
			[onModified]= "onModified"
			[onReady]= "onReady"
			[afterRender]= "afterRender"
			style="width: 100%; height: 500px" 
            >
        </svycanvas-Canvas>
    `,
	standalone: false
})
class WrapperComponent {

	canvasObjects: Array<canvasObject>;
	showGrid: Boolean;
	snapToGrid: Boolean;
	gridSize: Number;
	canvasOptions: CanvasOptions;
	imagesLoader: any;
	styleClass: String;
	defObj: Object;
	isDrawing: Boolean;
	isReady: Boolean;
	canvas: any;
	render: any;
	grid: any;
	servoyApi: any;
	objects: any;
	images: Object;
	reselect: Array<any>;
	zoom: Number;
	zoomX: Number;
	zoomY: Number;
	objNum: any;

	//handlers
	onClick: (e?: Event, data?: any) => void;
	onLongPress: (e?: Event, data?: any) => void;
	onModified: (e?: Event, data?: any) => void;
	onReady: (e?: Event, data?: any) => void;
	afterRender: (e?: Event, data?: any) => void;

	@ViewChild('element') element: Canvas;
}

describe('Canvas', () => {
	const servoyApiSpy = new ServoyApiTesting();

	const config: MountConfig<Canvas> = {
		declarations: [Canvas],
		imports: [ServoyPublicTestingModule],
	}

	const configWrapper: MountConfig<WrapperComponent> = {
		declarations: [Canvas],
		imports: [ServoyPublicTestingModule]
	}

	beforeEach(() => {
		config.componentProperties = {
			servoyApi: servoyApiSpy,
			canvasObjects: [],
			showGrid: true,
			snapToGrid: true,
			gridSize: 50,
			canvasOptions: {
				selectable: 1,
				skipTargetFind: false,
				hasRotatingPoint: 1,
				renderOnAddRemove: false,
				skipOffscreen: true,
				ZoomOnMouseScroll: 0,
				animationSpeed: 100
			},
			imagesLoader: {},
			styleClass: 'canvas-border',
			defObj: {
				id: '',
				angle: 0,
				fontSize: 8,
				text: '',
				fontFamily: 'Times New Roman',
				scaleX: 1,
				scaleY: 1,
				left: 0,
				top: 0,
				width: 50,
				height: 300,
				radius: 0,
				fill: '#000000',
				opacity: 1,
				mediaName: '',
				stroke: '',
				strokeWidth: 1,
				spriteName: '',
				spriteWidth: 50,
				spriteHeight: 72,
				spriteIndex: 0,
				frameTime: 100,
				objectType: '',
				rx: 0,
				ry: 0,
				flipX: 0,
				flipY: 0,
				textAlign: 'left',
				selectable: null,
				ctrl: null,
				objects: null,
				points: null,
				path: ''
			},
			isDrawing: false,
			isReady: false,
			canvas: {},
			render: {},
			grid: {},
			objects: {},
			images: {},
			reselect: [],
		}
		configWrapper.componentProperties = config.componentProperties;
	});

	it('when map is mounted and registered', () => {

		const registerComponent = cy.stub(servoyApiSpy, 'registerComponent');
		cy.mount(WrapperComponent, configWrapper).then((wrapper) => {
			cy.log('Component Mounted:', wrapper);
		});

		cy.get('svycanvas-Canvas').should('exist'); // Check if the component exists
	});

	it('mounts and adds an item to canvas', () => {
		const fakeUUID = 'mocked-uuid-12345';
	
		// Stub application.getUUID()
		cy.window().then((win) => {
			(win as any).application = {
				getUUID: () => ({ toString: () => fakeUUID })
			};
		});
	
		// Stub servoyApi
		const registerComponent = cy.stub(servoyApiSpy, 'registerComponent');
	
		// Create a spy for onReady and bind it to the wrapper
		const onReadySpy = cy.stub().as('onReadySpy');
	
		configWrapper.componentProperties.onReady = onReadySpy;
	
		// Mount the component
		cy.mount(WrapperComponent, configWrapper);
	
		// Wait until onReadySpy is called
		cy.get('@onReadySpy').should('have.been.calledOnce');

		// Now safely interact with canvas
		cy.get('svycanvas-Canvas').then(($el) => {
			const component = (window as any).ng.getComponent($el[0]);

			expect(component.canvas).to.exist;

			const obj = {
				id: fakeUUID,
				objectType: 'Rect',
				scaleX: 1,
				scaleY: 1,
				left: 200,
				width: 100,
				height: 100,	
				angle: 0,
				opacity: 1,
				strokeWidth: 1,
				stroke: '#000000',
				top: 100,
				ctrl: { mtr: false }
			};

			component.addObject([obj], true);
			const addedObj = component.canvas.getObjects().find((o: any) => o.id === fakeUUID);
			expect(addedObj).to.exist;
			expect(addedObj.id).to.equal(fakeUUID);
		});
	});
})