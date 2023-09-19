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
            var defObj = {
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

            $scope.isDrawing = false;
            $scope.isReady = false;
            $scope.canvas = null;
            $scope.objects = {};
            $scope.images = {};
            $scope.reselect = [];
            $scope.zoom = null;
            $scope.zoomX = null;
            $scope.zoomY = null;
            if (!$scope.model.canvasObjects) {
                $scope.model.canvasObjects = [];
            }

            window.cancelRequestAnimFrame = (function() {
                return window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout
            })();

            function drawTimeout(delay) {
                if (!delay) delay = 0;
                if ($scope.isDrawing) return;
                $scope.isDrawing = true;
                setTimeout($scope.api.draw, delay);
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
                    if (img) {
                        img.onload = function() {
                            drawTimeout();
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

            function cloneAndSave(obj) {
                function upperCaseFirstLetter(string) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                }

                if (!obj) return;

                //check if grouped
                if (obj._objects && obj._objects.length > 0) {
                    for (var i = 0; i < obj._objects.length; i++) {
                        cloneAndSave(obj._objects[i])
                    }
                }

                //else if single item
                // if (obj.id) {
                // 	console.log('ID:' + obj.id)
                // }

                try {
                    var o = $scope.model.canvasObjects;

                    for (i in o) {
                        if (!o[i]) continue;
                        if (o[i].id == obj.id) {
                            for (var k in defObj) {
                                if (k != 'id')
                                    o[i][k] = obj[k]
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
                    $scope.svyServoyapi.apply("canvasObjects");
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

                        for (var k in defObj) {
                            if (k != 'id')
                                d[j][k] = o[k] == null ? defObj[k] : o[k]
                        }
                    }
                }
            }

            function uuidv4() {
                return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function(c) {
                    return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16).toUpperCase();
                })
            }

            function createObject(type, g, noAddToCanvas) {
                // console.log('create object : ' + type);
                // console.log(g.objects)
                var item;
                if (!g.textAlign) {
                    g.textAlign = 'left';
                }
                var options = {
                    cornerColor: !$scope.model.canvasOptions.selectable ? 'rgba(102,153,255,0.0)' : 'rgba(102,153,255,0.5)',
                    borderColor: !$scope.model.canvasOptions.selectable ? 'rgba(102,153,255,0.0)' : 'rgba(102,153,255,0.5)',
                    hasControls: $scope.model.canvasOptions.selectable,
                    selectable: typeof g.selectable == 'undefined' ? true : g.selectable,
                    lockMovementX: !$scope.model.canvasOptions.selectable,
                    lockMovementY: !$scope.model.canvasOptions.selectable
                }
                for (var k in defObj) {
                    if (typeof g[k] != 'undefined')
                        options[k] = g[k]
                }
                // console.log('type : ' + type);
                switch (type) {                	
                    case 'Group':
                        var groupedItems = []
                        if (g && g.objects) {
                            for (var i = 0; i < g.objects.length; i++) {
                                groupedItems.push(createObject(g.objects[i].objectType, g.objects[i], true));
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
                        item = new fabric.Image($scope.images[g.mediaName], options);
                        break;
                    case 'Sprite':
                        item = new fabric.Sprite($scope.images[g.spriteName], options)
                        break;
                    case 'Text':
                        item = new fabric.Textbox(g.text, options);
                        break;
                    default:
                        break;
                }
                if (item && !noAddToCanvas) {

                    $scope.canvas.add(item);
                    if (type == 'Sprite') {
                        item.play();
                    }
                }
                return item;
            }

            $scope.api.bringToFront = function(idx) {
                var o = $scope.canvas._objects;
                for (var i = 0; i < o.length; i++) {
                    if (o[i].id == idx) {
                        o[i].bringToFront();
                    }
                }
                $scope.canvas.renderAll();
            }
            $scope.api.copySelectedObject = function() {
                $scope.canvas.getActiveObject().clone(function(cloned) {
                    _clipboard = cloned;
                    // clone again, so you can do multiple copies.
                    _clipboard.clone(function(clonedObj) {
                        $scope.reselect = []
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
                                $scope.reselect.push(obj.id)
                                // obj.transparentCorners = true;
                                $scope.canvas.add(obj);
                            });
                            // this should solve the unselectability
                            clonedObj.setCoords();
                        } else {
                            $scope.reselect.push(clonedObj.id)
                            $scope.canvas.add(clonedObj);
                        }
                        _clipboard.top += 10;
                        _clipboard.left += 10;
                        _clipboard.id = uuidv4();
                        $scope.reselect.push(_clipboard.id)
                        $scope.canvas.setActiveObject(clonedObj);
                        $scope.canvas.requestRenderAll();
                        $scope.canvas.discardActiveObject();
                        setTimeout(function() {
                            $scope.api.setSelectedObject($scope.reselect)
                        }, 250)

                    });
                });

            }
            $scope.api.saveAsImage = function(cb) {
                var canvas = document.getElementById($scope.model.svyMarkupId);
                var url = canvas.toDataURL({
                    format: 'png',
                    quality: 1.0
                });
                url.download = 'canvas.png'
                $window.executeInlineScript(cb.formname, cb.script, [url]);
            }
            $scope.api.saveCanvas = function(cb) {
                $window.executeInlineScript(cb.formname, cb.script, [JSON.stringify($scope.model.canvasObjects)]);
            }
            $scope.api.ZoomOnPoint = function(x, y, zoom) {
                $scope.zoomX = x;
                $scope.zoomX = y;
                $scope.zoom = zoom;
                drawTimeout();
            }
            $scope.api.updateObject = function(obj, setItemActive) {
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

                    if ($scope.handlers.onModified) {
                        $scope.handlers.onModified();
                    }

                    drawTimeout();
                    if (setItemActive) {
                        setTimeout(function() {
                            $scope.api.setSelectedObject(sel);
                        }, 250)
                    }
                }
            }
            $scope.api.loadCanvas = function(data) {
                // console.log(data);
                if (!data || (data.length < 1)) return;
                $scope.model.canvasObjects = JSON.parse(data);
                $scope.svyServoyapi.apply("canvasObjects");
            }
            $scope.api.addObject = function(objs, setActive) {
                if (setActive != false) {
                    setActive = true;
                }

                if (!$scope.model.canvasOptions.selectable) {
                    setActive = false;
                }

                $scope.reselect = []
                var s = new fabric.ActiveSelection([], {
                    canvas: $scope.canvas
                });
                if (objs && objs.length > 0) {
                    for (var i = 0; i < objs.length; i++) {
                        $scope.reselect.push(objs[i].id)
                        s.addWithUpdate(createObject(objs[i].objectType, objs[i]))
                    }
                } else if (objs) {
                    $scope.reselect.push(objs.id)
                    s.addWithUpdate(createObject(objs.objectType, objs))
                }

                $scope.canvas.setActiveObject(s);

                if (!setActive) {
                    $scope.canvas.discardActiveObject();
                } else {
                    $scope.canvas.discardActiveObject();
                    setTimeout(function() {
                        $scope.api.setSelectedObject($scope.reselect)
                    }, 50)
                }
                $scope.canvas.renderAll();

                if ($scope.handlers.onModified) {
                    $scope.handlers.onModified();
                }
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
            $scope.api.clearCanvas = function() {
                if ($scope.canvas)
                    $scope.canvas.clear();
                drawTimeout();
            }
            $scope.api.setSelectedObject = function(ids) {
                $scope.canvas.discardActiveObject();
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

                function selectHelper(ob) {
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
                    var ao = $scope.canvas.getActiveObject();
                    selectHelper(ao);
                }

                if (sel) {
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
                if (ao.objectType != 'Group' && ob && ob.length > 0) {
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

                if (!$scope.model.canvasOptions) {
                    $scope.model.canvasOptions = {};
                }
                $scope.model.canvasOptions['preserveObjectStacking'] = true;
                $scope.canvas = new fabric.Canvas($scope.model.svyMarkupId, $scope.model.canvasOptions);
                fabric.Object.prototype.transparentCorners = false;
                $scope.canvas.selection = $scope.model.canvasOptions.selectable;
                var gridWidth = document.getElementById($scope.model.svyMarkupId + '-wrapper').clientWidth;
                var gridHeight = document.getElementById($scope.model.svyMarkupId + '-wrapper').clientHeight;

                //setup zoom
                if ($scope.zoom)
                    $scope.canvas.zoomToPoint({ x: $scope.zoomX, y: $scope.zoomY }, $scope.zoom);

                //TODO : set scale based on targetScale options
                //					if ($scope.model.canvasOptions.targetScaleW && $scope.model.canvasOptions.targetScaleH) {
                //						var scaleW = gridWidth / $scope.model.canvasOptions.targetScaleW;
                //						var scaleH = gridHeight / $scope.model.canvasOptions.targetScaleH;
                //
                //						$scope.canvas.setZoom(scaleW / scaleH);
                //						$scope.canvas.setWidth(gridWidth * $scope.canvas.getZoom());
                //						$scope.canvas.setHeight(gridHeight * $scope.canvas.getZoom());
                //					}

                //draw grid
                if ($scope.model.showGrid) {
                    // create grid
                    var gridSize = (gridWidth > gridHeight) ? gridWidth : gridHeight
                    for (var i = 0; i < (gridSize / grid); i++) {
                        $scope.canvas.add(new fabric.Line([i * grid, 0, i * grid, gridSize], {
                            id: 'grid',
                            stroke: '#ccc',
                            selectable: false
                        }));
                        $scope.canvas.add(new fabric.Line([0, i * grid, gridSize, i * grid], {
                            id: 'grid',
                            stroke: '#ccc',
                            selectable: false
                        }));
                    }
                }

                $scope.canvas.setWidth(gridWidth);
                $scope.canvas.setHeight(gridHeight);

                var g = $scope.model.canvasObjects;
                for (var j in g) {
                    $scope.objNum++;
                    if (!g[j]) continue;
                    console.log(g[j].id + ' : ' + g[j].objectType);
                    console.log(g[j]);
                    //create an fabric item
                    var type = g[j].objectType;
                    $scope.objects[g[j].id] = createObject(type, g[j]);
                }

                setupEvents();
                // console.log($scope.canvas.getObjects().length);
                if ($scope.canvas.getObjects().length > 1000) {
                    console.log('WARNING - over 1000 objects created. Client performance will be impacted.');
                }

                if (!$scope.isReady) {
                    if ($scope.handlers.onReady) $scope.handlers.onReady();
                    $scope.isReady = true;
                }
                $scope.isDrawing = false;
            }
            $scope.api.rotate = function(angle) {
                var group = new fabric.Group($scope.canvas.getObjects())
                group.rotate(angle)
                $scope.canvas.centerObject(group)
                group.setCoords()
                $scope.canvas.renderAll()
            }
            $scope.api.printCanvas = function() {            	
            	var originWidth = $scope.canvas.getWidth();

                function zoom (width)
                    {
                        var scale = width / $scope.canvas.getWidth();
                        height = scale * $scope.canvas.getHeight();

                        $scope.canvas.setDimensions({
                            "width": width,
                            "height": height
                        });

                        $scope.canvas.calcOffset();
                        var objects = $scope.canvas.getObjects();
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
                        $scope.canvas.renderAll();
                }

                zoom (100);
            	
        	    var dataUrl = $scope.canvas.toDataURL(); //attempt to save base64 string to server using this var  
        	    var windowContent = '<!DOCTYPE html>';
        	    windowContent += '<html>'	    
        	    windowContent += '<body>'
        	    windowContent += '<head><style> @page { size: auto;  margin: 0mm; }</style> <title> </title></head>'
        	    windowContent += '<img style="width:100vw;width:100vh;" src="' + dataUrl + '">';
        	    windowContent += '</body>';
        	    windowContent += '</html>';
        	    var printWin = window.open();
        	    printWin.document.open();
        	    printWin.document.write(windowContent);
        	    printWin.document.close();
        	    printWin.focus();
        	    printWin.print();
        	    setTimeout(function(){
        		printWin.close();	
        		zoom (originWidth);
        		},1000)               
            }
            $scope.api.startAnimate = function() {
                var render = function() {
                    var applyChanges = false;
                    try {
                        $scope.canvas.discardActiveObject();
                        var o = $scope.model.canvasObjects;
                        $scope.canvas.getObjects().concat().forEach(function(obj) {
                            if (obj.id != 'grid' && typeof obj.id != 'undefined') {
                                //									$scope.model.canvasObjects.map(function(c) {
                                //										if (c.id == obj.id) {
                                //											console.log(obj.custom_data.dateChanged)
                                //											console.log(c.custom_data.dateChanged)
                                //											if (obj.custom_data.dateChanged != c.custom_data.dateChanged) {
                                //												applyChanges = true;
                                //												for (var i in c) {
                                //													obj[i] = c[i]
                                //												}
                                //											}
                                //
                                //										}
                                //									});
                            }
                        });
                        if (applyChanges) $scope.svyServoyapi.apply("canvasObjects");
                        $scope.canvas.renderAll();
                    } catch (e) {}

                }

                if ($scope.render) return;
                if ($scope.model.canvasOptions.animationSpeed == null || ($scope.model.canvasOptions.animationSpeed < 50))
                    $scope.model.canvasOptions.animationSpeed = 50;
                $scope.render = setInterval(render, $scope.model.canvasOptions.animationSpeed)
            }
            $scope.api.stopAnimate = function() {
                clearInterval($scope.render);
                $scope.render = null;
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
                        hasControls: 0,
                        opacity: 0.3
                    });

                    // if ($scope.handlers.onMove) {
                    //     $scope.handlers.onMove(obj.id, obj.left, obj.top);
                    // }

                    $scope.canvas.renderAll();
                });
                $scope.canvas.on('mouse:wheel', function(opt) {
                    if (!$scope.model.canvasOptions.ZoomOnMouseScroll) return;
                    var delta = opt.e.deltaY;
                    var pointer = $scope.canvas.getPointer(opt.e);
                    var zoom = $scope.canvas.getZoom();
                    zoom = zoom + delta / 1000;
                    if (zoom > 20) zoom = 20;
                    if (zoom < 0.01) zoom = 0.01;
                    $scope.zoomX = opt.e.offsetX;
                    $scope.zoomX = opt.e.offsetY;
                    $scope.zoom = zoom;
                    drawTimeout();
                    opt.e.preventDefault();
                    opt.e.stopPropagation();
                });
                $scope.canvas.on('mouse:up', function(options) {
                    var obj = $scope.canvas.getActiveObject();
                    if (!obj) return;

                    var o = $scope.model.canvasObjects;

                    if ($scope.handlers.onClick && !$scope.model.canvasOptions.selectable && (typeof obj.id != 'undefined')) {
                        $scope.handlers.onClick(obj.id, obj);
                        //when clicking don't allow overlapping
                        $scope.canvas.discardActiveObject();
                        $scope.canvas.renderAll();
                    }
                });
                $scope.canvas.on('touch:longpress', function(options) {
                    var obj = $scope.canvas.getActiveObject();
                    if (!obj) return;
                    if ($scope.handlers.onLongPress && !$scope.model.canvasOptions.selectable && (typeof obj.id != 'undefined')) {
                        $scope.handlers.onLongPress(obj.id, obj);
                        //when clicking don't allow overlapping
                        $scope.canvas.discardActiveObject();
                        $scope.canvas.renderAll();
                    }
                });
                $scope.canvas.on('selection:cleared', function() {
                    if (!$scope.canvas.getActiveObject()) {
                        //save canvas to datamodel;
                        var o = $scope.canvas.getObjects();

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
                            for (var l in defObj) {
                                co[l] = obj[l] == null ? defObj[l] : obj[l];
                            }

                            co['objectType'] = objectType;
                            co['mediaName'] = mediaName;
                            co['spriteName'] = spriteName;

                            //check if type is group and add objects
                            if (co['objectType'] == 'Group') {
                                //	console.log('new group')
                                //	console.log(co)
                                //	console.log(obj)
                                co['objects'] = [];

                                for (var n = 0; n < obj._objects.length; n++) {
                                    co['objects'].push(addToModel(obj._objects[n]));
                                }
                            }
                            //console.log(co);
                            return co;
                        }
                        for (var i = 0; i < o.length; i++) {
                            if (typeof o[i].id == 'undefined') continue;
                            if (o[i].id == 'grid') continue;

                            if (!$scope.objects[o[i].id]) {

                                var oo = addToModel(o[i])

                                if (!$scope.model.canvasObjects) {
                                    $scope.model.canvasObjects = [];
                                }

                                $scope.model.canvasObjects.push(oo);
                                $scope.objects[o[i].id] = oo;
                            }
                        }
                        if (o.length > 0) {
                            $scope.svyServoyapi.apply("canvasObjects");
                        }
                    }
                });
                $scope.canvas.on('object:modified', function() {
                    if ($scope.handlers.onModified) {
                        $scope.handlers.onModified();
                    }
                    var obj = $scope.canvas.getActiveObject();
                    if (!obj) return;
                    obj.set({
                        hasControls: $scope.model.canvasOptions.selectable,
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

                    $scope.canvas.discardActiveObject();
                    selectHelper(obj);
                    cloneAndSave(obj);

                    //reselect objects
                    setTimeout(function() {
                        if (sel.length > 0)
                            $scope.api.setSelectedObject(sel)
                    }, 0)
                });
                $scope.canvas.on('mouse:over', function(e) {
                    if (!$scope.model.canvasOptions.selectable) {
                        if (e.target)
                            e.target.hoverCursor = 'pointer';
                    }

                });

            }
            window.addEventListener("resize", drawTimeout);
            setTimeout(loadImg, 0);
            drawTimeout();
            // if the model are updated re-draw the chart
            $scope.$watchCollection('model.imagesLoader', function(newValue, oldValue) {
                loadImg();
            });
            $scope.$watchCollection('model.showGrid', function(newValue, oldValue) {
                drawTimeout();
            });
            $scope.$watchCollection('model.gridSize', function(newValue, oldValue) {
                drawTimeout();
            });
            $scope.$watchCollection('model.canvasOptions', function(newValue, oldValue) {
                drawTimeout();
            });
            $scope.$watchCollection('model.canvasObjects', function(newValue, oldValue) {
                drawTimeout();
            });
        },
        templateUrl: 'svycanvas/Canvas/Canvas.html'
    };
})