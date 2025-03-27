import { Component, Input, SimpleChanges, Renderer2, ChangeDetectorRef, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ServoyBaseComponent, ServoyPublicService, WindowRefService } from '@servoy/public';
import * as fabric from 'fabric';

export class Sprite extends fabric.FabricImage {

    static type = 'sprite';
    spriteWidth: number;
    spriteHeight: number;
    spriteIndex: number = 0;
    frameTime: number;
    private spriteImages: HTMLImageElement[] = [];
    private tmpCanvasEl: HTMLCanvasElement;
    private animInterval: number | null = null;

    constructor(element: fabric.ImageSource, options: any) {

        super(element, options);
        this.spriteWidth = options.spriteWidth || 50;
        this.spriteHeight = options.spriteHeight || 72;
        this.frameTime = options.frameTime || 100;

        this.width = this.spriteWidth;
        this.height = this.spriteHeight;

    	this.createTmpCanvas();
        this.createSpriteImages();
    }

    createTmpCanvas() {
        this.tmpCanvasEl = fabric.util.createCanvasElement();
        this.tmpCanvasEl.width = this.spriteWidth || this.width;
        this.tmpCanvasEl.height = this.spriteHeight || this.height;
    }

    createSpriteImages() {
        if (!this.getElement()) return;

        const steps = this.getElement().width / this.spriteWidth;
        for (var i = 0; i < steps; i++) {
            this.createSpriteImage(i);
        }
    }

    createSpriteImage(index: number) {
        const tmpCtx = this.tmpCanvasEl.getContext('2d');
        if (!tmpCtx || !this.getElement()) return;

        tmpCtx.clearRect(0, 0, this.tmpCanvasEl.width, this.tmpCanvasEl.height);
        tmpCtx.drawImage(this.getElement(), -index * this.spriteWidth, 0);

        const dataURL = this.tmpCanvasEl.toDataURL('image/png');
        const tmpImg = fabric.util.createImage();
        tmpImg.src = dataURL;

        this.spriteImages.push(tmpImg);
    }


    _render(ctx: CanvasRenderingContext2D) {
        if (this.spriteImages.length === 0) return;

        ctx.drawImage(
            this.spriteImages[this.spriteIndex],
            -this.width! / 2,
            -this.height! / 2
        );
    }

    play() {
        if (this.animInterval) return;

        this.animInterval = window.setInterval(() => {
            this.dirty = true;
            this.spriteIndex = (this.spriteIndex + 1) % this.spriteImages.length;
        }, this.frameTime);
    }

    stop() {
        if (this.animInterval) {
            clearInterval(this.animInterval);
            this.animInterval = null;
        }
    }

    static async fromURL<T extends fabric.TOptions<fabric.ImageProps>>(
        url: string,
        loadOptions?: { crossOrigin?: 'anonymous' | 'use-credentials' | null; signal?: AbortSignal },
        imageOptions?: T
    ): Promise<Sprite> {
        const img = await fabric.util.loadImage(url, loadOptions);
        return new Sprite(img as fabric.ImageSource, imageOptions);
    }
}
// Register the class in Fabric.js
fabric.classRegistry.setClass(Sprite);
fabric.classRegistry.setSVGClass(Sprite);

@Component({
    selector: 'svycanvas-Canvas',
    templateUrl: './Canvas.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class Canvas extends ServoyBaseComponent<HTMLDivElement> {
    //model
    @Input() canvasObjects: Array<canvasObject>;
    @Output() canvasObjectsChange = new EventEmitter();
    @Input() showGrid: Boolean;
    @Input() snapToGrid: Boolean;
    @Input() gridSize: Number;
    @Input() canvasOptions: CanvasOptions;
    @Input() imagesLoader: any;
    @Input() styleClass: String;
    @Input() defObj: Object;
    @Input() isDrawing: Boolean;
    @Input() isReady: Boolean;
    @Input() canvas: any;
    @Input() render: any;
    @Input() grid: any;
    @Input() servoyApi: any;
    @Input() objects: any;
    @Input() images: Object;
    @Input() reselect: Array<any>;
    @Input() zoom: Number;
    @Input() zoomX: Number;
    @Input() zoomY: Number;
    @Input() svyMarkupId: string;
    @Input() objNum: any;

    //handlers
    @Input() onClick: (e?: Event, data?: any) => void;
    @Input() onLongPress: (e?: Event, data?: any) => void;
    @Input() onModified: (e?: Event, data?: any) => void;
    @Input() onReady: (e?: Event, data?: any) => void;
    @Input() afterRender: (e?: Event, data?: any) => void;

    constructor(protected readonly renderer: Renderer2, protected cdRef: ChangeDetectorRef, private servoyService: ServoyPublicService, private window: WindowRefService) {
        super(renderer, cdRef);
        // fabric.util.createClass is not necessary in Fabric.js v6 because it has been removed.
    }

    svyOnInit() {
        super.svyOnInit();
        this.defObj = {
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
            height: 50,
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
        }
        this.svyMarkupId = this.servoyApi.getMarkupId();
        this.isDrawing = false;
        this.isReady = false;
        this.canvas = null;
        this.objects = {};
        this.images = {};
        this.reselect = [];
        this.zoom = null;
        this.zoomX = null;
        this.zoomY = null;

        if (!this.canvasObjects) {
            this.canvasObjects = [];
        }

        this.window.nativeWindow['cancelRequestAnimFrame'] = (function () {
            return window.cancelAnimationFrame || this.window.nativeWindow.webkitCancelRequestAnimationFrame ||
                this.window.nativeWindow.mozCancelRequestAnimationFrame || this.window.nativeWindow.oCancelRequestAnimationFrame ||
                this.window.nativeWindow.msCancelRequestAnimationFrame || clearTimeout
        })();

        window.addEventListener("resize", () => this.drawTimeout());
        setTimeout(this.loadImg, 0);
        this.drawTimeout();
    }

    svyOnChanges(changes: SimpleChanges) {
        super.svyOnChanges(changes);

        if (changes.imagesLoader && changes.imagesLoader.currentValue && !changes.imagesLoader.previousValue) {
            this.loadImg();
        }
        this.drawTimeout();
    }

    drawTimeout(delay ? : number) {
        if (!delay) delay = 0;
        if (this.isDrawing) return;
        this.isDrawing = true;
        if (this.draw) {
            setTimeout(() => { this.draw(); }, delay);
        } 
    }

    loadImg() {
        if (this.imagesLoader && this.imagesLoader.length > 0) {
            var im = this.imagesLoader;
            for (var i in im) {
                if (!im[i] || !im[i].split) continue;
                var imgName = im[i].split('/')[3].split('?')[0];
                if (!this.images[imgName]) {
                    var img = new Image();
                    img.src = im[i];
                    this.images[imgName] = img;
                }
            }
            if (img) {
                img.onload = () => {
                    this.drawTimeout();
                };
            }
        }
    }

    clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    cloneAndSave(obj) {
        function upperCaseFirstLetter(str: string): string {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        if (!obj) return;

        //check if grouped
        if (obj._objects && obj._objects.length > 0) {
            for (var j = 0; j < obj._objects.length; j++) {
                this.cloneAndSave(obj._objects[j])
            }
        }

        try {
            var o = this.canvasObjects;
            var ct = -1;
            for (var i in o) {
                if (!o[i]) continue;
                ct++;
                if (o[i].id == obj.id) {
                    for (var k in this.defObj) {
                        if (k != 'id')
                            o[i][k] = obj[k];
                    }

                    if (typeof obj.objectType == 'undefined') {
                        o[i].objectType = upperCaseFirstLetter(obj.type);
                        if (o[i].objectType === "Textbox") {
                            o[i].objectType = "Text";
                        }
                    }

                    if (obj.src) {
                        o[i].mediaName = obj.src.split('/')[6].split('?')[0];
                        o[i].spriteName = obj.src.split('/')[6].split('?')[0];
                    }

                }
            }

            this.canvasObjectsChange.emit(o);
        } catch (e) { console.error("Error in cloneAndSave:", e); }
    }

    updateModelObj(o) {
        //if it has no identifier don't update
        if (!o.id) return;
        // console.log('update ' + o.id);
        // console.log(o.left + ' , ' + o.top)
        var d = this.canvasObjects;
        // if (o[i].type === "i-text") {
        //     o[i].type = "Text";
        // }
        var objectType = o.type.charAt(0).toUpperCase() + o.type.slice(1);
        for (var j in d) {
            if (d[j] && d[j].id == o.id) {

                for (var k in this.defObj) {
                    if (k != 'id')
                        d[j][k] = o[k] == null ? this.defObj[k] : o[k]
                }
            }
        }
    }

    uuidv4() {
        return (1e7 + '-' + 1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function(c: any) {
            return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16).toUpperCase();
        })
    }

    createObject(type, g, noAddToCanvas ? : boolean) {
        //                  console.log('create object : ' + type);
        //                  console.log(g.objects)
        let item;
        if (!g.textAlign) {
            g.textAlign = 'left';
        }
        const options: Partial<fabric.Group> = {
            cornerColor: !this.canvasOptions.selectable ? 'rgba(102,153,255,0.0)' : 'rgba(102,153,255,0.5)',
            borderColor: !this.canvasOptions.selectable ? 'rgba(102,153,255,0.0)' : 'rgba(102,153,255,0.5)',
            hasControls: this.canvasOptions.selectable ? true : false,
            selectable: typeof g.selectable == 'undefined' ? true : g.selectable,
            lockMovementX: !this.canvasOptions.selectable,
            lockMovementY: !this.canvasOptions.selectable
        }
        for (var k in this.defObj) {
            if (typeof g[k] !== 'undefined')
                options[k] = g[k]
        }

        switch (type) {
            case 'Group':
                const groupedItems = []
                if (g && g.objects) {
                    for (var i = 0; i < g.objects.length; i++) {
                        groupedItems.push(this.createObject(g.objects[i].objectType, g.objects[i], true));
                    }
                    item = new fabric.Group(groupedItems, options);
                }
                break;
            case 'Circle':
                item = new fabric.Circle(options);
                break;
            case 'Rect':
                item = new fabric.Rect(options);
                break;
            case 'Triangle':
                item = new fabric.Triangle(options);
                break;
            case 'Ellipse':
                item = new fabric.Ellipse(options);
                break;
            case 'Polygon':
                item = new fabric.Polygon(g.points, options);
                break;
            case 'Path':
                item = new fabric.Path(g.path, options);
                break;
            case 'Line':
                item = new fabric.Line(g.path, options);
                break;
            case 'Image':
                if (this.images[g.mediaName]) item = new fabric.FabricImage(this.images[g.mediaName], options);
                break;
            case 'Sprite':
                if (this.images[g.spriteName])
                    item = new Sprite(this.images[g.spriteName], options)
                //else console.log('no image was found for creating a Sprite under name: ' + g.spriteName);
                break;
            case 'Text':
                item = new fabric.Textbox(g.text || '', options);
                break;
            default:
                break;
        }

        if (item && !noAddToCanvas) {
            this.canvas.add(item);
            if (type == 'Sprite' && item.play) {
                item.play();
            }
        }
        return item;
    }

    bringToFront(idx) {
        var o = this.canvas._objects;
        for (var i = 0; i < o.length; i++) {
            if (o[i].id == idx) {
                o[i].bringToFront();
            }
        }
        this.canvas.renderAll();
    }
    async copySelectedObject() {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject) return;
    
        try {
            // Clone the object (returns a Promise)
            const _clipboardObject = await activeObject.clone();

            // clone again, so you can do multiple copies.
            const clonedObj = await _clipboardObject.clone();
            
            // Modify cloned object's position & give it a new ID
            clonedObj.set({
                left: clonedObj.left! + 10,
                top: clonedObj.top! + 10,
                id: this.uuidv4(),  // Assign a new ID if needed
                evented: true       // Ensure the new object is interactive
            });

            this.reselect = []; // Reset selection

            if (clonedObj instanceof fabric.ActiveSelection){
                // active selection needs a reference to the canvas.
                clonedObj.canvas = this.canvas;
                clonedObj.forEachObject((obj) =>{
                    (obj as any).id = this.uuidv4();
                    this.reselect.push((obj as any).id)
                    // obj.transparentCorners = true;
                    this.canvas.add(obj);
                });
                // this should solve the unselectability
                clonedObj.setCoords();
            } else {
                this.reselect.push(clonedObj.id)
                this.canvas.add(clonedObj);
            }
        
            //Add cloned object to the canvas
            this.canvas.setActiveObject(clonedObj);
            this.canvas.requestRenderAll();
            this.canvas.discardActiveObject();
            setTimeout(() => {
                this.setSelectedObject(this.reselect)
            }, 250)
        } catch (error) {
            console.error("Error cloning object:", error);
        }
    }
    saveAsImage(cb) {
        var canvas = document.getElementById(this.servoyApi.getMarkupId());
        var url = this.canvas.toDataURL({
            format: 'png',
            quality: 1.0
        });
        //url.download = 'canvas.png'
        if (cb) {
            cb(url);
        }
    }
    saveCanvas(cb) {
        if (cb) {
            cb(JSON.stringify(this.canvasObjects));
        }
    }
    printCanvas(resolutionWidth) {

        var originWidth = this.canvas.getWidth();
        if (!resolutionWidth) resolutionWidth = originWidth;
        //helper function to set print resolution
        function zoom(width, canvas) {
            var scale = width / canvas.getWidth();
            var height = scale * canvas.getHeight();

            canvas.setDimensions({
                "width": width,
                "height": height
            });

            canvas.calcOffset();
            var objects = canvas.getObjects();
            for (var i in objects) {
                var scaleX = objects[i].scaleX;
                var scaleY = objects[i].scaleY;
                var left = objects[i].left;
                var top = objects[i].top;

                objects[i].scaleX = scaleX * scale;
                objects[i].scaleY = scaleY * scale;
                objects[i].left = left * scale;
                objects[i].top = top * scale;

                objects[i].setCoords();
            }
            canvas.renderAll();
        }
        var canvas_el = document.getElementById(this.servoyApi.getMarkupId());
        canvas_el.style.opacity = '0';
        zoom(resolutionWidth, this.canvas);

        setTimeout(() => {
            if (!this.canvas) return; // Ensure canvas exists
            
            var dataUrl = this.canvas.toDataURL(); //attempt to save base64 string to server using this var  
            var windowContent = '<!DOCTYPE html>';
            windowContent += '<html>'
            windowContent += '<body>'
            windowContent += '<head><style> @page { size: auto;  margin: 0mm; }</style> <title> </title></head>'
            windowContent += '<img style="width:100vw;width:100vh;" src="' + dataUrl + '">';
            windowContent += '</body>';
            windowContent += '</html>';
            zoom(originWidth, this.canvas);
            const printWin: Window | null = window.open();
            if (printWin) {
                printWin.document.open();
                printWin.document.write(windowContent);
                printWin.document.close();
                printWin.focus();
                printWin.print();
                setTimeout(() => {
                    printWin.close();
                    canvas_el.style.opacity = '100';
                }, 500);
            }
        }, 1000)
    }
    ZoomOnPoint(x, y, zoom) {
        this.zoomX = x;
        this.zoomY = y;
        this.zoom = zoom;
        this.drawTimeout(0);
    }
    updateObject(obj, setItemActive) {
        if (obj) {
            var sel = [];
            var ob = this.canvasObjects;
            if (!ob) return;
            for (var i in obj) {
                if (!obj[i]) continue;
                for (var j in ob) {
                    if (!ob[j] || obj[i].id !== ob[j].id) continue;
                    if (obj[i].id === ob[j].id) {
                        sel.push(ob[j].id);
                        for (var k in obj[i]) {
                            ob[j][k] = obj[i][k];
                        }
                    }
                }
            }

            this.canvasObjectsChange.emit(this.canvasObjects);

            if (this.onModified) {
                this.onModified();
            }

            this.drawTimeout();
            if (setItemActive) {
                setTimeout(() => {
                    this.setSelectedObject(sel);
                }, 250)
            }
        }
    }
    loadCanvas(data) {
        if (!data || (data.length < 1)) return;
        this.canvasObjects = JSON.parse(data);
        this.canvasObjectsChange.emit(this.canvasObjects);
        this.drawTimeout();
    }
    addObject(objs, setActive) {
        if (setActive != false) {
            setActive = true;
        }
        this.reselect = [];

        const objectsToAdd = Array.isArray(objs) ? objs : [objs];

        const activeSelection = new fabric.ActiveSelection([], {
            canvas: this.canvas
        });

        if (objs && objs.length > 0) {
            for (var i = 0; i < objs.length; i++) {
                this.reselect.push(objs[i].id)
                activeSelection.add(this.createObject(objs[i].objectType, objs[i]))
            }
        } else if (objs) {
            this.reselect.push(objs.id)
            activeSelection.add(this.createObject(objs.objectType, objs))
        }

        if (setActive) {
            this.canvas.setActiveObject(activeSelection);
            setTimeout(() => {
                this.setSelectedObject(this.reselect);
            }, 50);
        } else {
            this.canvas.discardActiveObject();
        }
        this.canvas.renderAll();
    
        if (this.onModified) {
            this.onModified();
        }
    }
    removeObject() {
        var activeObject = this.canvas.getActiveObject();
        if (!activeObject) return;
        // Helper function to remove object by id
        const removeById = (id?: string | number) => {
            if (!id) return;
            this.canvasObjects = this.canvasObjects.filter(obj => obj.id !== id);
            this.canvasObjectsChange.emit(this.canvasObjects);
        };

        const removeObjectFromCanvas = (obj) => {
            removeById(obj.id);
            this.canvas.remove(obj);
        };

        if (activeObject instanceof fabric.Group) {
            // If it's a group, remove each object in the group first
            activeObject.getObjects().forEach(obj => {
                removeObjectFromCanvas(obj);
            });
        }

        // Remove the active object itself
        removeObjectFromCanvas(activeObject);
        
        // Cleanup and update canvas
        this.canvas.discardActiveObject();
        this.canvas.renderAll();
    }
    clearCanvas() {
        if (this.canvas)
            this.canvas.clear();
        this.drawTimeout();
    }
    setSelectedObject(ids) {
        this.canvas.discardActiveObject();
        var o = this.canvas.getObjects();
        var allObjects = {};
        for (var i = 0; i < o.length; i++) {
            if (o[i].id != 'grid') {
                allObjects[o[i].id] = o[i];
            }
        }

        if (ids && ids.length > 0) {
            var activeSelection = new fabric.ActiveSelection([], {
                canvas: this.canvas
            });

            for (i = 0; i < ids.length; i++) {
                if (allObjects[ids[i]] && allObjects[ids[i]]._set){				
		   			activeSelection.add(allObjects[ids[i]])
				}			                    
            }                        
            this.canvas.setActiveObject(activeSelection);       
            if (activeSelection.getObjects()[0] && activeSelection.getObjects()[0]['ctrl']) {				
				var ctr = activeSelection.getObjects()[0]['ctrl'];
				for(var j in ctr) {
					activeSelection.setControlVisible(j,ctr[j]);	
				}									
			}			
            this.canvas.renderAll();                                    
        }
    }
    getSelectedObject(cb, sel) {

        function selectHelper(ob): void {
            if (!ob) return;
            
            if (ob.objectType !== 'Group' && ob instanceof fabric.Group && ob.getObjects()) {
                const allObjects = ob.getObjects();
                for (var i = 0; i < allObjects.length; i++) {
                    selectHelper(allObjects[i]);
                }
            } else {
                sel.push(ob.id);
            }
        }

        if (!sel) {
            sel = []
            const ao = this.canvas.getActiveObject();
            if (ao) {
                selectHelper(ao);
            }
        }

        if (sel) {
            var co = this.canvasObjects;
            var os = [];
            for (const i in co) {
                for (let j = 0; j < sel.length; j++) {
                    if (!co[i]) continue;
                    if (co[i].id === sel[j]) {
                        os.push(co[i]);
                    }
                }
            }
            if (cb) {
                return cb(os);
            }
        }
        const ao = this.canvas.getActiveObject();
        if (!ao) return null;
        const ob = ao.getObjects();
        if (ao.objectType !== 'Group' && ao instanceof fabric.Group && ob && ob.length > 0) {
            var grp = []
            for (var j = 0; j < ob.length; j++) {
                if (!ob[j]) continue;
                grp.push(ob[j].id);
            }
            this.canvas.discardActiveObject();
            return setTimeout(() => {
                this.getSelectedObject(cb, grp)
            }, 250);
        }
        this.canvas.discardActiveObject();

        setTimeout(() => this.getSelectedObject(cb, [(ao as any).id!]), 250);
    }
    draw() {
        this.grid = this.gridSize;
        this.objects = {};
        this.objNum = -1;
        //need to destroy canvas completely
        var wr = document.getElementById(this.svyMarkupId + '-wrapper');
        if (!wr) return;
        wr.innerHTML = '';
        var ca = document.createElement("canvas");
        ca.id = this.svyMarkupId;
        wr.appendChild(ca);
        //create new canvas object
        if (this.canvas) {
            this.canvas.dispose();
        }

        if (!this.canvasOptions) {
            this.canvasOptions = {
                selectable: 0,
                skipTargetFind: false,
                hasRotatingPoint: 0,
                renderOnAddRemove: false,
                skipOffscreen: false,
                ZoomOnMouseScroll: 0,
                animationSpeed: null
            };
        }

        this.canvasOptions['preserveObjectStacking'] = true;
        this.canvas = new fabric.Canvas(this.svyMarkupId, this.canvasOptions);
        fabric.FabricObject.prototype.transparentCorners = false;
        this.canvas.selection = this.canvasOptions.selectable;
        var gridWidth = document.getElementById(this.svyMarkupId + '-wrapper').clientWidth;
        var gridHeight = document.getElementById(this.svyMarkupId + '-wrapper').clientHeight;

        //setup zoom
        if (this.zoom)
            this.canvas.zoomToPoint({ x: this.zoomX, y: this.zoomY }, this.zoom);

        //TODO : set scale based on targetScale options
        //                  if (this.canvasOptions.targetScaleW && this.canvasOptions.targetScaleH) {
        //                      var scaleW = gridWidth / this.canvasOptions.targetScaleW;
        //                      var scaleH = gridHeight / this.canvasOptions.targetScaleH;
        //
        //                      this.canvas.setZoom(scaleW / scaleH);
        //                      this.canvas.setWidth(gridWidth * this.canvas.getZoom());
        //                      this.canvas.setHeight(gridHeight * this.canvas.getZoom());
        //                  }

        //draw grid
        if (this.showGrid) {
            // create grid
            var gridSize = (gridWidth > gridHeight) ? gridWidth : gridHeight
            for (var i = 0; i < (gridSize / this.grid); i++) {
                this.canvas.add(new fabric.Line([i * this.grid, 0, i * this.grid, gridSize], {
                    //                    id: 'grid',
                    stroke: '#ccc',
                    selectable: false
                }));
                this.canvas.add(new fabric.Line([0, i * this.grid, gridSize, i * this.grid], {
                    //                    id: 'grid',
                    stroke: '#ccc',
                    selectable: false
                }));
            }
        }

        this.canvas.setWidth(gridWidth);
        this.canvas.setHeight(gridHeight);

        var canvasObjectsVar = this.canvasObjects;
        for (var j in canvasObjectsVar) {
            this.objNum++;
            if (!canvasObjectsVar[j]) continue;
            //                      console.log(g[j].id + ' : ' + g[j].objectType);
            //                      console.log(g[j]);
            //create an fabric item
            var type = canvasObjectsVar[j].objectType;
            this.objects[canvasObjectsVar[j].id] = this.createObject(type, canvasObjectsVar[j]);
        }

        this.setupEvents();
        // console.log(this.canvas.getObjects().length);
        if (this.canvas.getObjects().length > 1000) {
            console.log('WARNING - over 1000 objects created. Client performance will be impacted.');
        }

        if (!this.isReady) {
            if (this.onReady) this.onReady();
            this.isReady = true;
        }
        this.isDrawing = false;
    }

    rotate(angle: number) {
        const objects = this.canvas.getObjects();
        if (objects.length === 0) return;

        const group = new fabric.Group(objects);
        group.rotate(angle);

        this.canvas.centerObject(group);
        group.setCoords();
        this.canvas.requestRenderAll();
    }

    startAnimate() {
        if (this.render) return; 
        const render = () => {
            try {
                let applyChanges = false;
                this.canvas.discardActiveObject();
                var o = this.canvasObjects;
                this.canvas._objects.concat().forEach(function (obj) {
                    if (obj.id != 'grid' && typeof obj.id != 'undefined') {
                        //                                  this.canvasObjects.map(function(c) {
                        //                                      if (c.id == obj.id) {
                        //                                          console.log(obj.custom_data.dateChanged)
                        //                                          console.log(c.custom_data.dateChanged)
                        //                                          if (obj.custom_data.dateChanged != c.custom_data.dateChanged) {
                        //                                              applyChanges = true;
                        //                                              for (var i in c) {
                        //                                                  obj[i] = c[i]
                        //                                              }
                        //                                          }
                        //
                        //                                      }
                        //                                  });
                    }
                });
                if (applyChanges) this.canvasObjectsChange.emit(this.canvasObjects);
                this.canvas.requestRenderAll();
            } catch (e) { 
                console.error("Animation error:", e);
            }
        };

        if (this.render) return;
        if (this.canvasOptions.animationSpeed == null || (this.canvasOptions.animationSpeed < 50))
            this.canvasOptions.animationSpeed = 50;
        this.render = setInterval(render.bind(this), this.canvasOptions.animationSpeed)
    }
    stopAnimate() {
        if (this.render) {
            clearInterval(this.render);
            this.render = null;
            this.canvas.requestRenderAll();
        }
    }

    //setup events
    setupEvents() {
        this.canvas.on('object:scaling', (options) => {
            if (this.snapToGrid) {
                const target = options.target;
                if (!target) return;
                const w = target.width * target.scaleX;
                const h = target.height * target.scaleY;
                const snap = { // Closest snapping points
                    top: Math.round(target.top / this.grid) * this.grid,
                    left: Math.round(target.left / this.grid) * this.grid,
                    bottom: Math.round((target.top + h) / this.grid) * this.grid,
                    right: Math.round((target.left + w) / this.grid) * this.grid
                };
                const threshold = this.grid;
                const dist = { // Distance from snapping points
                    top: Math.abs(snap.top - target.top),
                    left: Math.abs(snap.left - target.left),
                    bottom: Math.abs(snap.bottom - target.top - h),
                    right: Math.abs(snap.right - target.left - w)
                };
                const attrs = {
                    scaleX: target.scaleX,
                    scaleY: target.scaleY,
                    top: target.top,
                    left: target.left
                };
                switch (target.__corner) {
                    case 'tl': // Top-left corner
                        if (dist.left < dist.top && dist.left < threshold) {
                            attrs.scaleX = (w - (snap.left - target.left)) / target.width;
                            attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
                            attrs.top = target.top + (h - target.height * attrs.scaleY);
                            attrs.left = snap.left;
                        } else if (dist.top < threshold) {
                            attrs.scaleY = (h - (snap.top - target.top)) / target.height;
                            attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
                            attrs.left = attrs.left + (w - target.width * attrs.scaleX);
                            attrs.top = snap.top;
                        }
                        break;
                    case 'mt': // Middle-top
                        if (dist.top < threshold) {
                            attrs.scaleY = (h - (snap.top - target.top)) / target.height;
                            attrs.top = snap.top;
                        }
                        break;
                    case 'tr': // Top-right corner
                        if (dist.right < dist.top && dist.right < threshold) {
                            attrs.scaleX = (snap.right - target.left) / target.width;
                            attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
                            attrs.top = target.top + (h - target.height * attrs.scaleY);
                        } else if (dist.top < threshold) {
                            attrs.scaleY = (h - (snap.top - target.top)) / target.height;
                            attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
                            attrs.top = snap.top;
                        }
                        break;
                    case 'ml': // Middle-left
                        if (dist.left < threshold) {
                            attrs.scaleX = (w - (snap.left - target.left)) / target.width;
                            attrs.left = snap.left;
                        }
                        break;
                    case 'mr': // Middle-right
                        if (dist.right < threshold) attrs.scaleX = (snap.right - target.left) / target.width;
                        break;
                    case 'bl': // Bottom-left corner
                        if (dist.left < dist.bottom && dist.left < threshold) {
                            attrs.scaleX = (w - (snap.left - target.left)) / target.width;
                            attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
                            attrs.left = snap.left;
                        } else if (dist.bottom < threshold) {
                            attrs.scaleY = (snap.bottom - target.top) / target.height;
                            attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
                            attrs.left = attrs.left + (w - target.width * attrs.scaleX);
                        }
                        break;
                    case 'mb': // Middle-bottom
                        if (dist.bottom < threshold) attrs.scaleY = (snap.bottom - target.top) / target.height;
                        break;
                    case 'br': // Bottom-right corner
                        if (dist.right < dist.bottom && dist.right < threshold) {
                            attrs.scaleX = (snap.right - target.left) / target.width;
                            attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
                        } else if (dist.bottom < threshold) {
                            attrs.scaleY = (snap.bottom - target.top) / target.height;
                            attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
                        }
                        break;
                }
                target.set(attrs);
                //target.setCoords(); // Update coordinates
            }
            var obj = this.canvas.getActiveObject();
            if (!obj) return;
            obj.set({
                opacity: 0.3
            });
            // if (this.onScale) {
            //     this.onScale(obj.id, obj.scaleX, obj.scaleY);
            // }
            this.canvas.renderAll();
        });
        this.canvas.on('object:moving', (options) => {
            const target = options.target;
            if (!target) return;
            //snap to grid
            if (this.snapToGrid && this.grid) {
                const newLeft = Math.round(target.left! / this.grid) * this.grid;
                const newTop = Math.round(target.top! / this.grid) * this.grid;

                if (target.left !== newLeft || target.top !== newTop) {
                    target.set({ left: newLeft, top: newTop });
                }
            }
            // Get the currently active object
            const obj = this.canvas.getActiveObject();
            if (!obj) return;
            // Apply temporary move settings
            obj.set({
                hasControls: false,  // Hide controls while moving
                opacity: 0.3        // Reduce opacity for feedback
            });

            // if (this.onMove) {
            //     this.onMove(obj.id, obj.left, obj.top);
            // }

            this.canvas.renderAll();
        });
        this.canvas.on('mouse:wheel', (opt) => {
            if (!this.canvasOptions.ZoomOnMouseScroll) return;
            var delta = opt.e.deltaY;
            var pointer = this.canvas.getPointer(opt.e);
            var zoom = this.canvas.getZoom();
            zoom = zoom + delta / 1000;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.01) zoom = 0.01;
            this.zoomX = opt.e.offsetX;
            this.zoomY = opt.e.offsetY;
            this.zoom = zoom;
            this.drawTimeout();
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });
        this.canvas.on('mouse:up', (options) => {
            var obj = this.canvas.getActiveObject();
            if (!obj) return;
            var o = this.canvasObjects;

            if (this.onClick && !this.canvasOptions.selectable && (typeof obj.id != 'undefined')) {
                this.onClick(obj.id, obj);
                //when clicking don't allow overlapping
                this.canvas.discardActiveObject();
                this.canvas.renderAll();
            }
        });
        this.canvas.on('touch:longpress', (options) => {
            var obj = this.canvas.getActiveObject();
            if (!obj) return;

            if (this.onLongPress && !this.canvasOptions.selectable && (typeof obj.id != 'undefined')) {
                this.onLongPress(obj.id, obj);
                //when clicking don't allow overlapping
                this.canvas.discardActiveObject();
                this.canvas.renderAll();
            }
        });
        this.canvas.on('selection:cleared', () => {
            if (!this.canvas.getActiveObject()) {
                // Save canvas to datamodel
                const objects = this.canvas._objects;

                const addToModel = (obj : any) => {
                    if (!obj || !obj.type) return null;

                    let objectType = obj.type === "textbox" ? "Text" : obj.type.charAt(0).toUpperCase() + obj.type.slice(1);

                    let mediaName = obj.mediaName || "";
                    let spriteName = obj.spriteName || "";

                    if (obj.src) {
                        let srcParts = obj.src.split('/');
                        let filename = srcParts[srcParts.length - 1].split('?')[0];
                        mediaName = filename;
                        spriteName = filename;
                    }

                    const co = { ...this.defObj }; // Clone default object properties
                    for (let key in co) {
                        co[key] = obj[key] != null ? obj[key] : this.defObj[key];
                    }

                    co['objectType'] = objectType;
                    co['mediaName'] = mediaName;
                    co['spriteName'] = spriteName;

                    //check if type is group and add objects
                    if (co['objectType'] === 'Group' && obj._objects?.length) {
                        //  console.log('new group')
                        //  console.log(co)
                        //  console.log(obj)
                        co['objects'] = [];

                        for (var n = 0; n < obj._objects.length; n++) {
                            co['objects'].push(addToModel.call(this, obj._objects[n]));
                        }
                    }
                    return co;
                }
                for (var i = 0; i < objects.length; i++) {
                    if (typeof objects[i].id === 'undefined') continue;
                    if (objects[i].id === 'grid') continue;

                    if (!this.objects[objects[i].id]) {

                        const objModel = addToModel(objects[i]);
                        if (objModel) {
                            if (!this.canvasObjects) {
                                this.canvasObjects = [];
                            }
                            this.canvasObjects.push(objModel as any);
                            this.objects[objects[i].id] = objModel;
                        }
                    }
                }
                this.canvasObjectsChange.emit(this.canvasObjects);
            }
        });
        this.canvas.on('object:modified', () => {
            if (this.onModified) {
                this.onModified();
            }
            var obj = this.canvas.getActiveObject();
            if (!obj) return;
            obj.set({
                hasControls: this.canvasOptions.selectable,
                opacity: 1
            });
            let selectedIds = [];
            // Helper function to collect object IDs
            const selectHelper = (o: fabric.Object) => {
                if (!o) return;

                if (o instanceof fabric.Group) {
                    o._objects.forEach(selectHelper);
                }

                if ('id' in o && o.id) {
                    selectedIds.push(o.id as string);
                }
            };
            // Store selected objects before clearing selection
            selectHelper(obj);

            // Clone and save the modified object
            this.cloneAndSave(obj);

            // Delay reselection to avoid immediate recursion
            setTimeout(() => {
                if (selectedIds.length > 0) {
                    this.setSelectedObject(selectedIds);
                }
            }, 10);
        });
        this.canvas.on('mouse:over', (e) => {
            if (!this.canvasOptions.selectable) {
                if (e.target)
                    e.target.hoverCursor = 'pointer';
            }
        });
        this.canvas.on('after:render', (e) => {
            if (this.afterRender) {
                this.afterRender();
            }
        });
        this.canvas.on('mouse:down', (e) => {
            var obj = this.canvas.getActiveObject();
            if (!obj || !obj.ctrl) return;

            var ctr = obj.ctrl;
            for (var j in ctr) {
                obj.setControlVisible(j, ctr[j]);
            }
        });
    }

}

export class CanvasOptions implements Partial<fabric.CanvasOptions> {
    public selectable: number = 1;
    public skipTargetFind: boolean = false;
    public hasRotatingPoint: number = 0;
    public renderOnAddRemove: boolean = true;
    public skipOffscreen: boolean = false;
    public ZoomOnMouseScroll: number = 0;
    public animationSpeed: number = 1;
}

export class canvasObject {
    public objectType: string = '';
    public objects: fabric.Object | null = null; // More specific type
    public fill: string = '#000';
    public opacity: number = 1.0;
    public width: number = 0;
    public height: number = 0;
    public radius?: number; // Optional if not always used
    public left: number = 0;
    public top: number = 0;
    public rx?: number;
    public ry?: number;
    public stroke?: string;
    public id: string | number | null = null;
    public scaleX: number = 1;
    public scaleY: number = 1;
    public text?: string;
    public textAlign?: 'left' | 'center' | 'right' | 'justify';
    public fontSize?: number;
    public fontFamily?: string;
    public angle?: number = 0;
    public mediaName?: string;
    public spriteName?: string;
    public spriteWidth?: number;
    public spriteHeight?: number;
    public spriteIndex?: number = 0;
    public frameTime?: number = 100;
    public selectable: boolean = true;
    public ctrl?: Record<string, any>; // More specific type than Object
    public custom_data?: Record<string, any>;
    public state?: any;
}