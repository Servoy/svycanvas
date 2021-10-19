/**
 * Creates a new canvasObject
 * 
 * @param {String} id
 * @param {String} objectType
 * 
 * @return {CustomType<svycanvas-Canvas.canvasObject>}
 */
$scope.api.createObject = function(id, objectType) {
	return {
		id: id,
		objectType: objectType
	}
}

/**
 * Loads the canvas from the given JSON
 * 
 * @param {string} canvasJson
 * 
 * @deprecated use restoreCanvasState instead
 */
$scope.api.loadCanvas = function(canvasJson) {
	if (!canvasJson || (canvasJson.length < 1)) return;
	$scope.model.canvasObjects = JSON.parse(canvasJson);
}

/**
 * Loads the canvas from the given JSON
 * 
 * @param {string} canvasJson
 */
$scope.api.restoreCanvasState = function(canvasJson) {
	if (!canvasJson || (canvasJson.length < 1)) return;
	$scope.model.canvasObjects = JSON.parse(canvasJson);
}

/**
 * Loads the canvas from the given JSON
 * 
 * @param {string} canvasJson
 */
$scope.api.getCanvasState = function(canvasJson) {
	if (!$scope.model.canvasObjects) return null;
	//create js Array from Rhino object
	var result = $scope.model.canvasObjects.map(function getItem(item) {
		return item;
	})
	return JSON.stringify(result);
}