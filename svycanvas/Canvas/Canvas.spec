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
							{"Ellipse": "Ellipse"},
							{"Polygon": "Polygon"},
							{"Path": "Path"},
							{"Line": "Line"},
							{"Image": "Image"},
							{"Text": "Text"},
							{"Group": "Group"}							
						],
					"default": "Rect"
					,"pushToServer": "allow"
				},
			"objects" : {"type": "object","pushToServer": "allow"},	
			"fill": {"type": "color","pushToServer": "allow"},
			"opacity": {"type": "float","pushToServer": "allow"},
			"width": {"type": "float","pushToServer": "allow"},
			"height": {"type": "float","pushToServer": "allow"},
			"radius": {"type": "float","pushToServer": "allow"},
			"left": {"type": "float","pushToServer": "allow"},
			"top": {"type": "float","pushToServer": "allow"},
			"rx": {"type": "float","pushToServer": "allow"},
			"ry": {"type": "float","pushToServer": "allow"},
			"stroke": {"type": "color","pushToServer": "allow"},
			"strokeWidth": {"type": "float","pushToServer": "allow"},
			"path": {"type": "object","pushToServer": "allow"},
			"points": {"type": "object","pushToServer": "allow"},
			"id": {"type": "string","pushToServer": "allow"},
			"scaleX": {"type": "float","pushToServer": "allow"},
			"scaleY": {"type": "float","pushToServer": "allow"},
			"text": {"type": "string","default": "Text","pushToServer": "allow"},
			"textAlign": {"type": "string","default": "left","pushToServer": "allow"},			
			"fontSize": {"type": "float","pushToServer": "allow"},
			"fontFamily": {"type": "string","pushToServer": "allow"},
			"angle": {"type": "float","pushToServer": "allow"},
			"strokeLineJoin": {"type": "string","pushToServer": "allow"},
			"mediaName": {"type": "string","pushToServer": "allow"},
			"spriteName": {"type": "string","pushToServer": "allow"},
			"spriteWidth": {"type": "float","pushToServer": "allow"},
			"spriteHeight": {"type": "float","pushToServer": "allow"},
			"spriteIndex": {"type": "float","pushToServer": "allow"},
			"frameTime": {"type": "float","pushToServer": "allow"},
			"flipX" : {"type": "boolean","pushToServer": "allow"},
			"flipY" : {"type": "boolean","pushToServer": "allow"},
			"selectable" : {"type": "boolean","pushToServer": "allow"},
			"state" : {"type": "object","pushToServer": "allow"},
			"stateHolder" : {"type": "object","pushToServer": "allow"},
			"custom_data" : {"type": "object","pushToServer": "allow"}
		}
	},

	"api": 
	{
		"addObject": {"delayUntilFormLoads": true, "parameters": [{"name": "object","type": "object"}, {"name": "setActive", "type":"boolean", "optional":true}]},		
		"copySelectedObject": {"delayUntilFormLoads": true, "parameters": []},
		"updateObject": {"delayUntilFormLoads": true, "parameters": [{"name": "object","type": "object"},{"name": "selectActiveItems","type": "boolean"}]},
        "removeObject": {"delayUntilFormLoads": true, "parameters": [{"name": "id","type": "string"}]},        
        "clearCanvas":{"delayUntilFormLoads": true},
        "startAnimate":{"delayUntilFormLoads": true},
        "stopAnimate":{"delayUntilFormLoads": true},
		"getSelectedObject": {"delayUntilFormLoads": true, "parameters": [{"name": "saveCB","type": "function"}]},
		"setSelectedObject": {"delayUntilFormLoads": true, "parameters": [{"name": "ids","type": "object"}]},
		"saveCanvas": {"delayUntilFormLoads": true, "parameters": [{"name": "saveCB","type": "function"}]},
		"loadCanvas": {"delayUntilFormLoads": true, "parameters": [{"name": "data","type": "string"}]},
		"printCanvas": {"delayUntilFormLoads": true, "parameters": []},
		"saveAsImage": {"delayUntilFormLoads": true, "parameters": [{"name": "imgCB","type": "function"}]},
		"ZoomOnPoint": {"delayUntilFormLoads": true, "parameters": [{"name": "x","type": "int"},{"name": "y","type": "int"},{"name": "zoom","type": "int"}]},
		"bringToFront": {"delayUntilFormLoads": true, "parameters": [{"name": "id","type": "string"}]},
		"rotate": {"delayUntilFormLoads": true, "parameters": [{"name": "angle","type": "int"}]}
	},

	"handlers": 
	{
		"onClick": {"parameters": []},
		"onLongPress": {"parameters": []},
		"onModified": {"parameters": []},
		"onReady": {"parameters": []}
	}
}