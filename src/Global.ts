import type Scene from "omino/scene/Scene.js";
import type {EnhancedEnv} from "omino/EnvHelper.js";
import Vector from "omino/Vector.js";

const data:{
    scene:Scene<never>
    isFullscreened:boolean
    canvElt:HTMLCanvasElement
    env:EnhancedEnv
    listeners:{
        mouseDown:((x:number,y:number, button:number)=>void)[],
        mouseUp:((x:number,y:number, button:number)=>void)[],
        keyDown:((key:string)=>void)[],
        keyUp:((key:string)=>void)[],
        scroll:((x:number,y:number,delta:number)=>boolean)[],
        resize:((old:Vector,nw:Vector)=>void)[],
    },

    mouseX:number,
    mouseY:number,
    elapsed:number,

    scrollScale:number,
} = {
    isFullscreened: false,
    scene:undefined!,
    canvElt:undefined!,
    env:undefined!,

    listeners:{
        mouseDown:[],
        mouseUp:[],
        keyDown:[],
        keyUp:[],
        scroll:[],
        resize:[],
    },

    mouseX:0,
    mouseY:0,
    elapsed:0,

    scrollScale:0.5,
};
export default data;
