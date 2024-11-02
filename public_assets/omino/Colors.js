import events from "/assets/omino/Events.js";

const Colors = {};
window.Colors=Colors;

function replaceColors(obj){
	for(const [k,v] of Object.entries(obj)){
		if(Array.isArray(v)){
			obj[k]=errorColor;
		}else if(v instanceof Object){
			replaceColors(v);
		}
	}
}
function deepAssign(target,source){
	for(const [k,v] of Object.entries(source)){
		if(v.constructor.name=="Object"){
			if(!target[k]||target[k].constructor.name!="Object")
				target[k]={};
			deepAssign(target[k], v);
		}else
			target[k]=v;
	}
}

function loadColorScript(script, callback=orig=>orig()){
	window.exportMod=mod=>{
		callback(_=>{
			loadColors(mod);
			tempScript.remove();
		});
	};

	const tempScript = document.createElement("script");
	document.body.appendChild(tempScript);
	tempScript.type="module";
	tempScript.innerHTML=script;
}
let defaultColors;
function loadDefaultColors(colorObj){
	defaultColors=colorObj;
	loadColors(colorObj);
}


const fontStyle = document.createElement("style");
const loadedFontLinks=new Set();
const loadedFonts=new Set();
document.body.appendChild(fontStyle);
function loadColors(colorObj){
	currColorEnv=colorObj;
	for(const key in Colors) delete Colors[key];
	deepAssign(Colors, defaultColors);

	//error checking?
	deepAssign(Colors, colorObj);

	if(!loadedFontLinks.has(Colors.font)){
		loadedFontLinks.add(Colors.font);
		fontStyle.innerHTML=`@import url("${Colors.font}");`;

		document.fonts.ready.then(fontFaceSet => {
			const fonts = [...fontFaceSet];
			let addedFont=fonts.filter(font=>!loadedFonts.has(font))[0];
			if(addedFont)
				addedFont.load().then(_=>{
					events.loaded.on(_=>{
						events.loaded
						p5.textFont(addedFont.family);
						p5.windowResized();
					});
				});
			for(const font of fonts) loadedFonts.add(font);
		});
	}

	colorCache={};
	loggedColors={};

	if(false) replaceColors(colorObj);
}

const errorColor = [255,0,96,100];
const pathRegex=/^([A-Za-z0-9_-]+[:\.][A-Za-z0-9_-]+|[A-Za-z0-9_-]+)(\.[A-Za-z0-9_-]+)*$/;

let colorCache={};
function cacheAndReturn(cachePath, val){
	colorCache[cachePath]=val;
	return val;
}
let loggedColors={};
function getColor(path, {colorEnv=Colors, force=true}={}){
	if(Array.isArray(path)) return path;
	if(path instanceof Function) return path();

	if(!pathRegex.test(path)){
		if(!loggedColors[path]) console.trace("invalid path: "+path);
		loggedColors[path]=true;
		return force?errorColor:undefined;
	}
	if(colorCache[path]) return colorCache[path];

	if(path.includes(":")) path="vars."+path.replace(":",".");

	try{
		let pos=colorEnv;
		for(const road of path.split(".")) pos=pos[road];
		if(Array.isArray(pos)) return cacheAndReturn(path, pos);
		return getColor(pos);
	}catch(e){
		if(!loggedColors[path]) console.trace(`color ${path} not found`);
		loggedColors[path]=true;
		return force?errorColor:undefined;
	}
}
//todo: css patterns
function fill(path, env=p5){
	env.fill.apply(env, getColor(path));
}
function stroke(path, env=p5){
	env.stroke.apply(env, getColor(path));
}
function background(path, env=p5){
	env.background.apply(env, getColor(path));
}

let currColorEnv=undefined;
const colorFuncs = {
	hexToRGBA:hex=> [3,2,1,0].map(v=>((hex>>(8*v))&0xff)),
	hexToRGB:hex=>colorFuncs.hexToRGBA((hex<<8)|0x000000ff),

	lighten:(color, amt)=>_=>getColor(color).slice(0,3).map(v=>255-(255-v)*(1-amt)).concat(getColor(color).slice(3)),
	darken:(color, amt)=>_=>getColor(color).slice(0,3).map(v=>255*(1-amt)).concat(getColor(color).slice(3)),

	withAlpha:(color, alpha)=>_=>getColor(color).slice(0,3).concat(alpha),
};

export {
	loadColorScript,
	loadDefaultColors,
	loadColors,
	Colors,

	getColor,
	fill,
	stroke,
	background,

	colorFuncs
}