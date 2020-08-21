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
		left: 200, top: 100
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
	application.output('selected itemID: ' + id);
	plugins.dialogs.showInfoDialog('INFO', 'Selected Item #' + id);
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

	elements.canvas.addObject(groupedObject);
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
