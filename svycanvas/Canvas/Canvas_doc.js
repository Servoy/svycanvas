/**
 * Brings a specific element given it's ID, to the front layer of the canvas 
 * 
 * @param {string} idx
 */
function bringToFront(idx) {
}

/**
 * clones the currently selected element. 
 */
function copySelectedObject() {
}

/**
 * Save the canvas as an image.  
 * The callback has a single parameter 
 * which contains the base64 data of the canvas.  
 * 
 * @param {Function} imgCB
 */
function saveAsImage(imgCB) {
}

/**
 * Save the canvas as a JSON object.  
 * The callback has a single parameter which contains the JSON object.   
 * This JSON object can be used with the loadCanvas method.
 * @param {Function} saveCB
 */
function saveCanvas(saveCB) {
}

/**
 * Zooms into the canvas given the x/y coords and a zoom level.  
 * @param {Number} x
 * @param {Number} y
 * @param {Number} zoom
 */
function ZoomOnPoint(x, y, zoom) {
}

/**
 * Update a specific canvas object and optionally select it  
 * @param {Object} obj 
 * @param {Boolean} setItemActive
 */
function updateObject(obj, setItemActive) {
}

/**
 * Loads the canvas from a JSON object  
 * @param {Object} data
 */
function loadCanvas(data) {
}

/**
 * Print the current canvas view (TING only).  Can use an optional DPI resolution for higher quality prints.
 * @param {Number} resolutionWidth  
 */
function printCanvas(resolutionWidth) {
}

/**
 * Add one or more canvas objects and optionally select it. 
 * If given more than one item in the objs array, the elements will be grouped as a single entity. 
 * @param {Array<Object>} objs 
 * @param {Boolean} setActive
 */
function addObject(objs, setActive) {
}

/**
 * Remove an canvas object given it's ID.
 * @param {String} idx
 */
function removeObject(idx) {
}

/**
 * Clear the canvas and remove all objects
 */
function clearCanvas() {
}

/**
 * Select one or more objects in the canvas given it's ID.
 * @param {Array<String>} ids 
 */
function setSelectedObject(ids) {
}

/**
 * Get the selected object
 * @param {Function} cb 
 */
function getSelectedObject(cb) {
}

/**
 * Rotate the canvas at a specific angle
 * @param {Number} angle 
 */
function rotate(angle) {
}

/**
 * Start animating sprites
 */
function startAnimate() {
}
/**
 * Stop animating sprites
 */
function stopAnimate() {
}
