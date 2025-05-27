import {fill, stroke} from "/assets/omino/Colors.js";
import {DimsScene} from "/assets/omino/scene/Scene.js";

function hoveredRect(self, x, y, w, h){
    fill("scenes.util.counter."+(self.isIn(x, y, w, h) ? "bgHover" : "bg"));
    p5.rect(x, y, w, h);
}

class CounterScene extends DimsScene {
    constructor({value=0, min = -Infinity, max = Infinity, inc = 1, submit = _ => 0}) {
        super();

        this.min = min;
        this.max = max;
        this.inc = inc;

        this.value = value;
        this.oldValue = value;

        this.submit = function(){
            if(submit(this.value)){
                this.oldValue=this.value;
            }
        };
    }

    render() {
        if (this.value == this.oldValue) fill("scenes.util.counter.bg");
        else fill("scenes.util.counter.bgUnsaved");

        p5.rect(0, 0, this.dims.x - this.dims.y * 2.1, this.dims.y);
        hoveredRect(this, this.dims.x - this.dims.y * 1.9, this.dims.y * 0.1, this.dims.y * 0.8, this.dims.y * 0.8);
        hoveredRect(this, this.dims.x - this.dims.y * 0.9, this.dims.y * 0.1, this.dims.y * 0.8, this.dims.y * 0.8);
        p5.rect(this.dims.x - this.dims.y * 0.9, this.dims.y * 0.1, this.dims.y * 0.8, this.dims.y * 0.8);
        fill("scenes.util.counter.color");
        p5.textSize(this.dims.y * 0.9);
        p5.textAlign(p5.LEFT, p5.TOP);
        p5.text(this.value, this.dims.y * 0.1, this.dims.y * 0.05);

        p5.push();
        stroke("scenes.util.counter.color");
        p5.strokeWeight(this.dims.y * 0.04);
        p5.translate(this.dims.x - this.dims.y * 2, 0);
        p5.scale(this.dims.y / 10);
        p5.line(3, 7, 5, 3);
        p5.line(7, 7, 5, 3);
        p5.translate(10, 0);
        p5.line(3, 3, 5, 7);
        p5.line(7, 3, 5, 7);

        p5.pop();
    }

    mouseUp(x, y) {
        if (!this.isIn()) return super.mouseUp(x, y);

        if (x > this.dims.x - this.dims.y) this.value -= this.inc;
        else if (x > this.dims.x - this.dims.y * 2) this.value += this.inc;

        this.value = Math.min(Math.max(this.value, this.min), this.max);

        focus(this);

        return true;
    }

    keyPressed(key) {
        if (this.focused && key == "Enter") {
            this.submit();
            return true;
        }
        return super.keyPressed(key);
    }
}

export default CounterScene;
