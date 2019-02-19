angular.module('svycanvasCanvas', ['servoy']).directive('svycanvasCanvas', function() {
    return {
        restrict: 'E',
        scope: {
            model: '=svyModel',
            handlers: "=svyHandlers",
            api: "=svyApi",
            svyServoyapi: "=svyServoyapi"
        },
        controller: function($scope, $element, $attrs, $window) {
            $scope.canvas = null;
            $scope.objects = {};
            $scope.images = {};

            if (!$scope.model.canvasObjects) {
                $scope.model.canvasObjects = [];
            }

            function loadImg() {
                if ($scope.model.imagesLoader && $scope.model.imagesLoader.length > 0) {
                    var im = $scope.model.imagesLoader;
                    for (var i in im) {
                        if (!im[i]) continue;
                        var imgName = im[i].split('/')[3].split('?')[0];
                        if (!$scope.images[imgName]) {
                            var img = new Image();
                            img.src = im[i];
                            $scope.images[imgName] = img;
                        }
                    }
                }
            }

            function clone(obj) {
                if (null == obj || "object" != typeof obj) return obj;
                var copy = obj.constructor();
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
                }
                return copy;
            }

            function cloneAndSave(obj, generate) {
                var o = $scope.model.canvasObjects;
                if (!obj) return;
                //if this is a grouping
                if (obj._objects) {
                    obj.clone(function(clone) {
                        if (generate) {
                            clone.set({ left: ($scope.canvas.width / 2), top: ($scope.canvas.height / 2) });
                        }
                        clone.destroy();
                        var ob = clone._objects;
                        for (var i = 0; i < ob.length; i++) {
                            cloneAndSave(ob[i], generate);
                        }
                    });
                } else {
                    var tmp = []
                    for (var i in o) {
                        if (!o[i]) continue;
                        if (o[i].id == obj.id) {
                            o[i].x = obj.left;
                            o[i].y = obj.top;
                            o[i].scaleX = obj.scaleX;
                            o[i].scaleY = obj.scaleY;
                            o[i].angle = obj.angle;
                            o[i].text = obj.text;
                            o[i].fontFamily = obj.fontFamily;
                            o[i].mediaName = obj.mediaName;
                            if (generate) {
                                var n = clone(o[i]);
                                n.id = uuidv4();
                                $scope.model.canvasObjects.push(n);
                            }
                        }
                    }
                    $scope.svyServoyapi.apply("canvasObjects");
                }
                try {
                    obj.clone(function(clone) {
                        var oi = clone._objects;
                        if (!oi) return;
                        clone.destroy();
                        for (var j = 0; j < oi.length; j++) {
                            for (var i in o) {
                                if (!o[i]) continue;
                                if (o[i].id == oi[j].id) {
                                    o[i].x = oi[j].left;
                                    o[i].y = oi[j].top;
                                    o[i].scaleX = oi[j].scaleX;
                                    o[i].scaleY = oi[j].scaleY;
                                    o[i].angle = oi[j].angle;
                                    o[i].text = oi[j].text;
                                    o[i].fontFamily = oi[j].fontFamily;
                                    if (oi[j].src) {
                                        o[i].mediaName = oi[j].src.split('/')[6].split('?')[0];
                                    }

                                }
                            }
                        }
                        $scope.svyServoyapi.apply("canvasObjects");
                    }, ['id']);
                } catch (e) {}
            }

            function updateModelObj(o) {                
                //if it has no identifier don't update
                if (!o.id) return;
                // console.log('update ' + o.id);
                // console.log(o.left + ' , ' + o.top)
                var d = $scope.model.canvasObjects;
                if (o[i].type === "i-text") {
                    o[i].type = "Text";
                }
                var objectType = o.type.charAt(0).toUpperCase() + o.type.slice(1);
                for (var j in d) {
                    if (d[j] && d[j].id == o.id) {
                        d[j].angle = o.angle == null ? 0 : o.angle;
                        d[j].fontSize = o.fontSize == null ? 8 : o.fontSize;
                        d[j].text = o.text == null ? 'text' : o.text;
                        d[j].fontFamily = o.fontFamily == null ? 'Times New Roman' : o.fontFamily;
                        d[j].scaleX = o.scaleX == null ? 1 : o.scaleX;
                        d[j].scaleY = o.scaleY == null ? 1 : o.scaleY;
                        d[j].x = o.left;
                        d[j].y = o.top;
                        d[j].rx = o.rx;
                        d[j].ry = o.ry;
                        d[j].stroke = o.stroke;
                        d[j].strokeWidth = o.strokeWidth;
                        d[j].width = o.width == null ? 50 : o.width;
                        d[j].height = o.height == null ? 50 : o.height;
                        d[j].radius = o.radius == null ? 0 : o.radius;
                        d[j].fill = o.fill == null ? 'black' : o.fill;
                        d[j].opacity = o.opacity == null ? 1 : o.opacity;
                        d[j].objectType = objectType;
                        d[j].mediaName = o.mediaName == null ? '' : o.mediaName;
                    }
                }
            }

            function uuidv4() {
                return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function(c) {
                    return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16).toUpperCase();
                })
            }

            function createObject(type, g) {
                // console.log('create object : ' + type);
                var item;
                switch (type) {
                    case 'Circle':
                        item = new fabric.Circle({
                            id: g.id,
                            fill: g.fill,
                            top: g.y,
                            left: g.x,
                            opacity: g.opacity,
                            radius: g.radius,
                            originX: 'left',
                            originY: 'top',
                            centeredRotation: true,
                            scaleX: g.scaleX,
                            scaleY: g.scaleY,
                            angle: g.angle,
                            cornerColor: !$scope.model.canvasOptions.selectable ? 'rgba(102,153,255,0.0)' : 'rgba(102,153,255,0.5)',
                            borderColor: !$scope.model.canvasOptions.selectable ? 'rgba(102,153,255,0.0)' : 'rgba(102,153,255,0.5)',
                            hasControls: $scope.model.canvasOptions.selectable,
                            selectable: true,
                            lockMovementX: !$scope.model.canvasOptions.selectable,
                            lockMovementY: !$scope.model.canvasOptions.selectable
                        });
                        break;
                    case 'Rect':
                        item = new fabric.Rect({
                            id: g.id,
                            fill: g.fill,
                            top: g.y,
                            left: g.x,
                            width: g.width,
                            height: g.height,
                            opacity: g.opacity,
                            originX: 'left',
                            originY: 'top',
                            centeredRotation: true,
                            scaleX: g.scaleX,
                            scaleY: g.scaleY,
                            angle: g.angle,
                            cornerColor: !$scope.model.canvasOptions.selectable ? 'rgba(102,153,255,0.0)' : 'rgba(102,153,255,0.5)',
                            borderColor: !$scope.model.canvasOptions.selectable ? 'rgba(102,153,255,0.0)' : 'rgba(102,153,255,0.5)',
                            hasControls: $scope.model.canvasOptions.selectable,
                            selectable: true,
                            lockMovementX: !$scope.model.canvasOptions.selectable,
                            lockMovementY: !$scope.model.canvasOptions.selectable,
                        });
                        break;
                    case 'Triangle':
                        item = new fabric.Triangle({
                            id: g.id,
                            fill: g.fill,
                            top: g.y,
                            left: g.x,
                            width: g.width,
                            height: g.height,
                            opacity: g.opacity,
                            originX: 'left',
                            originY: 'top',
                            centeredRotation: true,
                            scaleX: g.scaleX,
                            scaleY: g.scaleY,
                            angle: g.angle,
                            cornerColor: !$scope.model.canvasOptions.selectable ? 'rgba(102,153,255,0.0)' : 'rgba(102,153,255,0.5)',
                            borderColor: !$scope.model.canvasOptions.selectable ? 'rgba(102,153,255,0.0)' : 'rgba(102,153,255,0.5)',
                            hasControls: $scope.model.canvasOptions.selectable,
                            selectable: true,
                            lockMovementX: !$scope.model.canvasOptions.selectable,
                            lockMovementY: !$scope.model.canvasOptions.selectable,
                        });
                        break;
                    case 'Image':
                        item = new fabric.Image($scope.images[g.mediaName], {
                            id: g.id,
                            fill: g.fill,
                            top: g.y,
                            left: g.x,
                            opacity: g.opacity,
                            originX: 'left',
                            originY: 'top',
                            centeredRotation: true,
                            scaleX: g.scaleX,
                            scaleY: g.scaleY,
                            angle: g.angle,
                            cornerColor: !$scope.model.canvasOptions.selectable ? 'rgba(102,153,255,0.0)' : 'rgba(102,153,255,0.5)',
                            borderColor: !$scope.model.canvasOptions.selectable ? 'rgba(102,153,255,0.0)' : 'rgba(102,153,255,0.5)',
                            hasControls: $scope.model.canvasOptions.selectable,
                            selectable: true,
                            lockMovementX: !$scope.model.canvasOptions.selectable,
                            lockMovementY: !$scope.model.canvasOptions.selectable,
                            mediaName: g.mediaName,
                        });
                        break;
                    case 'Text':
                        item = new fabric.IText(g.text, {
                            fontFamily: g.fontFamily,
                            id: g.id,
                            fill: g.fill,
                            top: g.y,
                            left: g.x,
                            opacity: g.opacity,
                            radius: g.radius,
                            originX: 'left',
                            originY: 'top',
                            centeredRotation: true,
                            scaleX: g.scaleX,
                            scaleY: g.scaleY,
                            angle: g.angle,
                            cornerColor: !$scope.model.canvasOptions.selectable ? 'rgba(102,153,255,0.0)' : 'rgba(102,153,255,0.5)',
                            borderColor: !$scope.model.canvasOptions.selectable ? 'rgba(102,153,255,0.0)' : 'rgba(102,153,255,0.5)',
                            hasControls: $scope.model.canvasOptions.selectable,
                            selectable: true,
                            lockMovementX: !$scope.model.canvasOptions.selectable,
                            lockMovementY: !$scope.model.canvasOptions.selectable,
                        });
                        break;
                    default:
                        break;
                }
                if (item)
                    $scope.canvas.add(item);
                return item;
            }
            $scope.api.copySelectedObject = function(obj, grouping) {
                $scope.canvas.getActiveObject().clone(function(cloned) {
                    _clipboard = cloned;
                    // clone again, so you can do multiple copies.
                    _clipboard.clone(function(clonedObj) {
                        $scope.canvas.discardActiveObject();
                        clonedObj.set({
                            left: clonedObj.left + 10,
                            top: clonedObj.top + 10,
                            id: uuidv4(),
                            evented: true
                        });
                        if (clonedObj.type === 'activeSelection') {
                            // active selection needs a reference to the canvas.
                            clonedObj.canvas = $scope.canvas;
                            clonedObj.forEachObject(function(obj) {
                                obj.id = uuidv4();
                                // obj.transparentCorners = true;
                                $scope.canvas.add(obj);
                            });
                            // this should solve the unselectability
                            clonedObj.setCoords();
                        } else {
                            $scope.canvas.add(clonedObj);
                        }
                        _clipboard.top += 10;
                        _clipboard.left += 10;
                        _clipboard.id = uuidv4();
                        $scope.canvas.setActiveObject(clonedObj);
                        $scope.canvas.requestRenderAll();
                    });
                });

            }
            $scope.api.saveCanvas = function(cb) {
                var obj = $scope.canvas.getActiveObject();
                //if grouped
                if (obj && obj._objects) {
                    for (var i in obj._objects) {
                        if (!$scope.objects[obj._objects[i].id]) {
                            $scope.canvas.discardActiveObject();
                            return setTimeout(function() {
                                $scope.api.saveCanvas(cb);
                            }, 250);
                        }
                    }
                } else if (obj && !$scope.objects[obj.id]) {
                    $scope.canvas.discardActiveObject();
                    return setTimeout(function() {
                        $scope.api.saveCanvas(cb);
                    }, 250);
                }
                $window.executeInlineScript(cb.formname, cb.script, [JSON.stringify($scope.model.canvasObjects)]);
            }
            $scope.api.updateObject = function(obj,setItemActive) {
                if (obj) {                    
                    var sel = [];
                    var ob = $scope.model.canvasObjects;
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
                    $scope.svyServoyapi.apply("canvasObjects");
                    $scope.api.draw();
                    if (setItemActive)
                    $scope.api.setSelectedObject(sel);                    
                }
            }
            $scope.api.loadCanvas = function(data) {
                // console.log(data);
                if (!data || (data.length < 1)) return;
                $scope.model.canvasObjects = JSON.parse(data);
                $scope.svyServoyapi.apply("canvasObjects");
            }
            $scope.api.addObject = function(objs) {
                var s = new fabric.ActiveSelection([], {
                    canvas: $scope.canvas
                });
                if (objs && objs.length > 0) {
                    for (var i = 0; i < objs.length; i++) {
                        s.addWithUpdate(createObject(objs[i].objectType, objs[i]))
                    }
                } else if (objs) {
                    s.addWithUpdate(createObject(objs.objectType, objs))
                }
                $scope.canvas.setActiveObject(s);
                $scope.canvas.renderAll();
            }

            $scope.api.removeObject = function(idx) {
                var o = $scope.canvas.getActiveObject();
                //check if in a group
                function remove(id) {
                    if (id) {
                        var obj = $scope.model.canvasObjects;
                        for (var i in obj) {
                            if (!obj[i]) continue;
                            if (obj[i].id == id) {
                                $scope.canvas.remove(o);
                                delete obj[i];
                            }
                        }
                    }
                }
                if (!o) return;
                remove(o.id);
                var ob = o._objects;
                if (ob && ob.length > 1) {
                    for (var j = 0; j < ob.length; j++) {
                        var id = ob[j].id;
                        if (!id) continue;
                        remove(id);
                        $scope.canvas.remove(ob[j]);
                    }
                    $scope.svyServoyapi.apply("canvasObjects");
                }
                $scope.canvas.remove(o);
                if (o._objects) {
                    $scope.canvas.remove(o._objects[0]);
                }
                $scope.canvas.discardActiveObject();
                $scope.canvas.renderAll();
            }
            $scope.api.setSelectedObject = function(ids) {
                var o = $scope.canvas.getObjects();
                if (ids && ids.length > 0) {
                    var s = new fabric.ActiveSelection([], {
                        canvas: $scope.canvas
                    });
                    for (var i = 0; i < ids.length; i++) {
                        s.addWithUpdate($scope.objects[ids[i]])
                    }
                    $scope.canvas.setActiveObject(s);
                    $scope.canvas.renderAll();
                }
            }
            $scope.api.getSelectedObject = function(cb, sel) {
                if (sel) {
                    // console.log(sel);
                    var co = $scope.model.canvasObjects;
                    var os = [];
                    for (var i in co) {
                        for (var j = 0; j < sel.length; j++) {
                            if (!co[i]) continue;
                            if (co[i].id == sel[j]) {
                                os.push(co[i])
                            }
                        }
                    }
                    return $window.executeInlineScript(cb.formname, cb.script, [os]);
                }
                var ao = $scope.canvas.getActiveObject();
                if (!ao) return;
                var ob = ao._objects;
                if (ob && ob.length > 0) {
                    var grp = []
                    for (var j = 0; j < ob.length; j++) {
                        if (!ob[j]) continue;
                        grp.push(ob[j].id);
                    }
                    $scope.canvas.discardActiveObject();
                    return setTimeout(function() {
                        $scope.api.getSelectedObject(cb, grp)
                    }, 250);
                }
                $scope.canvas.discardActiveObject();
                return setTimeout(function() {
                    $scope.api.getSelectedObject(cb, [ao.id])
                }, 250);
            }
            $scope.api.draw = function() {
                grid = $scope.model.gridSize;
                $scope.objects = {};
                $scope.objNum = -1;
                //need to destroy canvas completely
                var wr = document.getElementById($scope.model.svyMarkupId + '-wrapper')
                if (!wr) return;
                wr.innerHTML = '';
                var ca = document.createElement("canvas");
                ca.id = $scope.model.svyMarkupId;
                wr.appendChild(ca);
                //create new canvas object
                if ($scope.canvas) {
                    $scope.canvas.dispose();
                }
                $scope.canvas = new fabric.Canvas($scope.model.svyMarkupId, $scope.model.canvasOptions);
                fabric.Object.prototype.transparentCorners = false;
                var gridWidth = document.getElementById($scope.model.svyMarkupId + '-wrapper').clientWidth;
                var gridHeight = document.getElementById($scope.model.svyMarkupId + '-wrapper').clientHeight;

                //draw grid
                if ($scope.model.showGrid) {
                    // create grid
                    for (var i = 0; i < (gridWidth / grid); i++) {
                        $scope.canvas.add(new fabric.Line([i * grid, 0, i * grid, gridWidth], {
                            id: 'grid',
                            stroke: '#ccc',
                            selectable: false
                        }));
                        $scope.canvas.add(new fabric.Line([0, i * grid, gridWidth, i * grid], {
                            id: 'grid',
                            stroke: '#ccc',
                            selectable: false
                        }))
                    }
                }

                $scope.canvas.setWidth(gridWidth);
                $scope.canvas.setHeight(gridHeight);
                var g = $scope.model.canvasObjects;

                for (var j in g) {
                    $scope.objNum++;
                    if (!g[j]) continue;
                    //create an fabric item
                    var type = g[j].objectType;
                    $scope.objects[g[j].id] = createObject(type, g[j]);
                }
                setupEvents();
                console.log($scope.canvas.getObjects().length);
                if ($scope.canvas.getObjects().length > 1000) {
                    console.log('WARNING - over 1000 objects created. Client performance will be impacted.');
                }
            }
            //setup events
            function setupEvents() {
                $scope.canvas.on('object:scaling', function(options) {
                    if ($scope.model.snapToGrid) {
                        var target = options.target,
                            w = target.width * target.scaleX,
                            h = target.height * target.scaleY,
                            snap = { // Closest snapping points
                                top: Math.round(target.top / grid) * grid,
                                left: Math.round(target.left / grid) * grid,
                                bottom: Math.round((target.top + h) / grid) * grid,
                                right: Math.round((target.left + w) / grid) * grid
                            },
                            threshold = grid,
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
                    var obj = $scope.canvas.getActiveObject();
                    if (!obj) return;
                    obj.set({
                        opacity: 0.3
                    });
                    // if ($scope.handlers.onScale) {
                    //     $scope.handlers.onScale(obj.id, obj.scaleX, obj.scaleY);
                    // }
                    $scope.canvas.renderAll();
                });
                $scope.canvas.on('object:moving', function(options) {
                    //snap to grid
                    if ($scope.model.snapToGrid) {
                        options.target.set({
                            left: Math.round(options.target.left / grid) * grid,
                            top: Math.round(options.target.top / grid) * grid
                        });
                    }
                    var obj = $scope.canvas.getActiveObject();
                    if (!obj) return;
                    obj.set({
                        opacity: 0.3
                    });
                    // if ($scope.handlers.onMove) {
                    //     $scope.handlers.onMove(obj.id, obj.left, obj.top);
                    // }
                    $scope.canvas.renderAll();
                });
                $scope.canvas.on('mouse:up', function(options) {
                    var obj = $scope.canvas.getActiveObject();
                    if (!obj) return;
                    // console.log(obj.id + ' :: ' + obj.left + ',' + obj.top);
                    // console.log(obj);
                    obj.set({
                        opacity: 1
                    });
                    if ($scope.handlers.onClick && !$scope.model.canvasOptions.selectable) {
                        $scope.handlers.onClick(obj.id, obj);
                        //when clicking don't allow overlapping
                        $scope.canvas.discardActiveObject();
                        $scope.canvas.renderAll();
                    }
                });
                $scope.canvas.on('selection:cleared', function() {
                    setTimeout(function() {
                        if (!$scope.canvas.getActiveObject()) {
                            // console.log('no selection');
                            //save canvas to datamodel;
                            var o = $scope.canvas.getObjects();
                            for (var i = 0; i < o.length; i++) {
                                if (typeof o[i].id == 'undefined') continue;
                                if (o[i].id == 'grid') continue;
                                if (!$scope.objects[o[i].id]) {
                                    if (o[i].type === "i-text") {
                                        o[i].type = "Text";
                                    }
                                    var objectType = o[i].type.charAt(0).toUpperCase() + o[i].type.slice(1);
                                    var mediaName = o[i].mediaName;
                                    // console.log(o[i])
                                    if (o[i].src) {
                                        mediaName = o[i].src.split('/')[6].split('?')[0];
                                    }
                                    var oo = {
                                        id: o[i].id,
                                        angle: o[i].angle == null ? 0 : o[i].angle,
                                        fontSize: o[i].fontSize == null ? 8 : o[i].fontSize,
                                        text: o[i].text == null ? 'text' : o[i].text,
                                        fontFamily: o[i].fontFamily == null ? 'Times New Roman' : o[i].fontFamily,
                                        scaleX: o[i].scaleX == null ? 1 : o[i].scaleX,
                                        scaleY: o[i].scaleY == null ? 1 : o[i].scaleY,
                                        x: o[i].left,
                                        y: o[i].top,
                                        width: o[i].width == null ? 50 : o[i].width,
                                        height: o[i].height == null ? 50 : o[i].height,
                                        radius: o[i].radius == null ? 0 : o[i].radius,
                                        fill: o[i].fill == null ? 'black' : o[i].fill,
                                        opacity: o[i].opacity == null ? 1 : o[i].opacity,
                                        mediaName: mediaName,
                                        objectType: objectType
                                    }
                                    if (!$scope.model.canvasObjects) {
                                        $scope.model.canvasObjects = [];
                                    }
                                    $scope.model.canvasObjects.push(oo);
                                    $scope.objects[o[i].id] = oo;
                                }
                            }
                            if (o.length > 0) {
                                // console.log($scope.model.canvasObjects);
                                $scope.svyServoyapi.apply("canvasObjects");
                            }
                        }
                    }, 0);
                });
                $scope.canvas.on('object:modified', function() {
                    if ($scope.handlers.onModified) {
                        $scope.handlers.onModified();
                    }
                    var obj = $scope.canvas.getActiveObject();
                    if (!obj) return;
                    obj.set({
                        opacity: 1
                    });
                    cloneAndSave(obj);
                });
            }
            window.addEventListener("resize", $scope.api.draw);
            setTimeout(loadImg, 0);
            setTimeout($scope.api.draw, 250);
            // if the model are updated re-draw the chart
            $scope.$watchCollection('model.imagesLoader', function(newValue, oldValue) {
                loadImg();
            });
            $scope.$watchCollection('model.showGrid', function(newValue, oldValue) {
                $scope.api.draw();
            });
            $scope.$watchCollection('model.gridSize', function(newValue, oldValue) {
                $scope.api.draw();
            });
            $scope.$watchCollection('model.canvasOptions', function(newValue, oldValue) {
                $scope.api.draw();
            });
            $scope.$watchCollection('model.canvasObjects', function(newValue, oldValue) {
                $scope.api.draw();
            });
        },
        templateUrl: 'svycanvas/Canvas/Canvas.html'
    };
})