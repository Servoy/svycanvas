
/**
 * Callback method for when solution is opened.
 * When deeplinking into solutions, the argument part of the deeplink url will be passed in as the first argument
 * All query parameters + the argument of the deeplink url will be passed in as the second argument
 * For more information on deeplinking, see the chapters on the different Clients in the Deployment Guide.
 *
 * @param {String} arg startup argument part of the deeplink url with which the Client was started
 * @param {Object<Array<String>>} queryParams all query parameters of the deeplink url with which the Client was started
 *
 * @properties={typeid:24,uuid:"00C012BB-D15C-4C02-AAA5-3B74B3C9B09B"}
 */
function onSolutionOpen(arg, queryParams) {
	plugins.ngclientutils.setViewportMetaDefaultForMobileAwareSites();
}
