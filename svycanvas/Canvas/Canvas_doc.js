/**
 * Array of canvas objects to be rendered on the canvas.
 */
var canvasObjects;

/**
 * Flag to indicate whether the grid background should be displayed.
 */
var showGrid;

/**
 * Flag to enable snapping canvas objects to the grid when moved or resized.
 */
var snapToGrid;

/**
 * The size, in pixels, of each grid cell used for drawing and snapping.
 */
var gridSize;

/**
 * Configuration options for the canvas rendering engine.
 */
var canvasOptions;

/**
 * Array of media references for images that are preloaded for use in canvas objects.
 */
var imagesLoader;

/**
 * CSS class applied to the canvas container for custom styling.
 */
var styleClass;

var handlers = {
    /**
     * Called when a canvas object is clicked.
     */
    onClick: function() {},

    /**
     * Called when a canvas object is long-pressed (touch event).
     */
    onLongPress: function() {},

    /**
     * Called when a canvas object is modified (e.g., moved, scaled, or rotated).
     */
    onModified: function() {},

    /**
     * Called when the canvas is fully initialized and ready for interaction.
     */
    onReady: function() {},

    /**
     * Called after the canvas has finished rendering all objects.
     */
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
 * @param {Object} objs An array of canvas objects to be added.
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

    /**
     * Configuration options for the canvas.
     */
    canvasOptions: {
        /**
         * Determines if canvas objects are selectable.
         */
        selectable: null,

        /**
         * If true, disables target finding for canvas objects to improve performance.
         */
        skipTargetFind: null,

        /**
         * Indicates whether canvas objects display a rotation control handle.
         */
        hasRotatingPoint: null,

        /**
         * Specifies if the canvas should automatically re-render when objects are added or removed.
         */
        renderOnAddRemove: null,

        /**
         * If true, objects outside the visible canvas area are not rendered.
         */
        skipOffscreen: null,

        /**
         * Enables zooming via mouse scroll when true.
         */
        ZoomOnMouseScroll: null,

        /**
         * Sets the speed of canvas animations in milliseconds.
         */
        animationSpeed: null,
    },


    /**
     * Definition of a canvas object.
     */
    canvasObject: {
        /**
         * The type of canvas object (e.g., 'Circle', 'Rect', 'Triangle', etc.).
         */
        objectType: null,

        /**
         * For grouped objects, holds an array of child objects.
         */
        objects: null,

        /**
         * The fill color of the canvas object.
         */
        fill: null,

        /**
         * The opacity level of the canvas object.
         */
        opacity: null,

        /**
         * The width of the canvas object.
         */
        width: null,

        /**
         * The height of the canvas object.
         */
        height: null,

        /**
         * For circular objects, the radius.
         */
        radius: null,

        /**
         * The x-coordinate position of the canvas object.
         */
        left: null,

        /**
         * The y-coordinate position of the canvas object.
         */
        top: null,

        /**
         * The horizontal corner radius for rounded rectangles.
         */
        rx: null,

        /**
         * The vertical corner radius for rounded rectangles.
         */
        ry: null,

        /**
         * The stroke color of the canvas object.
         */
        stroke: null,

        /**
         * The width of the stroke (outline) of the canvas object.
         */
        strokeWidth: null,

        /**
         * The path data for path-based objects.
         */
        path: null,

        /**
         * Array of points defining a polygon or polyline.
         */
        points: null,

        /**
         * A unique identifier for the canvas object.
         */
        id: null,

        /**
         * The horizontal scaling factor for the object.
         */
        scaleX: null,

        /**
         * The vertical scaling factor for the object.
         */
        scaleY: null,

        /**
         * For text objects, the text content.
         */
        text: null,

        /**
         * For text objects, the text alignment (e.g., left, center, right).
         */
        textAlign: null,

        /**
         * For text objects, the font size.
         */
        fontSize: null,

        /**
         * For text objects, the font family.
         */
        fontFamily: null,

        /**
         * The rotation angle of the canvas object in degrees.
         */
        angle: null,

        /**
         * The style of the line join for the stroke (e.g., miter, round, bevel).
         */
        strokeLineJoin: null,

        /**
         * For image objects, the name of the media resource.
         */
        mediaName: null,

        /**
         * For sprite objects, the name of the sprite sheet.
         */
        spriteName: null,

        /**
         * The width of the sprite frame.
         */
        spriteWidth: null,

        /**
         * The height of the sprite frame.
         */
        spriteHeight: null,

        /**
         * The current index of the sprite frame.
         */
        spriteIndex: null,

        /**
         * The time (in milliseconds) for each frame in sprite animation.
         */
        frameTime: null,

        /**
         * If true, the object is flipped horizontally.
         */
        flipX: null,

        /**
         * If true, the object is flipped vertically.
         */
        flipY: null,

        /**
         * Determines if the object is selectable.
         */
        selectable: null,

        /**
         * Holds control data for the object.
         */
        ctrl: null,

        /**
         * Contains state information for the canvas object.
         */
        state: null,

        /**
         * An auxiliary property for state management.
         */
        stateHolder: null,

        /**
         * A generic property to store custom data related to the canvas object.
         */
        custom_data: null,
    }
}
