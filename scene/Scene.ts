import Vector from "omino/Vector.js";
import {fill} from "omino/Colors.js";
import data from "omino/Global.js"
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";

const isKindaMobile = 'ontouchstart' in document.documentElement || 0;

function forReverse<T,V>(array:T[], callback:((p:T)=>V)):V|undefined {
    for (let i = array.length - 1; i >= 0; i--) {
        let r = callback(array[i]!);
        if (r !== undefined) return r;
    }
}

//--

export default class Scene<ParentType extends Scene<any>> {
    public readonly pos = new Vector(0,0);
    protected readonly subScenes:Scene<this>[] = [];
    public parent:ParentType|undefined;
    protected focused=false;
    public hasMouseAccess=true

    constructor() {}

    addScene<T extends Scene<any>>(scene:T) {
        this.subScenes.push(scene);
        this.subScenes.sort((s1, s2) => s1.pos.z - s2.pos.z);
        scene.parented(this);

        return scene;
    }
    parented(parent:ParentType){
        this.parent = parent;
    }

    render(env:AnyEnhancedEnv) {
        Scene.renderChildren(this, env);
    }

    static renderChildren(self:Scene<any>, env:AnyEnhancedEnv) {
        for (const scene of self.subScenes) {
            env.save()
            env.translate(scene.pos.x, scene.pos.y);
            scene.render(env);
            env.restore();
        }
    }

    mouseDown(x:number, y:number, button:number) {
        return !!forReverse(this.subScenes, scene => {
            if (scene.mouseDown(x - scene.pos.x, y - scene.pos.y, button)) return true;
        });
    }

    mouseUp(x:number, y:number, button:number) {
        return !!forReverse(this.subScenes, scene => {
            if (scene.mouseUp(x - scene.pos.x, y - scene.pos.y, button)) return true;
        });
    }

    keyPressed(key:string) {
        return !!forReverse(this.subScenes, scene => {
            if (scene.keyPressed(key)) return true;
        });
    }

    keyReleased(key:string) {
        return !!forReverse(this.subScenes, scene => {
            if (scene.keyReleased(key)) return true;
        });
    }

    scrolled(x:number, y:number, delta:number) {
        return !!forReverse(this.subScenes, scene => {
            if (scene.scrolled(x - scene.pos.x, y - scene.pos.y, delta)) return true;
        });
    }

    getAbsolutePos():Vector {
        if (!this.parent) return new Vector(0, 0);
        return this.parent.getAbsolutePos().add(this.pos);
    }

    resized(oldDims:Vector, newDims=oldDims) {
        for (const scene of this.subScenes) {
            scene.resized(oldDims, newDims);
        }
    }

    focus() {
        this.focused = true;
    }

    unfocus() {
        this.focused = false;
    }

    remove() {
        if (this.parent) this.parent.subScenes.splice(this.parent.subScenes.indexOf(this), 1);
    }
}

export class DimsScene<T extends Scene<any>> extends Scene<T> {
    public readonly dims=new Vector(0,0);
    protected clipParent = true;

    isIn(xOffs=0, yOffs=0, width=this.dims.x, height=this.dims.y) {
        if (this.parent && !this.parent.hasMouseAccess) return false;
        if (this.parent instanceof DimsScene && (this.clipParent && !this.parent.isIn())) return false;
        let absPos = this.getAbsolutePos();
        return data.mouseX > absPos.x+xOffs && data.mouseY > absPos.y+yOffs &&
            data.mouseX < absPos.x+xOffs + width && data.mouseY < absPos.y+yOffs + height;
    }

    render(env: AnyEnhancedEnv) {
        super.render(env);
    }
}

export class ButtonScene<T extends Scene<any>> extends DimsScene<T> {
    mouseUp(x:number, y:number) {
        if (!this.isIn()) return false;

        focus(this);

        this.click(x, y);
        return true;
    }

    click(x:number,y:number) {}
}

type ThisFunc<T,OtherParams extends any[]=[]> = (self:T, ...other:OtherParams)=>void
export class OneTimeButtonScene<T extends Scene<any>> extends ButtonScene<T> {
    private readonly renderFunc:ThisFunc<this,[AnyEnhancedEnv]>;
    private readonly clickFunc:ThisFunc<this, [number,number]>;
    public constructor(render:(self:OneTimeButtonScene<T>, env:AnyEnhancedEnv)=>void,
                        click:(self:OneTimeButtonScene<T>, x:number, y:number)=>void,
                        init:(self:OneTimeButtonScene<T>)=>void=()=>{}) {
        super();

        this.renderFunc = render;
        this.clickFunc = click;

        init(this);
    }

    render(env:AnyEnhancedEnv) {
        this.renderFunc(this, env);
    }

    click(x:number, y:number) {
        this.clickFunc(this, x, y);
        return true;
    }
}

const maxClickDist = 5;

export class ScrollableScene<T extends Scene<any>> extends DimsScene<T> {
    protected offs=0;
    protected scrollLimits:{min:number,max:number};
    private maybeScrolling = new Vector(0,0);
    private lastScroll: Vector | undefined = undefined;
    private abortControllers:{up:AbortController,move:AbortController}={
        up:new AbortController(),
        move:new AbortController()
    }

    constructor({min = -Infinity, max = Infinity} = {}) {
        super();
        this.scrollLimits = {min, max};

        this.lastScroll = undefined;
    }

    mouseDown(x:number, y:number, button:number) {
        if (!isKindaMobile) super.mouseDown(x, y, button);
        if (!isKindaMobile || !this.isIn()) return false;

        this.maybeScrolling = new Vector(data.mouseX, data.mouseY);

        this.abortControllers.up.abort();
        this.abortControllers.move.abort();
        this.abortControllers = {
            up: new AbortController(),
            move: new AbortController(),
        };

        const mouseup = () => {
            this.abortControllers.move.abort();
            this.abortControllers.up.abort();
            this.lastScroll = undefined;
        }
        const mousemove = (e:{offsetY:number, type:"mouse"}|{touches:TouchList, type:"touch"}) => {
            let offsY = e.type === "mouse" ? e.offsetY : ((e.touches[0]?.pageY ?? 0) - data.canvElt.offsetTop);

            if (this.lastScroll || Math.abs(this.maybeScrolling.y - offsY) > maxClickDist) {
                if (!this.lastScroll) {
                    this.lastScroll = this.maybeScrolling;
                    this.abortControllers.up.abort();

                    data.canvElt.addEventListener("mouseup", mouseup);
                    data.canvElt.addEventListener("touchend", mouseup);
                }
                this.scrolled(data.mouseX, data.mouseY, this.lastScroll.y - data.mouseY);
                this.lastScroll = new Vector(data.mouseX, data.mouseY);
            }
        }
        data.canvElt.addEventListener("mousemove", (e)=>mousemove({
            type:"mouse",
            offsetY:e.offsetY
        }), {signal: this.abortControllers.move.signal});
        data.canvElt.addEventListener("touchmove", (e) => mousemove({
            type:"touch",
            touches:e.touches
        }), {signal: this.abortControllers.move.signal});

        return true;
    }

    mouseUp(x:number, y:number, button:number) {
        if (this.lastScroll) return false;
        this.abortControllers.move.abort();
        return super.mouseUp(x, y, button);
    }

    scrolled(x:number, y:number, delta:number) {
        if (!this.isIn()) return false;

        let oldOffs = this.offs;
        this.offs = Math.max(this.scrollLimits.min, Math.min(this.scrollLimits.max, this.offs + delta));

        let correctedDelta = this.offs - oldOffs;
        if (correctedDelta == 0) return false;
        for (const child of this.subScenes)
            child.pos.y -= correctedDelta;


        return true;
    }
}

export function ClippedScene<T extends new(...args:any[])=>{
    render(env:AnyEnhancedEnv):void,
    dims:Vector
}>(base: T){
    return class extends base{
        render(env:AnyEnhancedEnv) {
            env.save();
            env.beginPath();
            env.rect(0, 0, this.dims.x, this.dims.y);
            env.clip();
            super.render(env);
            env.restore();
        }
    }
}

let focusedElement:Scene<any>|undefined;
function focus(element:Scene<any>) {
    if (focusedElement!==undefined) focusedElement.unfocus();
    focusedElement = element;
    element.focus();
}

const hoverData:{
    text:string,
    tWidth:number,
    pos:Vector,
    time:number,
    scene:Scene<any>|undefined
} = {
    text: "",
    tWidth: 0,

    pos: new Vector(-999, -999),
    time: -Infinity,
    scene: undefined
};
export const hover = {
    set: function (text:string, scene:Scene<any>) {
        let currScene = hoverData.scene;
        while (currScene!==undefined) {
            if (currScene.parent == scene) return;
            currScene = currScene.parent;
        }

        let mousePos = new Vector(data.mouseX, data.mouseY);
        if (hoverData.pos.equals(mousePos)) return;

        data.env.save();
        data.env.setFontSize(15);
        Object.assign(hoverData,{
            text,
            tWidth: data.env.measureText(text).width + 10,
            pos: mousePos,
            time: -90,
            scene: scene,
        });
        data.env.restore();
    },
    draw: function (env:AnyEnhancedEnv) {
        let inScene = false;
        let currScene = hoverData.scene;
        while (currScene!==undefined) {
            if (currScene == data.scene) {
                inScene = true;
                break;
            }
            currScene = currScene.parent;
        }
        if (!hoverData.pos.equals(new Vector(data.mouseX, data.mouseY)) || !inScene) {
            Object.assign(hoverData, {
                pos: new Vector(-999, -999),
                time:-Infinity,
                scene:undefined,
            });
        }
        hoverData.time++;
        if (hoverData.time > 0) {
            fill("hover.bg", env);
            env.sRect(hoverData.pos.x - hoverData.tWidth / 2, hoverData.pos.y - 20, hoverData.tWidth, 20, 5);
            env.fill();
            fill("hover.text", env);
            env.textAlign = "center";
            env.textBaseline = "bottom";
            env.setFontSize(15);
            env.fillText(hoverData.text, hoverData.pos.x, hoverData.pos.y - 5 / 2);
        }
    }
};

export {
    Scene,
    focus,
    forReverse,
    isKindaMobile
};
