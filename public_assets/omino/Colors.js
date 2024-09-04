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
		if(v!==undefined&&!Array.isArray(v)&&v instanceof Object && target[k])
			deepAssign(target[k], v);
		else target[k]=v;
	}
}

function loadColors(colorObj){
	//error checking?
	deepAssign(Colors, colorObj);
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
function getColor(path){
	if(!pathRegex.test(path)){
		if(!loggedColors[path]) console.log("invalid path: "+path);
		loggedColors[path]=true;
		return errorColor;
	}
	if(colorCache[path]) return colorCache[path];

	if(path.includes(":")) path="vars."+path.replace(":",".");

	try{
		let pos=Colors;
		for(const road of path.split(".")) pos=pos[road];
		if(Array.isArray(pos)) return cacheAndReturn(path, pos);
		return getColor(pos);
	}catch(e){
		if(!loggedColors[path]) console.trace(`color ${path} not found`);
		loggedColors[path]=true;
		return errorColor;
	}
}
function fill(path, env=p5){
	env.fill.apply(env, getColor(path));
}
function stroke(path, env=p5){
	env.stroke.apply(env, getColor(path));
}
function background(path, env=p5){
	env.background.apply(env, getColor(path));
}

const colorFuncs = {
	hexToRGBA:hex=> [3,2,1,0].map(v=>((hex>>(8*v))&0xff)),
	hexToRGB:hex=>colorFuncs.hexToRGBA((hex<<8)|0x000000ff),
};

export {
	loadColors,
	Colors,

	getColor,
	fill,
	stroke,
	background,

	colorFuncs
}