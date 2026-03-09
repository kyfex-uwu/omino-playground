import {DimsScene, ScrollableScene} from "omino/scene/Scene.js";
import type Vector from "omino/Vector.js";
import data from "omino/Global.js";
import {fill} from "omino/Colors.js";
import CounterScene from "omino/scene/utils/CounterScene.js";
import {LabeledScene} from "omino/scene/SettingsParser.js";
import type {Submittable} from "omino/scene/utils/Submittable.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";

type gorp<T> = {value:T, submit:(val:T)=>any}
export default class MiscSettingsScene extends ScrollableScene<any>{
    private scrollSens: LabeledScene<number>;
    private toSubmit: gorp<any>[]=[];
    constructor() {
        super({min:0});

        const scrollSensScene = new CounterScene({value:data.scrollScale, min:0, inc:0.1, submitFunc:val=>{
            data.scrollScale=val;
            return true;
        }});
        this.toSubmit.push(scrollSensScene);
        this.scrollSens = this.addScene(new LabeledScene(scrollSensScene, "Scroll Sensitivity", 0.1));
    }
    resized(oldDims:Vector, newDims = oldDims) {
        this.dims.replace(newDims);

        data.env.setFontSize(25);
        this.scrollLimits.max = 0 - this.dims.y + this.offs;
        this.scrollSens.pos.replace(4,10);
        this.scrollSens.dims.replace(newDims.x-8, 30);

        super.resized(oldDims, newDims);
    }

    scrolled(x:number, y:number, delta:number) {
        delta *= this.dims.x * 0.0007;
        return super.scrolled(x, y, delta);
    }

    render(env:AnyEnhancedEnv) {
        env.save();
        env.translate(0, -this.offs);
        let scale = this.dims.y * 0.01;
        env.scale(scale,scale);

        env.restore();

        for(const submittable of this.toSubmit)
            submittable.submit(submittable.value);

        data.env.setFontSize(25);
        super.render(env);
    }
}
