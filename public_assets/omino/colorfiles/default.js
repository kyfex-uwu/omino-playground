/** - colorfile - 
 * to create your own colorfile, copy this file and edit the values to your liking.
 * you can apply this in settings, the "Use Colorfile" button at the top right.
 * 
 * the way colorfiles work is as follows:
 * - this colorfile is loaded first (the default)
 * - then, your colorfile is loaded on top of it; any fields that you change here overwrite the default.
 * this means you can change certain variables to change large parts of the app, or change specific
 * values to only change one thing.
 * 
 * ###
 * 
 * - an example of a colorfile is at https://kyfexuwu.com/assets/omino/colorfiles/high_contrast.js
 * - colorfiles stay loaded in between sessions. this means you won't lose your colors every time you reopen the page.
 * - you have to reapply a colorfile every time you make a change to it.
 * - once you apply a colorfile, if you KNOW you are not going to edit it again (for example, you're just downloading
 * and using the stock high_contrast colorfile) you can delete it off your system once its been applied,
 * and the changes will stick.
 */

const colorFuncs=(await import("/assets/omino/Colors.js")).colorFuncs;

exportMod({
	vars:{
		"default":{
			util:{
				field:{
					bg:colorFuncs.hexToRGB(0xffffff),
					color:colorFuncs.hexToRGB(0x000000),
				},
				button:{
					bg:colorFuncs.hexToRGB(0xc8c8c8),
					bgHover:colorFuncs.hexToRGB(0xffffff),
					color:"default:util.field.color",
				},
				text:colorFuncs.hexToRGB(0xffffff),

				darken:colorFuncs.hexToRGBA(0x00000064),
			},

			buttons:{
				dark:{
					bg:colorFuncs.hexToRGB(0x464646),
					bgHover:colorFuncs.hexToRGB(0x646464),
					icon:colorFuncs.hexToRGB(0xffffff),
				},
				light:{
					bg:colorFuncs.hexToRGB(0xcda7c1),
					bgHover:colorFuncs.hexToRGB(0xddc4d5),
					icon:colorFuncs.hexToRGB(0x000000),
				}
			},
			board:{
				grid:colorFuncs.hexToRGB(0xBD8BAD),
				filled:colorFuncs.hexToRGBA(0x00000000),
				text:colorFuncs.hexToRGB(0x000000),
			},
			options:{
				unsaved:colorFuncs.hexToRGB(0xf7e89c),
			},
			bg:colorFuncs.hexToRGB(0xAD6F99),
			sidebar:{
				bg:colorFuncs.hexToRGB(0x191919),
			},
		},
	},

	scenes:{
		util:{
			tickbox:{
				bg:"default:util.field.bg",
				bgUnsaved:"default:options.unsaved",
				color:"default:util.field.color",
			},
			counter:{
				bg:"default:util.field.bg",
				bgUnsaved:"default:options.unsaved",
				color:"default:util.field.color",
			},
			textInput:{
				bg:"default:util.field.bg",
				bgUnsaved:"default:options.unsaved",
				color:"default:util.field.color",
			},
			button:{
				bg:"default:util.button.bg",
				bgHover:"default:util.button.bgHover",
				color:"default:util.button.color",
			},
			text:"default:util.text"
		},
		buttons:{
			dark:{
				bg:"default:buttons.dark.bg",
				bgHover:"default:buttons.dark.bgHover",
				icon:"default:buttons.dark.icon",
			},
			light:{
				bg:"default:buttons.light.bg",
				bgHover:"default:buttons.light.bgHover",
				icon:"default:buttons.light.icon",
			},
		},

		sidebar:{
			bg:"default:sidebar.bg",
			unsaved:"default:options.unsaved",
			text:colorFuncs.hexToRGB(0xffffff),

			button:{
				bg:"default:buttons.dark.bg",
				bgHover:"default:buttons.dark.bgHover",
				color:"default:buttons.dark.icon",
			},
		},
		share:{
			outline:colorFuncs.hexToRGB(0xffffff),
			bg:"bg",
			text:colorFuncs.hexToRGB(0x000000),
			darken:"default:util.darken",
			infoText:colorFuncs.hexToRGBA(0x000000c8),
		},
		drawing:{
			darken:"default:util.darken",
			button:{
				bg:"default:util.button.bg",
				bgHover:"default:util.button.bgHover",
				color:"default:util.button.color",
			},
		},
		settings:{
			darken:"default:util.darken",
			hasFile:colorFuncs.hexToRGBA(0x2f658b6f),
			bg:colorFuncs.hexToRGB(0x606060),
			text:colorFuncs.hexToRGB(0xffffff),
			button:{
				bg:"default:util.button.bg",
				bgHover:"default:util.button.bgHover",
				color:"default:util.button.color",
			},
		},
	},

	bg:"default:bg",
	ominoColors:{
		I: colorFuncs.hexToRGB(0xff1745),
		L: colorFuncs.hexToRGB(0xffd417),
		Y: colorFuncs.hexToRGB(0x089c08),
		W: colorFuncs.hexToRGB(0x1fb585),
		V: colorFuncs.hexToRGB(0xd479ed),
		T: colorFuncs.hexToRGB(0x3252c7),
		P: colorFuncs.hexToRGB(0x57f26e),
		N: colorFuncs.hexToRGB(0x85fdff),
		F: colorFuncs.hexToRGB(0xed7b24),
		X: colorFuncs.hexToRGB(0xff85de),
		Z: colorFuncs.hexToRGB(0x6b4021),
		U: colorFuncs.hexToRGB(0x640eb0),

		outline:colorFuncs.hexToRGB(0xffffff),
		"new":colorFuncs.hexToRGB(0xffffff),
	},
	board:{
		grid:"default:board.grid",
		filled:"default:board.filled",
		text:"default:board.text",
		pathColor:colorFuncs.hexToRGBA(0xffffff80),
	},
	hover:{
		bg:colorFuncs.hexToRGB(0xffffff),
		text:colorFuncs.hexToRGB(0x000000),
	}
});