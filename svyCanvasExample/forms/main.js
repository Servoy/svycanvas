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
var text = 'Some words...';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"F2577BB8-3A47-4960-B488-A04D3DC0B493"}
 */
var fontColor = 'white';

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
var color = 'black';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"905C03A5-E4BA-4FC9-84D3-CF264D26F743"}
 */
var savedData = '';

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
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"A78FA911-2544-45D9-BBC3-A1C6138F46EE"}
 */
function onAction$addObject(event) {
	var id = application.getUUID().toString()
	application.output('generated object with ID' + id);
	elements.canvas.addObject({
		id: id, angle: 0, fontSize: 8, text: text,
		fontFamily: 'Roboto', scaleX: 1, scaleY: 1, x: 200, y: 100, width: 50,
		height: 50, radius: 50, fill: color, opacity: 1, objectType: shape,
		mediaName: 'flower.png'
	});
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
	elements.canvas.updateObject(so,true);
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
	var objects = [{
			id: application.getUUID().toString(), angle: 0, fontSize: 8, text: text, fontFamily: 'Roboto', scaleX: 1, scaleY: 1,
			x: 200, y: 100, width: 300, height: 200, radius: 50, fill: color, opacity: 1, objectType: 'Rect'
		}, {
			id: application.getUUID().toString(), angle: 0, fontSize: 8, text: text, fontFamily: 'Roboto', scaleX: 1, scaleY: 1,
			x: 200, y: 100, width: 50, height: 50, radius: 50, fill: 'white', opacity: 1, objectType: 'Text'
		}]
	elements.canvas.addObject(objects);
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