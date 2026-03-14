import {DimsScene, focus} from "omino/scene/Scene.js";
import {fill, stroke} from "omino/Colors.js";
import {SingleEvent} from "omino/Listeners.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";
import type {Submittable} from "omino/scene/utils/Submittable.js";
import type Vector from "omino/Vector.js";

export default class TickboxScene extends SingleEvent<[boolean]>()(DimsScene<any>) implements Submittable<boolean>{
    private value: boolean;
    private oldValue: boolean;
    private requiresApply: boolean;
    constructor({value = false, extra:{requiresApply = false}}) {
        super();
        this.value = value;
        this.oldValue = value;
        this.requiresApply = requiresApply;
    }

    apply() {
        this.oldValue = this.value;
        console.log("A")

        this.emitEvent(this.value);
        return true;
    }

    mouseUp(x:number, y:number, button:number) {
        if (this.isIn()) {
            focus(this);
            this.value = !this.value;
            this.oldValue=this.value;
            if (!this.requiresApply) this.apply();
            return true;
        }

        return super.mouseUp(x, y, button);
    }

    render(env:AnyEnhancedEnv) {
        fill(this.value == this.oldValue ? "scenes.util.tickbox.bg" : "scenes.util.tickbox.bgUnsaved", env);
        env.fillRect(0, 0, this.dims.x, this.dims.y);
        if (this.value) {
            stroke("scenes.util.tickbox.color", env);
            env.scale((this.dims.x + this.dims.y) * 0.05, (this.dims.x + this.dims.y) * 0.05);
            env.lineWidth=2;
            env.singleLine(2, 2, 8, 8);
            env.singleLine(2, 8, 8, 2);
        }

        super.render(env);
    }

    resized(oldDims:Vector, newDims=oldDims){
        const size = Math.min(this.dims.x,this.dims.y);
        if(size === this.dims.x)
            this.pos.y+=this.dims.y/2-size/2;
        if(size === this.dims.y)
            this.pos.x+=this.dims.x/2-size/2;
        this.dims.replace(size,size);
        super.resized(oldDims, newDims)
    }

    submit() {
        this.oldValue=this.value;
    }
}
