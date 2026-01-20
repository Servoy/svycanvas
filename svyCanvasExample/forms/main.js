/**
 * @properties={typeid:35,uuid:"8D69466A-EEEB-4206-875B-6245A6570EE2",variableType:-4}
 */
var zoom = null;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"4CBC99AB-31CC-45A6-AA54-B9618A3402CD",variableType:8}
 */
var gridSize = 50;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"018C1629-4D37-465B-AB0C-56A95AEF5311",variableType:4}
 */
var snap = 1;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"E84A86D6-9B93-45BE-B591-07DBEF8B48F9"}
 */
var text = 'Some words...of wisdom';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"F2577BB8-3A47-4960-B488-A04D3DC0B493"}
 */
var fontColor = '#ffffff';

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"E5A10D92-9A9C-4194-8047-CBA99AF9987E",variableType:8}
 */
var showGrid = 1;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"2E976457-2EDD-4351-99B7-BC5C4C51DD65",variableType:8}
 */
var editable = 1;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"CACCE753-CF7D-4E6B-B9E9-9A4F486BF71B"}
 */
var shape = 'Rect';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"B22EF27B-D737-45F6-A2C6-B56E0F1F4072"}
 */
var color = '#000000';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"905C03A5-E4BA-4FC9-84D3-CF264D26F743"}
 */
var savedData = '';

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"48EC07EE-AFE6-4E3E-868E-479E64F6FA12",variableType:4}
 */
var currentRotation = 0;

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"798E08C8-3C4C-4E02-AE24-70F41CE0B5BB"}
 */
function onAction$clearCanvas(event) {
	elements.canvas.canvasObjects = null;
	elements.canvas.clearCanvas();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"743F95D5-A512-45E4-8141-795E866724F0"}
 */
function onAction$addObject(event) {
	var id = application.getUUID().toString()
	application.output('generated object with ID' + id);
	var obj = {
		id: id, objectType: shape,
		scaleX: 1, scaleY: 1,
		left: 200, top: 100,
		ctrl:{ mtr : false}
	}
	if (shape == 'Image') {
		obj.mediaName = 'flower.png'
		obj.width = 0;
		obj.height = 0;
		obj.left = 0;
		obj.top = 0;
	} else if (shape == 'Sprite') {
		obj.spriteName = 'sprite.png'
		obj.width = 0;
		obj.height = 0;
		obj.spriteWidth = 50;
		obj.spriteHeight = 72;
		obj.spriteIndex = 0;
		obj.frameTime = 100;
	} else if (shape == 'Ellipse') {
		obj.stroke = color;
		obj.strokeWidth = 3;
		obj.fill = '';
		obj.rx = 100;
		obj.ry = 50;
	} else if (shape == 'Polygon') {
		obj.points = [{ x: 0, y: 100 }, { x: 100, y: 0 }, { x: 0, y: 0 }]
		obj.stroke = color;
		obj.strokeWidth = 3;
		obj.strokeLineJoin = 'bevil'
		obj.fill = '';
		obj.angle = 270
	} else if (shape == 'Path') {
		obj.path = 'M -100 250 a 200 200 0 0 1 400 1';
		obj.fill = color;
		obj.stroke = color;
	} else {
		obj.width = 50;
		obj.height = 50;
		obj.angle = 0
		obj.fontSize = 40;
		obj.text = text;
		obj.textAlign = 'center';
		obj.fontFamily = 'Roboto';
		obj.radius = 50;
		obj.fill = color;
		obj.opacity = 1;
	}
	elements.canvas.addObject(obj, true);
}

/**
 * @properties={typeid:24,uuid:"97788AA2-480F-46FA-AB03-894AFA8BC63B"}
 */
function startAnimation() {
	elements.canvas.startAnimate();
}

/**
 * @properties={typeid:24,uuid:"7FBF1F36-9C12-421E-B29B-7F05B4C107B8"}
 */
function stopAnimation() {
	elements.canvas.stopAnimate();
}

/**

 * @private
 *
 * @properties={typeid:24,uuid:"4808D737-EAA1-471E-8D6B-D58F29A69F63"}
 */
function onClick(id, obj) {
	if (id == 'moveable_object') {
		//setup drag and drop
		//allow selection of an item
		elements.canvas.canvasOptions.selectable = 1;

		//allow selection of just selected item
		var d = new Date()
		d.setMilliseconds(d.getMilliseconds() + 0)
		plugins.scheduler.addJob('disableSelection', d, selectItem, [id])

		return;
	}

	application.output('selected itemID: ' + id);
	plugins.dialogs.showInfoDialog('INFO', 'Selected Item #' + id);
}

/**
 * TODO generated, please specify type and doc for the params
 *
 * @properties={typeid:24,uuid:"C77A9C77-4EC6-4F6C-B434-E76DA10D0AA7"}
 */
function selectItem(id) {
	var ob = elements.canvas.canvasObjects;
	var select = []
	for (var i = 0; i < ob.length; i++) {
		if (ob[i].id != id) {
			//disable selection for non-matching
			ob[i].selectable = false;
		} else {
			select.push(ob[i].id)
		}
	}
	elements.canvas.setSelectedObject(select)
}

/**
 * Handle changed data, return false if the value should not be accepted. In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip.
 *
 * @param {Number} oldValue old value
 * @param {Number} newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *elements
 * @private
 *
 * @properties={typeid:24,uuid:"C3ED9010-8F7E-403F-A490-82D96B999683"}
 */
function onDataChange$allowEdit(oldValue, newValue, event) {
	elements.canvas.canvasOptions.selectable = newValue;
	return true
}

/**
 * Handle changed data, return false if the value should not be accepted. In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip.
 *
 * @param {Number} oldValue old value
 * @param {Number} newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"23E7FD5F-BCD1-4CA9-8C64-2D66073A743A"}
 */
function onDataChange$hideGrid(oldValue, newValue, event) {
	elements.canvas.showGrid = newValue;
	return true;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"6896A728-60E0-431E-AD03-42C7AA848C59"}
 */
function onAction$removeSelectedItem(event) {
	elements.canvas.removeObject(null);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"7AE8970D-D9F0-4C4F-BA13-0777FD24A69E"}
 */
function onAction$copy(event) {
	elements.canvas.copySelectedObject();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"D10BBBD1-E42A-42F0-9503-F25D363E5C57"}
 */
function onAction$update(event) {
	elements.canvas.getSelectedObject(selectedCB);
}

/**
 * @properties={typeid:24,uuid:"DCD6FA92-AE1F-45BA-8632-E6399F9B0962"}
 */
function selectedCB(so) {
	for (var i = 0; i < so.length; i++) {
		so[i].fill = color;
		so[i].objectType = shape;
		so[i].text = text;
		so[i].radius = 25;
		so[i].fontFamily = 'Roboto';
	}
	elements.canvas.updateObject(so, true);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"88EB32CA-0C89-469E-A2FE-30E18BD7A9B2"}
 */
function onAction$loadPreset(event) {	
	elements.canvas.loadCanvas(savedData);

}

/**
 * @param {String} data
 * @properties={typeid:24,uuid:"F9FAECE9-584D-4A13-A2E9-C8E21DEBA29C"}
 */
function saveCB(data) {
	savedData = data;
	application.output(savedData);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"D8DB9D54-B58C-456E-BB93-6119BE0D8B8B"}
 */
function onAction$savePreset(event) {
	elements.canvas.saveCanvas(saveCB);
}

/**
 * Handle changed data, return false if the value should not be accepted. In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip.
 *
 * @param {Number} oldValue old value
 * @param {Number} newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"19728ECD-71AD-4F86-8252-F65BB713B238"}
 */
function onDataChange$snap(oldValue, newValue, event) {
	elements.canvas.snapToGrid = newValue;
	return true
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"24C12DC7-ADF9-428E-B024-E126FB1C1549"}
 */
function onAction$selectItem(event) {
	var o = elements.canvas.canvasObjects;
	var selection = []
	for (var i = 0; i < o.length; i++) {
		if (o[i])
			selection.push(o[i].id);
	}
	elements.canvas.setSelectedObject(selection);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"57E1377B-DB48-4482-B5E1-0F1FD9F0B136"}
 */
function onAction$createRectTextBox(event) {
	var groupedObject = {
		id: application.getUUID().toString(), objectType: 'Group',
		objects: [{
			angle: 0, fontSize: 20, text: '', fontFamily: 'Roboto', scaleX: 1, scaleY: 1,
			left: 200, top: 100, width: 300, height: 200, radius: 50, fill: color, opacity: 1, objectType: 'Rect'			
		}, {
			angle: 0, fontSize: 30, text: text, fontFamily: 'Roboto', scaleX: 1, scaleY: 1,
			left: 250, top: 150, width: 200, height: 50, radius: 50, fill: 'white', opacity: 1, objectType: 'Text', textAlign: 'center'			
		}]
	}

	//	var groupedObject = {
	//		id: application.getUUID().toString(), objectType: 'Group',
	//		left: 0,
	//		flipX:true,left:-205, //flip and reposition as needed.
	//		objects: [{
	//			scaleX: 1, scaleY: 1, fill: 'white', opacity: 1, objectType: 'Path', width: 50,
	//			path: [["M", -40, 215], ["a", 200, 200, 0, 0, 1, 400, 0]], stroke: "black", strokeWidth: 10
	//		}
	//		,{
	//			scaleX: 1, scaleY: 1, left: -35, top: 205, objectType: 'Line',
	//			path: [0, 0, 210, 0], stroke: "black", strokeWidth: 10
	//		},
	//		{
	//			scaleX: 1, scaleY: 1, left: 155, top: 10, objectType: 'Line',
	//			path: [0, 0, 0, 200], stroke: "black", strokeWidth: 10
	//		},
	//		{
	//			scaleX: 1, scaleY: 1, left: 163.5, top: 9, width: 210, height: 205.5, radius: 50, fill: 'white', opacity: 1, objectType: 'Rect'
	//		},
	//		]
	//	}

	elements.canvas.addObject([groupedObject]);
}

/**
 * Handle changed data, return false if the value should not be accepted. In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip.
 *
 * @param {Number} oldValue old value
 * @param {Number} newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"66AAA0F9-60C7-43BC-A69E-4D270B72AAFA"}
 */
function onDataChange(oldValue, newValue, event) {
	elements.canvas.gridSize = newValue;
	return true
}

/**
 * Callback method when form is (re)loaded.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"7E76F231-22EF-423A-8926-9366E55E0030"}
 */
function onLoad(event) {
	elements.canvas.gridSize = gridSize;
	elements.canvas.showGrid = showGrid;
	elements.canvas.snapToGrid = snap;
	//allow user to edit
	elements.canvas.canvasOptions.selectable = editable;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"6AF0BD59-C390-4F8F-9E06-93A32001A4C7"}
 */
function onAction$ZoomOnSelection(event) {
	elements.canvas.getSelectedObject(cbZoom);
}

/**
 * @param o
 *
 * @properties={typeid:24,uuid:"06D14A08-1038-4F40-9940-16E8D8A90142"}
 */
function cbZoom(o) {
	elements.canvas.ZoomOnPoint(o[0].x, o[0].y, 1.5)
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"7098A246-5056-4E41-9372-7DDCA305015A"}
 */
function onAction$resetZoom(event) {
	elements.canvas.ZoomOnPoint(0, 0, 1)
}

/**

 * @private
 *
 * @properties={typeid:24,uuid:"BCEEEAB9-D16F-4E9F-83FA-F26487FADD8C"}
 */
function onLongPress(id, obj) {
	application.output('long pressing on ' + id);

}

/**
 * Perform the element onclick action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"B2BABCF1-5291-484B-A7B8-D3C64C62C2D3"}
 */
function onAction$rotate(event) {
	currentRotation += 90;
	elements.canvas.rotate(currentRotation);
}

/**

 * @private
 *
 * @properties={typeid:24,uuid:"D8540DF2-A64C-43F2-8C74-9AB99EC33645"}
 */
function onModified() {
	elements.canvas.getSelectedObject(objInfo)
}

/**
 * TODO generated, please specify type and doc for the params
 * @param objects
 *
 * @properties={typeid:24,uuid:"4D0D0917-EC34-46C5-946C-D9A242183176"}
 */
function onModified1(objects) {
	var objIds = objects.map(function getId(item) {
		return item.id;
	})
	application.output('Objects modified: ' + objIds.join('\n'))
	elements.canvas.getSelectedObject(objInfo)
}
 
/**
 * @param {{id:String}} objs
 *
 * @properties={typeid:24,uuid:"B65DD271-D7EA-41CF-9007-BA05DE550346"}
 */
function objInfo(objs) {
	//possible target locations for moving the object
	var targets = []
	targets.push({ top: 200, left: 450 }, { top: 200, left: 100 })

	/** @type {{top:Number,left:Number,id:String}} */
	var d = objs[0];
	application.output(objs)
	if (!d || d.id != 'moveable_object') return;
	application.output(d.top + ',' + d.left);

	for (var i = 0; i < targets.length; i++) {
		//if we move back to source, don't do anything.
		if (d.top == 200 && d.left == 100) {
			onAction$dragdrop(null)
			elements.canvas.canvasOptions.selectable = 0;
			return;
		}

		if (targets[i].top == d.top && targets[i].left == d.left) {
			//move was successful
			plugins.dialogs.showInfoDialog('INFO', 'Move successful');
			elements.canvas.canvasOptions.selectable = 0;
			return;
		}
	}

	//move was unsuccessful
	//so reset position of elements
	onAction$dragdrop(null)
	plugins.dialogs.showInfoDialog('INFO', 'Move Failed')
	elements.canvas.canvasOptions.selectable = 0;

}

/**
 * Perform the element onclick action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"FF5FFDF5-90AF-43C6-984C-5B91EBE84D74"}
 */
function onAction$dragdrop(event) {
	var preset = [{
			"id": "Source", "angle": 0, "fontSize": 40, "text": "Some words...of wisdom",
			"fontFamily": "Roboto", "scaleX": 2.9411764705882346, "scaleY": 2.9411764705882346,
			"left": 100.00000000000001, "top": 200, "width": 50, "height": 50, "radius": 50,
			"fill": "#000000", "opacity": 1, "spriteWidth": 50, "spriteHeight": 72, "spriteIndex": 0,
			"frameTime": 100, "objectType": "Rect", "rx": 0, "ry": 0, "textAlign": "center", "selectable": true,
			"objects": null
		}, {
			"id": "Source_text",
			"angle": 0, "fontSize": 40, "text": "Source", "fontFamily": "Roboto",
			"scaleX": 0.8518303152059465, "scaleY": 1, "left": 100.00000000000003,
			"top": 150, "width": 176.09140849106146, "height": 45.199999999999996,
			"radius": 50, "fill": "#000000", "opacity": 1, "spriteWidth": 50, "spriteHeight": 72,
			"spriteIndex": 0, "frameTime": 100, "objectType": "Text", "rx": 0, "ry": 0,
			"textAlign": "center", "selectable": true, "objects": null
		}, {
			"id": "Target",
			"angle": 0, "fontSize": 8, "text": "", "fontFamily": "Times New Roman",
			"scaleX": 2.94, "scaleY": 2.94, "left": 450, "top": 200.00000000000003,
			"width": 50, "height": 50, "radius": 0, "fill": "#000000", "opacity": 1,
			"spriteWidth": 50, "spriteHeight": 72, "spriteIndex": 0, "frameTime": 100,
			"objectType": "Rect", "rx": 0, "ry": 0, "textAlign": "left", "selectable": true,
			"objects": null
		}, {
			"id": "Target_label", "angle": 0, "fontSize": 40, "text": "Target",
			"fontFamily": "Roboto", "scaleX": 0.85, "scaleY": 1, "left": 450, "top": 150,
			"width": 176.09, "height": 45.199999999999996, "radius": 0, "fill": "#000000",
			"opacity": 1, "spriteWidth": 50, "spriteHeight": 72, "spriteIndex": 0, "frameTime": 100,
			"objectType": "Text", "rx": 0, "ry": 0, "textAlign": "center", "selectable": true, "objects": null
		}, {
			"id": "moveable_object", "angle": 0, "fontSize": 40, "scaleX": 1.5, "scaleY": 1.5, "left": 100,
			"top": 200, "width": 100, "height": 100, "radius": 50, "fill": "#FF0000", "opacity": 1,
			"spriteWidth": 50, "spriteHeight": 72, "spriteIndex": 0, "frameTime": 100,
			"objectType": "Circle", "rx": 0, "ry": 0, "textAlign": "center", "selectable": true
		}]

	elements.canvas.loadCanvas(JSON.stringify(preset))
	elements.canvas.canvasOptions.selectable = 0;
}

/**
 * @properties={typeid:24,uuid:"45221D84-03ED-4419-A229-8A890BAFEB9A"}
 */
function onAction$Mirror() {
	elements.canvas.getSelectedObject(selectedCBMirror);
}

/**
 * @properties={typeid:24,uuid:"2A77A2B0-0E25-4A6E-8273-1250362437F8"}
 */
function selectedCBMirror(so) {
	for (var i = 0; i < so.length; i++) {
		if (!so[i].flipX) {
			so[i].flipX = 1
		} else {
			so[i].flipX = 0
		}
	}
	elements.canvas.updateObject(so, true);
}

/**
 * Perform the element onclick action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"3CFB170E-6EB9-4249-9535-04E104C91698"}
 */
function onAction$saveImage(event) {
	elements.canvas.saveAsImage(imgCB)
}

/**
 * TODO generated, please specify type and doc for the params
 * @param data
 *
 * @properties={typeid:24,uuid:"A1B902A5-FA2C-4AC8-B2F1-F60E88F91555"}
 */
function imgCB(data) {
	application.output(data);
}
/**
 * Perform the element onclick action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"99E67A10-27B9-4408-8CCE-AE1AA614105B"}
 */
function onAction$printCanvas(event) {	
	elements.canvas.printCanvas(2550);	
}

/**

 * @private
 *
 * @properties={typeid:24,uuid:"947554FA-48AF-494D-A6CA-74AD0C56C55A"}
 */
function onReady() {
	// add images to image loader
	elements.canvas.imagesLoader = ['flower.png','kiwi.svg','sprite.png'];
}

/**

 * @private
 *
 * @properties={typeid:24,uuid:"BEB8FE64-577C-4260-8AE4-2D5E7EE08D84"}
 */
function afterRender() {
	application.output('after render')
}

/**
 * @properties={typeid:24,uuid:"08A6F41D-619E-4F79-A1C1-36D519CD1658"}
 */
function saveAsImage() {
	elements.canvas.saveAsImage(saveAsImageCallback)
}

/**
 * TODO generated, please specify type and doc for the params
 * @param url
 *
 *
 * @properties={typeid:24,uuid:"FCECC3D0-38D9-4F8D-8352-E7478295F7EC"}
 */
function saveAsImageCallback(url) {
	application.output(url);
}

/**
 *
 * @properties={typeid:24,uuid:"0642C008-021D-4245-A597-AC9465B61360"}
 */
function getImage() {
	application.output(elements.canvas.getImageUrl())
}

/**
 * @param {JSEvent} event
 * @param {string} objectId
 * @param {CustomType<svycanvas-Canvas.canvasObject>} object
 *
 * @private
 *
 *
 * @properties={typeid:24,uuid:"1EA18C5A-DBBD-4CF3-B872-3EC26C1B4C9D"}
 */
function onRightClick(event, objectId, object) {
	application.output(objectId);	
	var popup = plugins.window.createPopupMenu();
	popup.addMenuItem('Hello');
	popup.addMenuItem('World');
	popup.addMenuItem('Foo');
	popup.addMenuItem('Bar');
	popup.show(event.getX() + 1, event.getY());
}

/**
 * @param {JSEvent} event
 * @param {string} objectId
 * @param {CustomType<svycanvas-Canvas.canvasObject>} object
 *
 * @private
 *
 *
 * @properties={typeid:24,uuid:"668E0468-E509-484E-A0EC-876A0C998018"}
 */
function onDoubleClick(event, objectId, object) {
	application.output(event);
	application.output(objectId);
}
