import { Component, Input, SimpleChanges, Renderer2, ChangeDetectorRef, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ServoyBaseComponent, ServoyPublicService, BaseCustomObject } from '@servoy/public';
import './lib/fabric.min';
import './lib/sprite.class';
declare let window: any;
declare let fabric: any;

@Component({
    selector: 'svycanvas-Canvas',
    templateUrl: './Canvas.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class Canvas extends ServoyBaseComponent < HTMLDivElement > {
    //model
    @Input() canvasObjects: Array < canvasObject > ;
    @Output() canvasObjectsChange = new EventEmitter();
    @Input() showGrid: Boolean;
    @Input() snapToGrid: Boolean;
    @Input() gridSize: Number;
    @Input() canvasOptions: canvasOptions;
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
    @Input() reselect: Array < any > ;
    @Input() zoom: Number;
    @Input() zoomX: Number;
    @Input() zoomY: Number;
    @Input() svyMarkupId: string;
    @Input() objNum: any;

    //handlers
    @Input() onClick: (e ? : Event, data ? : any) => void;
    @Input() onLongPress: (e ? : Event, data ? : any) => void;
    @Input() onModified: (e ? : Event, data ? : any) => void;
    @Input() onReady: (e ? : Event, data ? : any) => void;

    constructor(protected readonly renderer: Renderer2, protected cdRef: ChangeDetectorRef, private servoyService: ServoyPublicService) {
        super(renderer, cdRef);
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

        // if (!this.canvasObjects) {
        //     this.canvasObjects = [];
        // }

        window.cancelRequestAnimFrame = (function() {
            return window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout
        })();

        window.addEventListener("resize", this.drawTimeout);
        setTimeout(this.loadImg, 0);
        this.drawTimeout();
    }

    svyOnChanges(changes: SimpleChanges) {
        super.svyOnChanges(changes);
        // console.log('changes:');
        // console.log(changes.canvasObjects);
        // if (this.canvasObjects[0]) {
        //     this.canvasObjects[0].id = 'test2';
        //     console.log(this.canvasObjects[0])
        //     this.servoyApi.apply('canvasObjects[0].id',this.canvasObjects[0].id);
        // }
        if (changes.imagesLoader && changes.imagesLoader.currentValue && !changes.imagesLoader.previousValue) {
            this.loadImg();
        }
        this.drawTimeout();
    }

    drawTimeout(delay ? : number) {
        if (!delay) delay = 0;
        if (this.isDrawing) return;
        this.isDrawing = true;
        if (this.draw)
            setTimeout(this.draw.bind(this), delay);
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
                img.onload = function() {
                    this.drawTimeout();
                }.bind(this);
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
        function upperCaseFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
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

                    // delete o[i]['state'];                                        
                }
            }
            // console.log('cloneandsave:')
            // console.log(o);                     
            // this.canvasObjectsChange.emit(o);
            this.servoyApi.apply("canvasObjects", o);
        } catch (e) {}
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
        var item;
        if (!g.textAlign) {
            g.textAlign = 'left';
        }
        var options = {
            cornerColor: !this.canvasOptions.selectable ? 'rgba(102,153,255,0.0)' : 'rgba(102,153,255,0.5)',
            borderColor: !this.canvasOptions.selectable ? 'rgba(102,153,255,0.0)' : 'rgba(102,153,255,0.5)',
            hasControls: this.canvasOptions.selectable,
            selectable: typeof g.selectable == 'undefined' ? true : g.selectable,
            lockMovementX: !this.canvasOptions.selectable,
            lockMovementY: !this.canvasOptions.selectable
        }
        for (var k in this.defObj) {
            if (typeof g[k] != 'undefined')
                options[k] = g[k]
        }

        switch (type) {
            case 'Group':
                var groupedItems = []
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
                item = new fabric.Image(this.images[g.mediaName], options);
                break;
            case 'Sprite':
                item = new fabric.Sprite(this.images[g.spriteName], options)
                break;
            case 'Text':
                item = new fabric.Textbox(g.text, options);
                break;
            default:
                break;
        }
        if (item && !noAddToCanvas) {
            this.canvas.add(item);
            if (type == 'Sprite') {
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
    copySelectedObject() {
        this.canvas.getActiveObject().clone(function(cloned) {
            var _clipboard = cloned;
            // clone again, so you can do multiple copies.
            _clipboard.clone(function(clonedObj) {
                this.reselect = []
                clonedObj.set({
                    left: clonedObj.left + 10,
                    top: clonedObj.top + 10,
                    id: this.uuidv4(),
                    evented: true
                });

                if (clonedObj.type === 'activeSelection') {
                    // active selection needs a reference to the canvas.
                    clonedObj.canvas = this.canvas;
                    clonedObj.forEachObject(function(obj) {
                        obj.id = this.uuidv4();
                        this.reselect.push(obj.id)
                        // obj.transparentCorners = true;
                        this.canvas.add(obj);
                    }.bind(this));
                    // this should solve the unselectability
                    clonedObj.setCoords();
                } else {
                    this.reselect.push(clonedObj.id)
                    this.canvas.add(clonedObj);
                }
                _clipboard.top += 10;
                _clipboard.left += 10;
                _clipboard.id = this.uuidv4();
                this.reselect.push(_clipboard.id)
                this.canvas.setActiveObject(clonedObj);
                this.canvas.requestRenderAll();
                this.canvas.discardActiveObject();
                setTimeout(function() {
                    this.setSelectedObject(this.reselect)
                }.bind(this), 250)

            }.bind(this));
        }.bind(this));

    }
    saveAsImage(cb) {
        var canvas = document.getElementById(this.servoyApi.getMarkupId());
        var url = this.canvas.toDataURL({
            format: 'png',
            quality: 1.0
        });
        url.download = 'canvas.png'
        if (cb) {
            this.servoyService.executeInlineScript(cb.formname, cb.script, [url]);
        }
    }
    saveCanvas(cb) {
        if (cb) {
            this.servoyService.executeInlineScript(cb.formname, cb.script, [JSON.stringify(this.canvasObjects)]);
        }
    }
    ZoomOnPoint(x, y, zoom) {
        this.zoomX = x;
        this.zoomX = y;
        this.zoom = zoom;
        this.drawTimeout(0);
    }
    updateObject(obj, setItemActive) {
        if (obj) {
            var sel = [];
            var ob = this.canvasObjects;
            if (!ob) return;
            for (var i in obj) {
                for (var j in ob) {
                    if (!obj[i]) continue;
                    if (!ob[j]) continue;
                    if (obj[i].id == ob[j].id) {
                        sel.push(ob[j].id);
                        for (var k in obj[i]) {
                            ob[j][k] = obj[i][k];
                        }
                    }
                }
            }
            this.servoyApi.apply("canvasObjects");

            if (this.onModified) {
                this.onModified();
            }

            this.drawTimeout();
            if (setItemActive) {
                setTimeout(function() {
                    this.setSelectedObject(sel);
                }.bind(this), 250)
            }
        }
    }
    loadCanvas(data) {
        if (!data || (data.length < 1)) return;
        // this.canvasObjects = JSON.parse(data);        
        console.log(this.canvasObjects);

        var d = JSON.parse(data);
        for (var i = 0; i < d.length; i++) {
            this.canvasObjects.push(d[i]);
        }
        this.servoyApi.apply("canvasObjects");
        this.drawTimeout();
    }
    addObject(objs, setActive) {
        if (setActive != false) {
            setActive = true;
        }
        this.reselect = []
        var s = new fabric.ActiveSelection([], {
            canvas: this.canvas
        });
        if (objs && objs.length > 0) {
            for (var i = 0; i < objs.length; i++) {
                this.reselect.push(objs[i].id)
                s.addWithUpdate(this.createObject(objs[i].objectType, objs[i]))
            }
        } else if (objs) {
            this.reselect.push(objs.id)
            s.addWithUpdate(this.createObject(objs.objectType, objs))
        }

        this.canvas.setActiveObject(s);

        if (!setActive) {
            this.canvas.discardActiveObject();
        } else {
            this.canvas.discardActiveObject();
            setTimeout(function() {
                this.setSelectedObject(this.reselect)
            }.bind(this), 50)
        }
        this.canvas.renderAll();

        if (this.onModified) {
            this.onModified();
        }
    }
    removeObject(idx) {
        var o = this.canvas.getActiveObject();
        //check if in a group
        function remove(id) {
            if (id) {
                var obj = this.canvasObjects;
                for (var i in obj) {
                    if (!obj[i]) continue;
                    if (obj[i].id == id) {
                        this.canvas.remove(o);
                        delete obj[i];
                    }
                }
            }
        }
        if (!o) return;
        remove.call(this, o.id);
        var ob = o._objects;
        if (ob && ob.length > 1) {
            for (var j = 0; j < ob.length; j++) {
                var id = ob[j].id;
                if (!id) continue;
                remove.call(this, id);
                this.canvas.remove(ob[j]);
            }

            this.servoyApi.apply("canvasObjects");
        }
        this.canvas.remove(o);
        if (o._objects) {
            this.canvas.remove(o._objects[0]);
        }
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

        // console.log('setSelectedObject:')
        // console.log(ids)
        // console.log(o)
        // console.log(this.objects)

        if (ids && ids.length > 0) {
            var s = new fabric.ActiveSelection([], {
                canvas: this.canvas
            });

            for (i = 0; i < ids.length; i++) {
                if (allObjects[ids[i]] && allObjects[ids[i]]._set)
                    s.addWithUpdate(allObjects[ids[i]])
            }
            this.canvas.setActiveObject(s);
            this.canvas.renderAll();
        }
    }
    getSelectedObject(cb, sel) {

        function selectHelper(ob) {
            // console.log('selectHelper : ')
            if (!ob) return;
            if (ob._objects && ob.objectType != 'Group') {
                for (var i = 0; i < ob._objects.length; i++) {
                    selectHelper(ob._objects[i]);
                }
            } else {
                sel.push(ob.id);
            }
        }

        if (!sel) {
            sel = []
            var ao = this.canvas.getActiveObject();
            selectHelper(ao);
        }

        if (sel) {
            var co = this.canvasObjects;
            var os = [];
            for (var i in co) {
                for (var j = 0; j < sel.length; j++) {
                    if (!co[i]) continue;
                    if (co[i].id == sel[j]) {
                        os.push(co[i])
                    }
                }
            }
            if (cb) {
                return this.servoyService.executeInlineScript(cb.formname, cb.script, [os]);
            }
        }
        var ao = this.canvas.getActiveObject();
        if (!ao) return;
        var ob = ao._objects;
        if (ao.objectType != 'Group' && ob && ob.length > 0) {
            var grp = []
            for (var j = 0; j < ob.length; j++) {
                if (!ob[j]) continue;
                grp.push(ob[j].id);
            }
            this.canvas.discardActiveObject();
            return setTimeout(function() {
                this.getSelectedObject(cb, grp)
            }.bind(this), 250);
        }
        this.canvas.discardActiveObject();

        return setTimeout(function() {
            this.getSelectedObject(cb, [ao.id])
        }.bind(this), 250);
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

        // if (!this.canvasOptions) {
        //     this.canvasOptions = {};
        // }

        this.canvasOptions['preserveObjectStacking'] = true;
        this.canvas = new fabric.Canvas(this.svyMarkupId, this.canvasOptions);
        fabric.Object.prototype.transparentCorners = false;
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
                    id: 'grid',
                    stroke: '#ccc',
                    selectable: false
                }));
                this.canvas.add(new fabric.Line([0, i * this.grid, gridSize, i * this.grid], {
                    id: 'grid',
                    stroke: '#ccc',
                    selectable: false
                }));
            }
        }

        this.canvas.setWidth(gridWidth);
        this.canvas.setHeight(gridHeight);

        var g = this.canvasObjects;
        for (var j in g) {
            this.objNum++;
            if (!g[j]) continue;
            //                      console.log(g[j].id + ' : ' + g[j].objectType);
            //                      console.log(g[j]);
            //create an fabric item
            var type = g[j].objectType;
            this.objects[g[j].id] = this.createObject(type, g[j]);
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
    rotate(angle) {
        var group = new fabric.Group(this.canvas.getObjects())
        group.rotate(angle)
        this.canvas.centerObject(group)
        group.setCoords()
        this.canvas.renderAll()
    }
    startAnimate() {
        var render = function() {
            var applyChanges = false;
            try {
                this.canvas.discardActiveObject();
                var o = this.canvasObjects;
                this.canvas.getObjects().concat().forEach(function(obj) {
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
                if (applyChanges) this.servoyApi.apply("canvasObjects");
                this.canvas.renderAll();
            } catch (e) {}

        }

        if (this.render) return;
        if (this.canvasOptions.animationSpeed == null || (this.canvasOptions.animationSpeed < 50))
            this.canvasOptions.animationSpeed = 50;
        this.render = setInterval(render.bind(this), this.canvasOptions.animationSpeed)
    }
    stopAnimate() {
        clearInterval(this.render);
        this.render = null;
    }

    //setup events
    setupEvents() {
        this.canvas.on('object:scaling', function(options) {
            if (this.snapToGrid) {
                var target = options.target,
                    w = target.width * target.scaleX,
                    h = target.height * target.scaleY,
                    snap = { // Closest snapping points
                        top: Math.round(target.top / this.grid) * this.grid,
                        left: Math.round(target.left / this.grid) * this.grid,
                        bottom: Math.round((target.top + h) / this.grid) * this.grid,
                        right: Math.round((target.left + w) / this.grid) * this.grid
                    },
                    threshold = this.grid,
                    dist = { // Distance from snapping points
                        top: Math.abs(snap.top - target.top),
                        left: Math.abs(snap.left - target.left),
                        bottom: Math.abs(snap.bottom - target.top - h),
                        right: Math.abs(snap.right - target.left - w)
                    },
                    attrs = {
                        scaleX: target.scaleX,
                        scaleY: target.scaleY,
                        top: target.top,
                        left: target.left
                    };
                switch (target.__corner) {
                    case 'tl':
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
                    case 'mt':
                        if (dist.top < threshold) {
                            attrs.scaleY = (h - (snap.top - target.top)) / target.height;
                            attrs.top = snap.top;
                        }
                        break;
                    case 'tr':
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
                    case 'ml':
                        if (dist.left < threshold) {
                            attrs.scaleX = (w - (snap.left - target.left)) / target.width;
                            attrs.left = snap.left;
                        }
                        break;
                    case 'mr':
                        if (dist.right < threshold) attrs.scaleX = (snap.right - target.left) / target.width;
                        break;
                    case 'bl':
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
                    case 'mb':
                        if (dist.bottom < threshold) attrs.scaleY = (snap.bottom - target.top) / target.height;
                        break;
                    case 'br':
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
        }.bind(this));
        this.canvas.on('object:moving', function(options) {
            //snap to grid
            if (this.snapToGrid) {
                options.target.set({
                    left: Math.round(options.target.left / this.grid) * this.grid,
                    top: Math.round(options.target.top / this.grid) * this.grid
                });
            }
            var obj = this.canvas.getActiveObject();
            if (!obj) return;
            obj.set({
                hasControls: 0,
                opacity: 0.3
            });

            // if (this.onMove) {
            //     this.onMove(obj.id, obj.left, obj.top);
            // }

            this.canvas.renderAll();
        }.bind(this));
        this.canvas.on('mouse:wheel', function(opt) {
            if (!this.canvasOptions.ZoomOnMouseScroll) return;
            var delta = opt.e.deltaY;
            var pointer = this.canvas.getPointer(opt.e);
            var zoom = this.canvas.getZoom();
            zoom = zoom + delta / 1000;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.01) zoom = 0.01;
            this.zoomX = opt.e.offsetX;
            this.zoomX = opt.e.offsetY;
            this.zoom = zoom;
            this.drawTimeout();
            opt.e.preventDefault();
            opt.e.stopPropagation();
        }.bind(this));
        this.canvas.on('mouse:up', function(options) {
            var obj = this.canvas.getActiveObject();
            if (!obj) return;

            var o = this.canvasObjects;

            if (this.onClick && !this.canvasOptions.selectable && (typeof obj.id != 'undefined')) {
                this.onClick(obj.id, obj);
                //when clicking don't allow overlapping
                this.canvas.discardActiveObject();
                this.canvas.renderAll();
            }
        }.bind(this));
        this.canvas.on('touch:longpress', function(options) {
            var obj = this.canvas.getActiveObject();
            if (!obj) return;
            if (this.onLongPress && !this.canvasOptions.selectable && (typeof obj.id != 'undefined')) {
                this.onLongPress(obj.id, obj);
                //when clicking don't allow overlapping
                this.canvas.discardActiveObject();
                this.canvas.renderAll();
            }
        }.bind(this));
        this.canvas.on('selection:cleared', function() {
            if (!this.canvas.getActiveObject()) {
                //save canvas to datamodel;
                var o = this.canvas.getObjects();

                function addToModel(obj) {
                    if (obj.type === "textbox") {
                        obj.type = "Text";
                    }

                    var objectType = obj.type.charAt(0).toUpperCase() + obj.type.slice(1);
                    var mediaName = obj.mediaName;
                    var spriteName = obj.spriteName;

                    if (obj.src) {
                        mediaName = obj.src.split('/')[6].split('?')[0];
                        spriteName = obj.src.split('/')[6].split('?')[0];
                    }

                    var co = {};
                    for (var l in this.defObj) {
                        co[l] = obj[l] == null ? this.defObj[l] : obj[l];
                    }

                    co['objectType'] = objectType;
                    co['mediaName'] = mediaName;
                    co['spriteName'] = spriteName;

                    //check if type is group and add objects
                    if (co['objectType'] == 'Group') {
                        //  console.log('new group')
                        //  console.log(co)
                        //  console.log(obj)
                        co['objects'] = [];

                        for (var n = 0; n < obj._objects.length; n++) {
                            co['objects'].push(addToModel.call(this, obj._objects[n]));
                        }
                    }
                    //console.log(co);
                    return co;
                }
                for (var i = 0; i < o.length; i++) {
                    if (typeof o[i].id == 'undefined') continue;
                    if (o[i].id == 'grid') continue;

                    if (!this.objects[o[i].id]) {

                        var oo = addToModel.call(this, o[i])

                        if (!this.canvasObjects) {
                            this.canvasObjects = [];
                        }
                        this.canvasObjects.push(oo);
                        this.objects[o[i].id] = oo;
                    }
                }
                if (o.length > 0) {
                    // console.log(this.canvasObjects)
                    // console.log(this.objects)
                    // this.canvasObjectsChange.emit(this.canvasObjects)
                    // if (this.canvasObjects.stateHolder)
                    // this.servoyApi.apply("canvasObjects");
                }
            }
        }.bind(this));
        this.canvas.on('object:modified', function() {
            if (this.onModified) {
                this.onModified();
            }
            var obj = this.canvas.getActiveObject();
            if (!obj) return;
            obj.set({
                hasControls: this.canvasOptions.selectable,
                opacity: 1
            });
            var sel = []

            function selectHelper(o) {
                if (o) {

                    if (o._objects && o._objects.length > 0) {
                        for (var i = 0; i < o._objects.length; i++) {
                            selectHelper(o._objects[i])
                        }
                    }

                    if (o.objects && o.objects.length > 0) {
                        for (i = 0; i < o.objects.length; i++) {
                            selectHelper(o.objects[i])
                        }
                    }

                    if (o.id) {
                        sel.push(o.id)
                    }

                }
            }

            this.canvas.discardActiveObject();
            selectHelper(obj);
            this.cloneAndSave(obj);

            //reselect objects
            setTimeout(function() {
                if (sel.length > 0)
                    this.setSelectedObject(sel)
            }.bind(this), 0)
        }.bind(this));
        this.canvas.on('mouse:over', function(e) {
            if (!this.canvasOptions.selectable) {
                if (e.target)
                    e.target.hoverCursor = 'pointer';
            }
        }.bind(this));
    }

}

export class canvasOptions {
    public selectable: number;
    public skipTargetFind: number;
    public hasRotatingPoint: number;
    public renderOnAddRemove: number;
    public skipOffscreen: number;
    public ZoomOnMouseScroll: number;
    public animationSpeed: number;
}

export class canvasObject {
    public objectType: String;
    public objects: Object;
    public fill: String;
    public opacity: number;
    public width: number;
    public height: number;
    public radius: number;
    public left: number;
    public top: number;
    public rx: number;
    public ry: number;
    public stroke: String;
    public id: any;
    public scaleX: number;
    public scaleY: number;
    public text: String;
    public textAlign: String;
    public fontSize: number;
    public fontFamily: String;
    public angle: number;
    public mediaName: String;
    public spriteName: String;
    public spriteWidth: number;
    public spriteHeight: number;
    public spriteIndex: number;
    public frameTime: number;
    public selectable: Boolean;
    public custom_data: object;
    public state: any;
}