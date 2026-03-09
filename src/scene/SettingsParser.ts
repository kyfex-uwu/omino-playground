import CounterScene from "omino/scene/utils/CounterScene.js";
import {DimsScene} from "omino/scene/Scene.js";
import Vector from "omino/Vector.js";
import {fill} from "omino/Colors.js";
import data from "omino/Global.js";
import type {Setting} from "omino/pathfinding/elements/Element.js";
import type {Submittable} from "omino/scene/utils/Submittable.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";

const functions = {
    counter: (data:{value?:number, min?:number, max?:number, inc?:number, submit:(val:number)=>void}) =>
        new CounterScene(data),
};

export class LabeledScene<T> extends DimsScene<any>{
    protected scene: Submittable<T> & DimsScene<any>;
    protected label: string;
    protected padding: number;
    constructor(scene:Submittable<T> & DimsScene<any>, label:string, padding:number) {
        super();
        this.addScene(this.scene = scene);
        this.label = label;
        this.padding=padding;
    }

    resized(oldDims:Vector, newDims=oldDims) {
        this.scene.pos.x=data.env.measureText(this.label+"n").width+this.padding*data.env.getFontSize();
        this.scene.dims.replace(this.dims.x-this.scene.pos.x-this.padding*data.env.getFontSize(), this.dims.y-this.padding*data.env.getFontSize()*2);
        super.resized(oldDims, newDims);
    }
    render(env:AnyEnhancedEnv) {
        fill("scenes.sidebar.text", env);
        data.env.spFillText(this.label, this.dims.y*0.1,this.dims.y*0.5, {align:"left",baseline:"middle"});
        super.render(env);
    }

    submit(val:T){
        this.scene.submit(val);
    }
}
class LocalLabeledScene<T> extends LabeledScene<T>{
    resized(oldDims:Vector, newDims=oldDims) {
        this.dims.replace(newDims.x, newDims.x*0.12);
        data.env.setFontSize(this.dims.y*0.7);
        this.scene.pos.y=this.padding*data.env.getFontSize();
        super.resized(oldDims, newDims);
    }

    render(env:AnyEnhancedEnv) {
        env.setFontSize(this.dims.y*0.7);
        super.render(env);
    }
}

export default (setting:Setting) => {
    if(functions[setting.type] !== undefined)
        return new LocalLabeledScene(functions[setting.type](setting.data), setting.label, 0.1);
}
