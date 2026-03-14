import Vector from "omino/Vector.js";
import MainScene from "omino/scene/MainScene.js";
import {createKey, rawKeys} from "omino/Keybinds.js";
import Board from "omino/Board.js";
import {hover, isKindaMobile} from "omino/scene/Scene.js";

import events from "omino/Events.js";

import RectBoardEl from "omino/pathfinding/boards/RectBoardEl.js";
import OminoEl from "omino/pathfinding/elements/OminoEl.js";
import PortalEl from "omino/pathfinding/elements/PortalEl.js";
import RectOrientation from "omino/pathfinding/orientation/RectOrientation.js";
import EnvHelper from "omino/EnvHelper.js";
import {pageData} from "omino/Options.js";
import data from "omino/Global.js";
import {getCanvas} from "../omino-playground.js";
import HexBoardEl from "omino/pathfinding/boards/HexBoardEl.js";

//--

export const o = <T>(v:T)=>v;

//--

await events.loaded.resolve();

// data.canvElt = document.createElement("canvas");
// document.getElementById("app")!.appendChild(data.canvElt);
// data.canvElt.tabIndex=0;
data.canvElt = getCanvas();

data.env=EnvHelper(data.canvElt.getContext("2d", {alpha: false})!, data.canvElt);
data.canvElt.addEventListener("contextmenu", e => e.preventDefault());
data.canvElt.addEventListener("wheel", e => e.preventDefault());
data.canvElt.addEventListener("touchmove", e => e.preventDefault());
data.canvElt.style.zIndex = "999";

data.scene = new MainScene(new Board({
    elements: [
        new RectBoardEl(7, 7),
    ]
}));
data.isFullscreened = pageData.fullscreen.parsedVal!;

data.listeners.resize.push((old,nw) => data.scene!.resized(old,nw));
data.listeners.mouseDown.push((x,y, button) => data.scene!.mouseDown(x,y, button));
data.listeners.mouseUp.push((x,y, button) => data.scene!.mouseUp(x,y, button));
data.listeners.keyDown.push((key) => data.scene!.keyPressed(key));
data.listeners.keyUp.push((key) => data.scene!.keyReleased(key));
data.listeners.scroll.push((x, y, amt) => data.scene!.scrolled(x, y, amt));

data.canvElt.addEventListener("mousemove", e=>{
    data.mouseX = e.offsetX;
    data.mouseY = e.offsetY;
})

addEventListener("resize", ()=>windowResized());
data.canvElt.addEventListener("mousedown", (e)=>mouseDown(e.offsetX,e.offsetY, e.button));
data.canvElt.addEventListener("touchstart", (e)=>
    //whatever this doesnt work
    mouseDown(e.targetTouches[0]!.pageX-data.canvElt.getBoundingClientRect().x,e.targetTouches[0]!.pageY-data.canvElt.getBoundingClientRect().y, 0));
data.canvElt.addEventListener("mouseup", (e)=>mouseUp(e.offsetX,e.offsetY, e.button));
data.canvElt.addEventListener("touchend", (e)=>
    //whatever this doesnt work
    mouseUp(e.targetTouches[0]!.pageX-data.canvElt.getBoundingClientRect().x,e.targetTouches[0]!.pageY-data.canvElt.getBoundingClientRect().y, 0));
data.canvElt.addEventListener("keydown", (e)=>{
    let key = e.key.length == 1 ? e.key.toLowerCase() : e.key;
    createKey(key);
    rawKeys[key]?.press();
    for(const listener of data.listeners.keyDown) listener(key);
});
data.canvElt.addEventListener("keyup", (e)=>{
    let key = e.key.length == 1 ? e.key.toLowerCase() : e.key;
    createKey(key);
    rawKeys[key]?.release();
    for(const listener of data.listeners.keyUp) listener(key);
});
windowResized();

data.canvElt.addEventListener("wheel", (e)=>{
    let consumed=false;
    for(const listener of data.listeners.scroll) {
        consumed ||= listener(data.mouseX, data.mouseY, e.deltaY * data.scrollScale);
    }
    if (consumed) {
        window.scroll(0, data.canvElt.getBoundingClientRect().y - document.body.getBoundingClientRect().y -
            (window.innerHeight - data.canvElt.height) / 2);
    }
}, {passive:false});

const draw = (delta:DOMHighResTimeStamp) => {
    data.elapsed=delta;

    data.env.clearRect(0,0,9999,9999);
    data.canvElt.style.cursor = "default";
    data.env.setFontSize(30);
    data.env.strokeStyle="#0000";
    data.env.fillStyle="#0000";
    data.scene.render(data.env);
    hover.draw(data.env);

    //--

    for (const key in rawKeys) rawKeys[key]!.reset();

    requestAnimationFrame(draw);
};
requestAnimationFrame(draw);

export function windowResized(){
    let oldWidth = data.canvElt!.width;
    let oldHeight = data.canvElt!.height;
    let newWidth;
    let newHeight;
    if (data.isFullscreened) {
        if (isKindaMobile) data.canvElt.requestFullscreen();
        newWidth = window.innerWidth;
        newHeight = window.innerHeight;

        data.canvElt.style.position="absolute";
        data.canvElt.style.left="0";
        data.canvElt.style.top="0";
        try {
            //me when im lazy
            document.getElementById("lightmode-toggle")!.style.display = "none";
        } catch (e) {
        }
    } else {
        if (isKindaMobile) document.exitFullscreen();
        newWidth = data.canvElt.parentElement!.clientWidth;
        newHeight = Math.min(data.canvElt.parentElement!.clientWidth * 3 / 4, window.innerHeight * 0.96);

        data.canvElt.style.position="static";
        try {
            //me when im lazy 2: electic boogaloo
            document.getElementById("lightmode-toggle")!.style.display = "unset";
        } catch (e) {
        }
    }
    data.canvElt.width = newWidth;
    data.canvElt.height = newHeight;
    for(const listener of data.listeners.resize)
        listener(new Vector(oldWidth, oldHeight), new Vector(newWidth, newHeight));
}

function mouseDown(x:number,y:number, button:number){
    for(const listener of data.listeners.mouseDown)
        listener(x, y, button);
}
function mouseUp(x:number,y:number, button:number){
    for(const listener of data.listeners.mouseUp)
        listener(x, y, button);
}
