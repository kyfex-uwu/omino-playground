import events from "omino/Events.js";
import data from "omino/Global.js"

type ColorValArr =[number,number,number]|[number,number,number,number];
type ResultColor=string|CanvasGradient|CanvasPattern|ColorValArr;
type ColorVal=ResultColor|(()=>ResultColor)
export type ColorPath=ColorVal|string;

export type ColorsObj={[key:string]:ColorsObj|ColorPath}
const Colors:ColorsObj = {};

let exportModBehavior = (obj:ColorsObj) => loadDefaultColors(obj);
export function exportMod(obj:ColorsObj){
    exportModBehavior(obj);
}

function deepAssign(target:ColorsObj, source:ColorsObj) {
    for (const [k, v] of Object.entries(source)) {
        if (v.constructor.name == "Object") {
            if (!target[k] || target[k].constructor.name !== "Object")
                target[k] = {};
            deepAssign(target[k] as {}, v as ColorsObj);
        } else
            target[k] = v;
    }
}

function loadColorScript(script:string, callback = (orig:()=>void) => orig()) {
    exportModBehavior =
        (mod:ColorsObj) => {
            callback(() => {
                loadColors(mod);
                tempScript.remove();
            });
        };

    const tempScript = document.createElement("script");
    document.body.appendChild(tempScript);
    tempScript.type = "module";
    tempScript.innerHTML = script;
}

let defaultColors:ColorsObj;

function loadDefaultColors(colorObj:ColorsObj) {
    defaultColors = colorObj;
    loadColors(colorObj);
}


const fontStyle = document.createElement("style");
const loadedFontLinks = new Set();
const loadedFonts = new Set();
document.body.appendChild(fontStyle);

function loadColors(colorObj:ColorsObj) {
    for (const key in Colors) delete Colors[key];
    deepAssign(Colors, defaultColors);

    //error checking?
    deepAssign(Colors, colorObj);

    if (!loadedFontLinks.has(Colors.font)) {
        loadedFontLinks.add(Colors.font);
        fontStyle.innerHTML = `@import url("${Colors.font}");`;

        document.fonts.ready.then(fontFaceSet => {
            const fonts = [...fontFaceSet];
            let addedFont = fonts.filter(font => !loadedFonts.has(font))[0];
            if (addedFont)
                addedFont.load().then(_ => {
                    events.loaded.on(_ => {
                        data.env.setFont(addedFont.family);
                        window.resizeBy(0,0);
                    });
                });
            for (const font of fonts) loadedFonts.add(font);
        });
    }

    colorCache = {};
    loggedColors = {};
}

const errorColor:ColorValArr = [255, 0, 96, 100];
const pathRegex = /^([A-Za-z0-9_-]+[:\.][A-Za-z0-9_-]+|[A-Za-z0-9_-]+)(\.[A-Za-z0-9_-]+)*$/;

let colorCache:{[key:string]:ColorVal} = {};

function cacheAndReturn(cachePath:string, val:ColorVal) {
    if(val === errorColor) val=[Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255),50];

    colorCache[cachePath] = val;
    if(val instanceof Function) return val();
    return val;
}

let loggedColors:{[key:string]:true} = {};

function getColor(path:ColorPath, colorEnv = Colors):ResultColor {
    if (Array.isArray(path))
        return path.length === 3 ? `rgb(${path.join(",")})` : `rgba(${path.slice(0,3).join(",")},${path[3]!/255}%)`;
    if (path instanceof Function) return path();
    if (path instanceof CanvasGradient || path instanceof CanvasPattern) return path;

    if (!pathRegex.test(path)) {
        if (!loggedColors[path]) console.trace("invalid path: " + path);
        loggedColors[path] = true;
        return cacheAndReturn(path, errorColor);
    }
    const cached = colorCache[path];
    if (cached !== undefined) {
        if(cached instanceof Function)
            return cached();
        return cached;
    }

    if (path.includes(":")) path = "vars." + path.replace(":", ".");

    let pos = colorEnv;
    for (const road of path.split(".")) {
        if (Array.isArray(pos[road]) || pos[road] instanceof Function)
            return cacheAndReturn(path, pos[road]);
        if(typeof pos[road] === "string") return getColor(pos[road]);
        if (pos[road] instanceof CanvasGradient || pos[road] instanceof CanvasPattern) return pos[road];

        if(pos[road] === undefined){
            if (!loggedColors[path]) console.trace(`color ${path} not found`);
            loggedColors[path] = true;
            return cacheAndReturn(path, errorColor);
        }

        pos = pos[road];
    }

    return cacheAndReturn(path, errorColor);
}

function handleIfCArr(color:ResultColor){
    if(Array.isArray(color)) return "#"+color.map(v=>v.toString(16)).join("");
    return color;
}

function fill(path:ColorPath, env = data.env) {
    env.fillStyle = handleIfCArr(getColor(path));
}

function stroke(path:ColorPath, env = data.env) {
    env.strokeStyle = handleIfCArr(getColor(path));
}

export function background(path:ColorPath, env = data.env) {
    const oldStyle = env.fillStyle;
    env.save();
    env.resetTransform();
    fill(path);
    env.rect(-1,-1,env.width+2,env.height+2);
    env.fill();
    env.restore();
    env.fillStyle = oldStyle;
}

const colorFuncs = {
    hexToRGBA: (hex:number) => [3, 2, 1, 0].map(v => ((hex >> (8 * v)) & 0xff)) as ColorValArr,
    hexToRGB: (hex:number) => colorFuncs.hexToRGBA((hex << 8) | 0x000000ff) as ColorValArr,

    lighten: (color:ColorPath, amt:number) => () => {
        const realColor = getColor(color);
        if(Array.isArray(realColor))
            return realColor.slice(0, 3).map(v => 255 - (255 - v) * (1 - amt)).concat(...realColor.slice(3)) as ColorValArr;
        return realColor;
    },
    darken: (color:ColorPath, amt:number) => () => {
        const realColor = getColor(color);
        if (Array.isArray(realColor))
            return realColor.slice(0, 3).map(v => v * (1 - amt)).concat(realColor.slice(3)) as ColorValArr;
        return realColor;
    },

    withAlpha: (color:ColorPath, alpha:number) => () => {
        const realColor = getColor(color);
        if (Array.isArray(realColor))
            return realColor.slice(0, 3).concat(alpha) as ColorValArr;
        return realColor;
    },
};

export {
    loadColorScript,
    loadDefaultColors,
    loadColors,
    Colors,

    getColor,
    fill,
    stroke,

    colorFuncs
}
