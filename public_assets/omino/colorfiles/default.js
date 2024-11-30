/** - colorfile - 
 * to create your own colorfile, copy this file and edit the values to your liking.
 * you can apply this in settings, the "Use Colorfile" button at the top right.
 * 
 * /!\ DO NOT use colorfiles unless they come from a trusted source! /!\
 * 
 * anything on kyfexuwu.com is safe, but if you are unsure of a colorfile, err on the side of caution.
 * the way colorfiles work are as dangerous as pasting code into your console. 
 * (this also means if youre smart at coding, this is more like a way to mod omino playground :3)
 * 
 * ###
 * 
 * the way colorfiles work is as follows:
 * - this colorfile is loaded first (the default)
 * - then, your colorfile is loaded on top of it; any fields that you change here overwrite the default.
 * this means you can change certain variables to edit large parts of the app, or change specific
 * values to only modify one thing.
 * 
 * ###
 * 
 * how to use a colorfile (in depth)
 * - download (or create) your colorfile. the example one you can use is 
 * https://kyfexuwu.com/assets/omino/colorfiles/high_contrast.js
 * - go to the settings screen in the app (click the settings icon at the top left)
 * - click the Use Colorfile button in settings (the paintbrush at the top right)
 * - drag your colorfile onto the page
 * OR
 * - click the page and when the file dialog opens, select your colorfile
 * - click the back button at the top right, and you should see some changes!
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

				keypad:{
					bg:colorFuncs.hexToRGB(0x263d22),
					button:{
						bg:colorFuncs.hexToRGB(0x8e9482),
						bgHover:colorFuncs.hexToRGB(0xa9ada1),
						color:"default:util.field.color",
					},

					display:"default:util.field.bg",
					text:"default:util.field.color",
					shadow:colorFuncs.hexToRGBA(0x33333350),
				},

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
				},
			},
			options:{
				unsaved:colorFuncs.hexToRGB(0xf7e89c),
				invalid:colorFuncs.hexToRGB(0xf07067),
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
				invalid:"default:options.invalid",
			},
			textInput:{
				bg:"default:util.field.bg",
				bgUnsaved:"default:options.unsaved",
				color:"default:util.field.color",
				invalid:"default:options.invalid",
			},
			dropdown:{
				bg:"default:util.field.bg",
				bgUnsaved:"default:options.unsaved",
				color:"default:util.field.color",
				invalid:"default:options.invalid",
			},
			button:{
				bg:"default:util.button.bg",
				bgHover:"default:util.button.bgHover",
				color:"default:util.button.color",
				invalid:"default:options.invalid",
			},
			text:"default:util.text",

			keypad:{
				bg:"default:util.keypad.bg",
				button:{
					bg:"default:util.keypad.button.bg",
					bgHover:"default:util.keypad.button.bgHover",
					color:"default:util.keypad.button.color",
				},

				display:"default:util.keypad.display",
				text:"default:util.keypad.text",
				shadow:"default:util.keypad.shadow",
			},
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
			bg:[colorFuncs.hexToRGB(0x101010), colorFuncs.hexToRGB(0x191919)],
			text:colorFuncs.hexToRGB(0xffffff),
			modal:{
				bg:"default:buttons.dark.bg",
				text:"default:buttons.dark.icon",
			},
			buttons:{
				dark:{
					bg:"default:buttons.dark.bg",
					bgHover:"default:buttons.dark.bgHover",
					text:"default:buttons.dark.icon",
				},
				light:{
					bg:colorFuncs.hexToRGB(0xc8c8c8),
					bgHover:colorFuncs.hexToRGB(0xffffff),
					text:colorFuncs.hexToRGB(0x000000),
				},
			},
		},
		buildPuzz:{
			buttons:{
				"default":{
					bg:"default:buttons.light.bg",
					bgHover:"default:buttons.light.bgHover",
					icon:"default:buttons.light.icon",
				},
				start:{
					bg:colorFuncs.hexToRGB(0xa4ff85),
					bgHover:colorFuncs.lighten("scenes.buildPuzz.buttons.start.bg", 0.6),
					icon:"default:buttons.light.icon",
				},
				end:{
					bg:colorFuncs.hexToRGB(0xff8585),
					bgHover:colorFuncs.lighten("scenes.buildPuzz.buttons.end.bg", 0.3),
					icon:"default:buttons.light.icon",
				},
				locked:{
					bg:colorFuncs.hexToRGB(0x323232),
					bgHover:colorFuncs.lighten("scenes.buildPuzz.buttons.locked.bg", 0.15),
					icon:"default:buttons.dark.icon",
				}
			}
		},
	},

	bg:"default:bg",
	font:"",//https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@600&display=swap

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
		grid:colorFuncs.hexToRGB(0xBD8BAD),
		text:colorFuncs.hexToRGB(0x000000),
		pathColor:colorFuncs.hexToRGBA(0xffffff80),

		torusIndicator:colorFuncs.withAlpha("default:bg", 100),

		filled:colorFuncs.hexToRGBA(0x00000000),
		start:colorFuncs.hexToRGB(0xafdea0),
		end:colorFuncs.hexToRGB(0xdea0a0),
	},
	hover:{
		bg:colorFuncs.hexToRGB(0xffffff),
		text:colorFuncs.hexToRGB(0x000000),
	},
});