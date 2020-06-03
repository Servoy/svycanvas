{
	"name": "svycanvas-Canvas",
	"displayName": "Canvas",
	"categoryName": "Visualization",
	"version": 1,
	"icon": "svycanvas/Canvas/icon.png",
	"definition": "svycanvas/Canvas/Canvas.js",
	"libraries": 
	[
		{
			"name": "Fabric.js",
			"version": "3.6.3",
			"url": "svycanvas/Canvas/fabric.min.js",
			"mimetype": "text/javascript"
		},
		{
			"name": "Sprite.class.js",
			"version": "1.0.0",
			"url": "svycanvas/Canvas/sprite.class.js",
			"mimetype": "text/javascript"
		}
	],

	"model": 
	{
		"canvasObjects": {"type": "canvasObject[]","pushToServer": "allow"},
		"showGrid": {"type": "int","values": [{"Yes": 1},{"No": 0}],"default": 0},
		"snapToGrid": {"type": "int","values": [{"Yes": 1},{"No": 0}],"default": 0},
		"gridSize":{"type": "int","default": 10},
		"canvasOptions": {"type": "canvasOptions"},
		"imagesLoader": {"type": "media[]"},
		"styleClass": {"type":"styleclass"}
	},

	"types": 
	{
		"canvasOptions": 
		{
			"selectable": {"type": "int","values": [{"Yes": 1},{"No": 0}],"default": 1},
			"skipTargetFind": {"type": "int","values": [{"Yes": 1},{"No": 0}],"default": 0},
			"hasRotatingPoint": {"type": "int","values": [{"Yes": 1},{"No": 0}],"default": 1},
			"renderOnAddRemove": {"type": "int","values": [{"Yes": 1},{"No": 0}],"default": 0},
			"skipOffscreen": {"type": "int","values": [{"Yes": 1},{"No": 0}],"default": 1},
			"ZoomOnMouseScroll": {"type": "int","values": [{"Yes": 1},{"No": 0}],"default": 0},
			"animationSpeed": {"type": "float","default": 50}
		},

		"canvasObject": 
		{
			"objectType": 
				{
					"type": "string",
					"values": 
						[
							{"Circle": "Circle"},
							{"Rectangle": "Rect"},							
							{"Triangle": "Triangle"},
							{"Image": "Image"},
							{"Text": "Text"}							
						],
					"default": "Rect"
				},
			"fill": {"type": "color"},
			"opacity": {"type": "float"},
			"width": {"type": "float"},
			"height": {"type": "float"},
			"radius": {"type": "float"},
			"left": {"type": "float"},
			"top": {"type": "float"},
			"rx": {"type": "float"},
			"ry": {"type": "float"},
			"stroke": {"type": "color"},
			"id": {"type": "string"},
			"scaleX": {"type": "float"},
			"scaleY": {"type": "float"},
			"text": {"type": "string","default": "Text"},
			"textAlign": {"type": "string","default": "left"},			
			"fontSize": {"type": "float"},
			"fontFamily": {"type": "string"},
			"angle": {"type": "float"},
			"mediaName": {"type": "string"},
			"spriteName": {"type": "string"},
			"spriteWidth": {"type": "float"},
			"spriteHeight": {"type": "float"},
			"spriteIndex": {"type": "float"},
			"frameTime": {"type": "float"},
			"custom_data" : {"type": "object"}			
		}
	},

	"api": 
	{
		"addObject": {"delayUntilFormLoads": true, "parameters": [{"name": "object","type": "object"}, {"name": "setActive", "type":"boolean", "optional":true}]},
		"copySelectedObject": {"delayUntilFormLoads": true, "parameters": []},
		"updateObject": {"delayUntilFormLoads": true, "parameters": [{"name": "object","type": "object"},{"name": "selectActiveItems","type": "boolean"}]},
        "removeObject": {"delayUntilFormLoads": true, "parameters": [{"name": "id","type": "string"}]},
        "clearCanvas":{},
        "startAnimate":{"delayUntilFormLoads": true},
        "stopAnimate":{"delayUntilFormLoads": true},
		"getSelectedObject": {"delayUntilFormLoads": true, "parameters": [{"name": "saveCB","type": "function"}]},
		"setSelectedObject": {"delayUntilFormLoads": true, "parameters": [{"name": "ids","type": "object"}]},
		"saveCanvas": {"delayUntilFormLoads": true, "parameters": [{"name": "saveCB","type": "function"}]},
		"loadCanvas": {"delayUntilFormLoads": true, "parameters": [{"name": "data","type": "string"}]},
		"saveAsImage": {"delayUntilFormLoads": true, "parameters": [{"name": "imgCB","type": "function"}]},
		"ZoomOnPoint": {"delayUntilFormLoads": true, "parameters": [{"name": "x","type": "int"},{"name": "y","type": "int"},{"name": "zoom","type": "int"}]}
	},

	"handlers": 
	{
		"onClick": {"parameters": []},
		"onLongPress": {"parameters": []},
		"onModified": {"parameters": []}
	}
}