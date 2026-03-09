import {fill, stroke} from "omino/Colors.js";
import {DimsScene, focus} from "omino/scene/Scene.js";
import type {Submittable} from "omino/scene/utils/Submittable.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";

function hoveredRect(self:DimsScene<any>, env:AnyEnhancedEnv, x:number, y:number, w:number, h:number){
    fill("scenes.util.counter."+(self.isIn(x, y, w, h) ? "bgHover" : "bgButton"), env);
    env.fillRect(x, y, w, h);
}

class CounterScene extends DimsScene<any> implements Submittable<number>{
    private readonly min: number;
    private readonly max: number;
    private readonly inc: number;
    public value: number;
    private oldValue: number;
    private readonly submitFunc: (val:number) => boolean;
    constructor({value=0, min = -Infinity, max = Infinity, inc = 1, submitFunc = (val:number) => true}) {
        super();

        this.min = min;
        this.max = max;
        this.inc = inc;

        this.value = value;
        this.oldValue = value;
        this.submitFunc=submitFunc;
    }

    submit() {
        if(this.submitFunc(this.value)){
            this.oldValue=this.value;
        }
    }

    render(env:AnyEnhancedEnv) {
        if (this.value == this.oldValue) fill("scenes.util.counter.bg", env);
        else fill("scenes.util.counter.bgUnsaved", env);

        env.fillRect(0, 0, this.dims.x - this.dims.y * 2.1, this.dims.y);
        hoveredRect(this, env, this.dims.x - this.dims.y * 1.9, this.dims.y * 0.1, this.dims.y * 0.8, this.dims.y * 0.8);
        hoveredRect(this, env, this.dims.x - this.dims.y * 0.9, this.dims.y * 0.1, this.dims.y * 0.8, this.dims.y * 0.8);
        env.fillRect(this.dims.x - this.dims.y * 0.9, this.dims.y * 0.1, this.dims.y * 0.8, this.dims.y * 0.8);
        fill("scenes.util.counter.color", env);
        env.setFontSize(this.dims.y * 0.9);
        env.spFillText((Math.round(this.value*1000)/1000).toString(), this.dims.y * 0.1, this.dims.y * 0.05, {align:"left",baseline:"top"});

        env.save();
        stroke("scenes.util.counter.color", env);
        env.lineCap="round";
        env.lineWidth = this.dims.y * 0.04;
        env.translate(this.dims.x - this.dims.y * 2, 0);
        env.scale(this.dims.y / 10, this.dims.y / 10);
        env.singleLine(3, 7, 5, 3);
        env.singleLine(7, 7, 5, 3);
        env.translate(10, 0);
        env.singleLine(3, 3, 5, 7);
        env.singleLine(7, 3, 5, 7);
        env.stroke();

        env.restore();

        super.render(env)
    }

    mouseUp(x:number, y:number, button:number) {
        if (!this.isIn()) return super.mouseUp(x, y, button);

        if (x > this.dims.x - this.dims.y) this.value -= this.inc;
        else if (x > this.dims.x - this.dims.y * 2) this.value += this.inc;

        this.value = Math.min(Math.max(this.value, this.min), this.max);

        focus(this);

        return true;
    }

    keyPressed(key:string) {
        if (this.focused && key == "Enter") {
            this.submit();
            return true;
        }
        return super.keyPressed(key);
    }
}

export default CounterScene;
