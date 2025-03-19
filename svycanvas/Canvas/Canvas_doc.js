var canvasObjects;

var showGrid;

var snapToGrid;

var gridSize;

var canvasOptions;

var imagesLoader;

var styleClass;


var handlers = {
    onClick: function() {},

    onLongPress: function() {},

    onModified: function() {},

    onReady: function() {},

    afterRender: function() {}
};

/**
 * Brings a specific element given it's ID, to the front layer of the canvas 
 * 
 * @param {String} id The ID of the element to bring to the front layer of the canvas.
 */
function bringToFront(id) {
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
 * @param {Function} imgCB A callback function that receives the base64-encoded image data of the canvas.
 */
function saveAsImage(imgCB) {
}

/**
 * Save the canvas as a JSON object.  
 * The callback has a single parameter which contains the JSON object.   
 * This JSON object can be used with the loadCanvas method.
 * 
 * @param {Function} saveCB A callback function that receives the serialized JSON object representing the canvas.
 */
function saveCanvas(saveCB) {
}

/**
 * Zooms into the canvas given the x/y coords and a zoom level.  
 * @param {Number} x The x-coordinate to center the zoom on.
 * @param {Number} y The y-coordinate to center the zoom on.
 * @param {Number} zoom The zoom level to apply to the canvas.
 */
function ZoomOnPoint(x, y, zoom) {
}

/**
 * Update a specific canvas object and optionally select it  
 * @param {Object} obj The canvas object to update with new properties or modifications.
 * @param {Boolean} selectActiveItems If true, the updated object will be selected as the active item.
 */
function updateObject(obj, selectActiveItems) {
}

/**
 * Loads the canvas from a JSON object  
 * @param {String} data The JSON string containing the canvas structure and properties to be loaded.
 */
function loadCanvas(data) {
}

/**
 * Print the current canvas view (TING only).  Can use an optional DPI resolution for higher quality prints.
 * 
 * @param {Number} resolutionWidth The optional DPI resolution width for higher quality prints.
 */
function printCanvas(resolutionWidth) {
}

/**
 * Add one or more canvas objects and optionally select it. 
 * If given more than one item in the objs array, the elements will be grouped as a single entity. 
 * 
 * @param {Array<Object>} objs An array of canvas objects to be added.
 * @param {Boolean} [setActive] If true, the added object(s) will be selected as the active item.
 */
function addObject(objs, setActive) {
}

/**
 * Remove an canvas object given it's ID.
 * 
 * @param {String} id The ID of the canvas object to be removed.
 */
function removeObject(id) {
}

/**
 * Clear the canvas and remove all objects
 */
function clearCanvas() {
}

/**
 * Select one or more objects in the canvas given it's ID.
 * 
 * @param {Array<String>} ids An array of object IDs to be selected on the canvas.
 */
function setSelectedObject(ids) {
}

/**
 * Get the selected object
 * 
 * @param {Function} saveCB A callback function that receives the selected canvas object.
 */
function getSelectedObject(cb) {
}

/**
 * Rotate the canvas at a specific angle
 * 
 * @param {Number} angle The angle, in degrees, to rotate the canvas.
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


var svy_types = {

    canvasOptions: {

        selectable : null,

        skipTargetFind : null,

        hasRotatingPoint : null,

        renderOnAddRemove : null,

        skipOffscreen : null,

        ZoomOnMouseScroll : null,

        animationSpeed : null,

    },

    canvasObject: {

        objectType : null,

        objects : null,

        fill : null,

        opacity : null,

        width : null,

        height : null,

        radius : null,

        left : null,

        top : null,

        rx : null,

        ry : null,

        stroke : null,

        strokeWidth : null,

        path : null,

        points : null,

        id : null,

        scaleX : null,

        scaleY : null,

        text : null,

        textAlign : null,

        fontSize : null,

        fontFamily : null,

        angle : null,

        strokeLineJoin : null,

        mediaName : null,

        spriteName : null,

        spriteWidth : null,

        spriteHeight : null,

        spriteIndex : null,

        frameTime : null,

        flipX : null,

        flipY : null,

        selectable : null,

        ctrl : null,

        state : null,

        stateHolder : null,

        custom_data : null,

    }
}
