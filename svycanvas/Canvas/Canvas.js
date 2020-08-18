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
					selectable: null
				}

				$scope.isReady = false;
				$scope.canvas = null;
				$scope.objects = { };
				$scope.images = { };
				$scope.zoom = null;
				$scope.zoomX = null;
				$scope.zoomY = null;
				if (!$scope.model.canvasObjects) {
					$scope.model.canvasObjects = [];
				}

				window.cancelRequestAnimFrame = (function() {
					return window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout
				})();

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
								$scope.api.draw();
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

					var o = $scope.model.canvasObjects;
					if (!obj) return;
					//					if this is a grouping
					if (obj._objects) {
						obj.clone(function(clone) {
							//							console.log(obj._objects[0].left)
							//							console.log(clone._objects[0].left)
							//							if (generate) {
							//								clone.set({ left: ($scope.canvas.width / 2), top: ($scope.canvas.height / 2) });
							//							}
							clone.destroy();
							var ob = clone._objects;
							for (var i = 0; i < ob.length; i++) {
								cloneAndSave(ob[i]);
							}
						});
					} else {
						for (var i in o) {
							if (!o[i]) continue;
							if (o[i].id == obj.id) {
								for (var j in defObj) {
									if (j != 'id')
										o[i][j] = obj[j]
									//console.log('updating ' + j + ' of ' + o[i][j] + ' to ' + obj[j])
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
											for (var k in defObj) {
												if (k != 'id')
													o[i][k] = oi[j][k]
											}

											if (typeof oi[j].objectType == 'undefined') {
												o[i].objectType = upperCaseFirstLetter(oi[j].type);
												if (o[i].objectType === "Textbox") {
													o[i].objectType = "Text";
												}
											}

											if (oi[j].src) {
												o[i].mediaName = oi[j].src.split('/')[6].split('?')[0];
												o[i].spriteName = oi[j].src.split('/')[6].split('?')[0];
											}

										}
									}
								}
								$scope.svyServoyapi.apply("canvasObjects");
							}, ['id']);
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

				function createObject(type, g) {
					//					 console.log('create object : ' + type);
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
					if (item) {
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
					var tbc = $scope.canvas.getActiveObject()
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
					var obj = $scope.canvas.getActiveObject();
					//if grouped
					if (obj && obj._objects) {
						for (var i in obj._objects) {
							if (!$scope.objects[obj._objects[i].id]) {
								//								$scope.canvas.discardActiveObject();
								return setTimeout(function() {
										$scope.api.saveCanvas(cb);
									}, 250);
							}
						}
					} else if (obj && !$scope.objects[obj.id]) {
						//						$scope.canvas.discardActiveObject();
						return setTimeout(function() {
								$scope.api.saveCanvas(cb);
							}, 250);
					}
					$window.executeInlineScript(cb.formname, cb.script, [JSON.stringify($scope.model.canvasObjects)]);
				}
				$scope.api.ZoomOnPoint = function(x, y, zoom) {
					$scope.zoomX = x;
					$scope.zoomX = y;
					$scope.zoom = zoom;
					$scope.api.draw();
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
				$scope.api.addObject = function(objs, setActive) {
					if (setActive != false) {
						setActive = true;
					}
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
					if (!setActive) {
						$scope.canvas.discardActiveObject();
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
					$scope.api.draw();
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
					$scope.canvas = new fabric.Canvas($scope.model.svyMarkupId, $scope.model.canvasOptions);
					fabric.Object.prototype.transparentCorners = false;
					$scope.canvas.selection = $scope.model.canvasOptions.selectable;
					var gridWidth = document.getElementById($scope.model.svyMarkupId + '-wrapper').clientWidth;
					var gridHeight = document.getElementById($scope.model.svyMarkupId + '-wrapper').clientHeight;

					//setup zoom
					if ($scope.zoom)
						$scope.canvas.zoomToPoint({ x: $scope.zoomX, y: $scope.zoomY }, $scope.zoom);

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
						//						console.log(g[j].id + ' : ' + g[j].objectType);
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

				}

				$scope.api.rotate = function(angle) {
					var group = new fabric.Group($scope.canvas.getObjects())
					group.rotate(angle)
					$scope.canvas.centerObject(group)
					group.setCoords()
					$scope.canvas.renderAll()
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
						} catch (e) {
						}

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
										bottom: Math.round( (target.top + h) / grid) * grid,
										right: Math.round( (target.left + w) / grid) * grid
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
							$scope.api.draw();
							opt.e.preventDefault();
							opt.e.stopPropagation();
						});
					$scope.canvas.on('mouse:up', function(options) {
							var obj = $scope.canvas.getActiveObject();
							if (!obj) return;
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
							setTimeout(function() {
									if (!$scope.canvas.getActiveObject()) {
										// console.log('no selection');
										//save canvas to datamodel;
										var o = $scope.canvas.getObjects();

										for (var i = 0; i < o.length; i++) {
											if (typeof o[i].id == 'undefined') continue;
											if (o[i].id == 'grid') continue;

											if (!$scope.objects[o[i].id]) {
												if (o[i].type === "textbox") {
													o[i].type = "Text";
												}

												var objectType = o[i].type.charAt(0).toUpperCase() + o[i].type.slice(1);
												var mediaName = o[i].mediaName;
												var spriteName = o[i].spriteName;

												if (o[i].src) {
													mediaName = o[i].src.split('/')[6].split('?')[0];
													spriteName = o[i].src.split('/')[6].split('?')[0];
												}

												var oo = { }
												for (var k in defObj) {
													oo[k] = o[i][k] == null ? defObj[k] : o[i][k];
												}

												oo['objectType'] = objectType;
												oo['mediaName'] = mediaName;
												oo['spriteName'] = spriteName;
												if (!$scope.model.canvasObjects) {
													$scope.model.canvasObjects = [];
												}
												$scope.model.canvasObjects.push(oo);
												$scope.objects[o[i].id] = oo;
											}
										}
										if (o.length > 0) {
											//											 console.log($scope.model.canvasObjects);
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
					$scope.canvas.on('mouse:over', function(e) {
							if (!$scope.model.canvasOptions.selectable) {
								if (e.target)
									e.target.hoverCursor = 'pointer';
							}

						});

				}
				window.addEventListener("resize", $scope.api.draw);
				setTimeout(loadImg, 0);
				setTimeout($scope.api.draw, 0);
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