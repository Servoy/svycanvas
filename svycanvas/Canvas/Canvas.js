angular.module('svycanvasCanvas', ['servoy']).directive('svycanvasCanvas', function() {
		return {
			restrict: 'E',
			scope: {
				model: '=svyModel',
				handlers: "=svyHandlers",
				api: "=svyApi",
				svyServoyapi: "=svyServoyapi"
			},
			controller: function($scope, $element, $attrs, $window, $utils) {
				var defObj = {
					id: '',
					angle: '',
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
					spriteName: '',
					spriteWidth: 50,
					spriteHeight: 72,
					spriteIndex: 0,
					frameTime: 100,
					objectType: '',
					rx: 0,
					ry: 0,
					textAlign: 'left',
					selectable: null,
					objects: null
				}

				$scope.isDrawing = false;
				$scope.isReady = false;
				$scope.canvas = null;
				$scope.objects = { };
				$scope.images = { };
				$scope.reselect = [];
				$scope.zoom = null;
				$scope.zoomX = null;
				$scope.zoomY = null;
				
				$scope.isDragging;
				$scope.lastPosX;
				$scope.lastPosY;
				
				var clickTimer;
				var preventClick;
				
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
				
				function getObjectById(objectId) {
					for (var i = 0; i < $scope.model.canvasObjects.length; i++) {
						if ($scope.model.canvasObjects[i].id == objectId) {
							return $scope.model.canvasObjects[i];
						}
					}
					return null;
				}
				
				function getObjectsFromEvent(evt) {
					var result = [];
					if (evt && evt.target && evt.target._objects) {
						for (var i = 0; i < evt.target._objects.length; i++) {
							var obj = evt.target._objects[i];
							if (obj.id) {
								result.push(getObjectById(obj.id))
							}
						}
					} else if (evt && evt.target && evt.target.id) {
						result.push(getObjectById(evt.target.id))
					}
					return result;
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
					//					if (obj.id) {
					//						console.log('ID:' + obj.id)
					//					}

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
					} catch (e) {
					}
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
					//					console.log('create object : ' + type);
					//					console.log(g.objects)
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

				/**
				 * Brings the object with the given ID to front
				 * 
				 * @param {String} objectId
				 */
				$scope.api.bringToFront = function(objectId) {
					var o = $scope.canvas._objects;
					for (var i = 0; i < o.length; i++) {
						if (o[i].id == objectId) {
							o[i].bringToFront();
						}
					}
					$scope.canvas.renderAll();
				}
				
				/**
				 * Copies the selected object
				 */
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
				
				/**
				 * @param {Function} callbackMethod
				 */
				$scope.api.saveAsImage = function(callbackMethod) {
					var canvas = document.getElementById($scope.model.svyMarkupId);
					var url = canvas.toDataURL({
						format: 'png',
						quality: 1
					});
					url.download = 'canvas.png';
					$window.executeInlineScript(callbackMethod.formname, callbackMethod.script, [url]);
				}
				
				/**
				 * Returns a URL for a png image of the canvas
				 * @return {String} url
				 */
				$scope.api.getImageUrl = function() {
					var url = $scope.canvas.toDataURL({
						format: 'png',
						quality: 1
					});
					return url.replace('data:image/png;base64,', '');
				}				
				
				/**
				 * @param {Function} cb
				 * @deprecated use getCanvasState instead
				 */
				$scope.api.saveCanvas = function(cb) {
					$window.executeInlineScript(cb.formname, cb.script, [JSON.stringify($scope.model.canvasObjects)]);
				}
				
				/**
				 * @deprecated 
				 */
				$scope.api.ZoomOnPoint = function(x, y, zoom) {
					$scope.api.zoomToPoint(x, y, zoom);
				}
				
				/**
				 * Zooms to the given coordinates with the given zoom level
				 * 
				 * @param {Number} x
				 * @param {Number} y
				 * @param {Number} zoom
				 */
				$scope.api.zoomToPoint = function(x, y, zoom) {
					$scope.zoomX = x;
					$scope.zoomY = y;
					$scope.zoom = zoom;
					$scope.canvas.zoomToPoint({ x: y, y: y }, zoom);
					$scope.canvas.renderAll();
				}				
				
				/**
				 * Sets the zoom factor to the given value
				 * 
				 * @param {Number} zoom
				 */
				$scope.api.zoom = function(zoom) {
					$scope.zoom = zoom;
					drawTimeout(0);
				}				
				
				/**
				 * Updates the given object, optionally making it active
				 * 
				 * @param {canvasObject} canvasObject
				 * @param {Boolean} setItemActive
				 */
				$scope.api.updateObject = function(canvasObject, setItemActive) {
					if (canvasObject) {
						var sel = [];
						var ob = $scope.model.canvasObjects;
						if (!ob) return;
						for (var i in canvasObject) {
							for (var j in ob) {
								if (!canvasObject[i]) continue;
								if (!ob[j]) continue;
								if (canvasObject[i].id == ob[j].id) {
									sel.push(ob[j].id);
									for (var k in canvasObject[i]) {
										ob[j][k] = canvasObject[i][k];
									}
								}
							}
						}
						$scope.svyServoyapi.apply("canvasObjects");

						if ($scope.handlers.onModified) {
							if (canvasObject instanceof Array) {
								$scope.handlers.onModified(canvasObject);								
							} else {
								$scope.handlers.onModified([canvasObject]);
							}
						}

						drawTimeout();
						if (setItemActive) {
							setTimeout(function() {
									$scope.api.setSelectedObject(sel);
								}, 250)
						}
					}
				}
				
				/**
				 * Adds the given object or object[] to the canvas, optionally making it active
				 * 
				 * @param {canvasObject|canvasObject[]} objs
				 * @param {Boolean} [setActive]
				 */
				$scope.api.addObject = function(objs, setActive) {
					if (setActive != false) {
						setActive = true;
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
					$scope.svyServoyapi.apply("canvasObjects");

					if ($scope.handlers.onModified) {
						$scope.handlers.onModified([objs]);
					}
				}
				
				/**
				 * Removes the object with the given ID or the currently selected object from the Canvas
				 * 
				 * @param {String} [id]
				 */
				$scope.api.removeObject = function(id) {
					var objectToRemove = id ? getObjectById(id) : $scope.canvas.getActiveObject();
					if (!objectToRemove) return;
					
					function remove(id) {
						if (id) {
							var objs = $scope.model.canvasObjects;
							for (var i in objs) {
								if (!objs[i]) continue;
								if (objs[i].id == id) {
									$scope.canvas.remove(objectToRemove);
									objs.splice(i, 1);
								}
							}
						}
					}
					
					remove(objectToRemove.id);
					
					//check if in a group
					var nestedObjects = objectToRemove._objects;
					if (nestedObjects && nestedObjects.length > 1) {
						for (var j = 0; j < nestedObjects.length; j++) {
							var id = nestedObjects[j].id;
							if (!id) continue;
							remove(id);
							$scope.canvas.remove(nestedObjects[j]);
						}
					}
					
					$scope.svyServoyapi.apply("canvasObjects");
					
					$scope.canvas.discardActiveObject();
					$scope.canvas.renderAll();
				}
				
				/**
				 * Clears the canvas
				 * 
				 */
				$scope.api.clearCanvas = function() {
					if ($scope.canvas) {
						$scope.canvas.clear();
					}
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
				
				/**
				 * Gets the object selected and calls the callback method
				 * 
				 * @param {Function} callbackMethod
				 */
				$scope.api.getSelectedObject = function(callbackMethod, sel) {

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
						return $window.executeInlineScript(callbackMethod.formname, callbackMethod.script, [os]);
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
								$scope.api.getSelectedObject(callbackMethod, grp)
							}, 250);
					}
					$scope.canvas.discardActiveObject();

					return setTimeout(function() {
							$scope.api.getSelectedObject(callbackMethod, [ao.id])
						}, 250);
				}
				
				/**
				 * (Re-)draws the canvas
				 * 
				 */
				$scope.api.draw = function() {
					var gSize = $scope.model.gridSize;
					$scope.objects = { };
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
						$scope.model.canvasOptions = { };
					}
					$scope.model.canvasOptions['preserveObjectStacking'] = true;
					
					if ($scope.handlers.onRightClick) {
						$scope.model.canvasOptions.fireRightClick = true;
						$scope.model.canvasOptions.stopContextMenu = true;
					}
					
					$scope.canvas = new fabric.Canvas($scope.model.svyMarkupId, $scope.model.canvasOptions);
					
					fabric.Object.prototype.transparentCorners = false;
					$scope.canvas.selection = $scope.model.canvasOptions.selectable;
					
					var gridWidth = document.getElementById($scope.model.svyMarkupId + '-wrapper').clientWidth;
					var gridHeight = document.getElementById($scope.model.svyMarkupId + '-wrapper').clientHeight;

					//setup zoom
					if ($scope.zoom) {
						$scope.canvas.zoomToPoint({ x: $scope.zoomX, y: $scope.zoomY }, $scope.zoom);
					}
					
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
						for (var i = 0; i < (gridSize / gSize); i++) {
							$scope.canvas.add(new fabric.Line([i * gSize, 0, i * gSize, gridSize], {
									id: 'grid',
									stroke: '#ccc',
									selectable: false
								}));
							$scope.canvas.add(new fabric.Line([0, i * gSize, gridSize, i * gSize], {
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
						//						console.log(g[j].id + ' : ' + g[j].objectType);
						//						console.log(g[j]);
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
				
				/**
				 * Rotates the canvas with the given angle
				 * 
				 * @param {Number} angle
				 */
				$scope.api.rotate = function(angle) {
					var group = new fabric.Group($scope.canvas.getObjects())
					group.rotate(angle)
					$scope.canvas.centerObject(group)
					group.setCoords()
					$scope.canvas.renderAll()
				}
				
				/**
				 * Starts animation
				 */
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
						} catch (e) {
						}

					}

					if ($scope.render) return;
					if ($scope.model.canvasOptions.animationSpeed == null || ($scope.model.canvasOptions.animationSpeed < 50))
						$scope.model.canvasOptions.animationSpeed = 50;
					$scope.render = setInterval(render, $scope.model.canvasOptions.animationSpeed)
				}
				
				/**
				 * Stops animation
				 */
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
										top: Math.round(target.top / $scope.model.gridSize) * $scope.model.gridSize,
										left: Math.round(target.left / $scope.model.gridSize) * $scope.model.gridSize,
										bottom: Math.round( (target.top + h) / $scope.model.gridSize) * $scope.model.gridSize,
										right: Math.round( (target.left + w) / $scope.model.gridSize) * $scope.model.gridSize
									},
									threshold = $scope.model.gridSize,
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
									left: Math.round(options.target.left / $scope.model.gridSize) * $scope.model.gridSize,
									top: Math.round(options.target.top / $scope.model.gridSize) * $scope.model.gridSize
								});
							}
							var obj = $scope.canvas.getActiveObject();
							if (!obj) return;
							obj.set({
								hasControls:0,
								opacity: 0.3
							});

							// if ($scope.handlers.onMove) {
							//     $scope.handlers.onMove(obj.id, obj.left, obj.top);
							// }
							
							$scope.canvas.renderAll();
						});
					
					$scope.canvas.on('mouse:wheel', function(opt) {
						if (!$scope.model.canvasOptions.ZoomOnMouseScroll && !$scope.model.canvasOptions.zoomOnMouseScroll) {
							return;
						}
						var delta = opt.e.deltaY;
						var zoom = $scope.canvas.getZoom();
						
//						zoom = zoom + delta / 1000;
						zoom *= Math.pow(0.999, delta);
						if (zoom > 20) zoom = 20;
						if (zoom < 0.01) zoom = 0.01;
						
						$scope.zoomX = opt.e.offsetX;
						$scope.zoomY = opt.e.offsetY;
						$scope.zoom = zoom;
						
						$scope.canvas.zoomToPoint({ x: $scope.zoomX, y: $scope.zoomY }, $scope.zoom);
						
						opt.e.preventDefault();
						opt.e.stopPropagation();
						
						$scope.canvas.renderAll();
					});
					
					$scope.canvas.on('mouse:down', function(opt) {
						var evt = opt.e;
						if (evt.altKey === true) {
							$scope.canvas.selection = false;
							$scope.isDragging = true;
							$scope.lastPosX = evt.clientX;
							$scope.lastPosY = evt.clientY;
						} else if (evt.button === 2 && $scope.handlers.onRightClick) {
							var jsevent = $utils.createJSEvent(evt);
							evt.preventDefault();
							evt.stopPropagation();
							var obj = $scope.canvas.getActiveObject();
							if (!obj) {
								obj = getObjectsFromEvent(opt);
								if (obj) {
									obj = obj[0];
								}
							}
							if (obj) {
								$scope.handlers.onRightClick(jsevent, obj.id, getObjectById(obj.id));
							} else {
								$scope.handlers.onRightClick(jsevent);								
							}
						}
					});	
					
					$scope.canvas.on('mouse:move', function(opt) {
						if ($scope.isDragging) {
							var e = opt.e;
							var vpt = $scope.canvas.viewportTransform;
//							console.warn(vpt)
							vpt[4] += e.clientX - $scope.lastPosX;
							vpt[5] += e.clientY - $scope.lastPosY;
							$scope.canvas.requestRenderAll();
							$scope.lastPosX = e.clientX;
							$scope.lastPosY = e.clientY;
						 }
					});		
					
					$scope.canvas.on('mouse:up', function(evt) {
						if ($scope.isDragging) {
							$scope.canvas.setViewportTransform($scope.canvas.viewportTransform);
							$scope.isDragging = false;
							$scope.canvas.selection = true;
						}
						
						var obj = $scope.canvas.getActiveObject();
						if (!obj) return;
						
						if ($scope.handlers.onDoubleClick) {
							clickTimer = setTimeout(function() {
								if (!preventClick) {
									fireClickHandler(obj);
								}
								preventClick = false;
							}, 200);
						} else {
							fireClickHandler(obj);
						}
					});
							
					function fireClickHandler(obj) {
						if ($scope.handlers.onClick && !$scope.model.canvasOptions.selectable && (typeof obj.id != 'undefined')) {
							$scope.handlers.onClick(obj.id, getObjectById(obj.id));
							//when clicking don't allow overlapping
							$scope.canvas.discardActiveObject();
							$scope.canvas.renderAll();
						}
					}
					
					$scope.canvas.on('mouse:dblclick', function(opt) {
						if ($scope.handlers.onDoubleClick) {
							clearTimeout(clickTimer);
							preventClick = true;
							var evt = opt.e;
							var obj = $scope.canvas.getActiveObject();
							if (!obj) {
								obj = getObjectsFromEvent(opt);
								if (obj) {
									obj = obj[0];
								}
							}
							if (obj) {
								$scope.handlers.onDoubleClick(evt, obj.id, getObjectById(obj.id));
							} else {
								$scope.handlers.onDoubleClick(evt);								
							}
						}
					});
					
					$scope.canvas.on('touch:longpress', function(options) {
							var obj = $scope.canvas.getActiveObject();
							if (!obj) return;
							if ($scope.handlers.onLongPress && !$scope.model.canvasOptions.selectable && (typeof obj.id != 'undefined')) {
								$scope.handlers.onLongPress(obj.id, getObjectById(obj.id));
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

									var co = { };
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
					
					$scope.canvas.on('object:modified', function(evt) {
							if ($scope.handlers.onModified) {
								$scope.handlers.onModified(getObjectsFromEvent(evt));
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