const colorFuncs=(await import("/assets/omino/Colors.js")).colorFuncs;

exportMod({
	vars:{
		"default":{
			util:{
				darken:colorFuncs.hexToRGBA(0x00000080),
			},

			buttons:{
				light:{
					bg:"default:buttons.dark.bg",
					bgHover:"default:buttons.dark.bgHover",
					icon:"default:buttons.dark.icon",
				}
			},
			bg:colorFuncs.hexToRGB(0x000000),
			sidebar:{
				bg:colorFuncs.hexToRGB(0x252525),
			},
		},
	},

	scenes:{
		buildPuzz:{
			buttons:{
				start:{
					icon:colorFuncs.hexToRGB(0x000000),
				},
				end:{
					icon:colorFuncs.hexToRGB(0x000000),
				},
			},
		},
	},

	ominoColors:{
		I: colorFuncs.hexToRGB(0xff0000),
		L: colorFuncs.hexToRGB(0xffff00),
		Y: colorFuncs.hexToRGB(0x008000),
		W: colorFuncs.hexToRGB(0x00ff80),
		V: colorFuncs.hexToRGB(0xff0080),
		T: colorFuncs.hexToRGB(0x0000ff),
		P: colorFuncs.hexToRGB(0x00ff00),
		N: colorFuncs.hexToRGB(0x00ffff),
		F: colorFuncs.hexToRGB(0xff8000),
		X: colorFuncs.hexToRGB(0xff00ff),
		Z: colorFuncs.hexToRGB(0x805000),
		U: colorFuncs.hexToRGB(0x8800ff),

		new: colorFuncs.hexToRGB(0xffffff),
	},

	board:{
		grid:colorFuncs.hexToRGB(0xaaaaaa),
		start:colorFuncs.hexToRGB(0x00ff00),
		end:colorFuncs.hexToRGB(0xff0000),
	},
});