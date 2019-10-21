{
	"name": "svycanvas-Canvas",
	"displayName": "Canvas",
	"version": 1,
	"definition": "svycanvas/Canvas/Canvas.js",
	"libraries": 
	[
		{
			"name": "Fabric.js",
			"version": "2.6.0",
			"url": "svycanvas/Canvas/fabric.min.js",
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
		"imagesLoader": {"type": "media[]"}
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
			"ZoomOnMouseScroll": {"type": "int","values": [{"Yes": 1},{"No": 0}],"default": 0}
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
			"x": {"type": "float"},
			"y": {"type": "float"},
			"rx": {"type": "float"},
			"ry": {"type": "float"},
			"stroke": {"type": "color"},
			"id": {"type": "string"},
			"scaleX": {"type": "float"},
			"scaleY": {"type": "float"},
			"text": {"type": "string","default": "Text"},
			"fontSize": {"type": "float"},
			"fontFamily": {"type": "string"},
			"angle": {"type": "float"},
			"mediaName": {"type": "string"}			
		}
	},

	"api": 
	{
		"addObject": {"parameters": [{"name": "object","type": "object"}]},
		"copySelectedObject": {"parameters": []},
		"updateObject": {"parameters": [{"name": "object","type": "object"},{"name": "selectActiveItems","type": "boolean"}]},
		"removeObject": {"parameters": [{"name": "id","type": "string"}]},
        "clearCanvas":{},
		"getSelectedObject": {"parameters": [{"name": "saveCB","type": "function"}]},
		"setSelectedObject": {"parameters": [{"name": "ids","type": "object"}]},
		"saveCanvas": {"parameters": [{"name": "saveCB","type": "function"}]},
		"loadCanvas": {"parameters": [{"name": "data","type": "string"}]},
		"ZoomOnPoint": {"parameters": [{"name": "x","type": "int"},{"name": "y","type": "int"},{"name": "zoom","type": "int"}]}
	},

	"handlers": 
	{
		"onClick": {"parameters": []},
		"onModified": {"parameters": []}
	}
}