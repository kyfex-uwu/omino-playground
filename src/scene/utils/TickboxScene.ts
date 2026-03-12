import {DimsScene, focus} from "omino/scene/Scene.js";
import {fill, stroke} from "omino/Colors.js";
import {SingleEvent} from "omino/Listeners.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";
import type {Submittable} from "omino/scene/utils/Submittable.js";

export default class TickboxScene extends SingleEvent(DimsScene<any>, null! as [boolean]) implements Submittable<boolean>{
    private value: boolean;
    private newValue: boolean;
    private requiresApply: boolean;
    constructor({value = false, requiresApply = false} = {}) {
        super();
        this.value = value;
        this.newValue = value;
        this.requiresApply = requiresApply;
    }

    apply() {
        this.value = this.newValue;

        this.emitEvent(this.value);
        return true;
    }

    mouseUp(x:number, y:number, button:number) {
        if (this.isIn()) {
            focus(this);
            this.newValue = !this.newValue;
            if (!this.requiresApply) this.apply();
            return true;
        }

        return super.mouseUp(x, y, button);
    }

    render(env:AnyEnhancedEnv) {
        fill(this.value == this.newValue ? "scenes.util.tickbox.bg" : "scenes.util.tickbox.bgUnsaved", env);
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

    submit(val: boolean): void {

    }
}
