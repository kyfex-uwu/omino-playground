import {ButtonScene, DimsScene} from "omino/scene/Scene.js";
import Vector from "omino/Vector.js";
import {fill} from "omino/Colors.js";
import {SingleEvent} from "omino/Listeners.js";
import data from "omino/Main.js";

class KeyScene extends SingleEvent(ButtonScene<MobileKeyboard>, null! as []) {
    private key;
    private orderPos;
    private orderDims;
    constructor(pos:Vector, dims:Vector, key:string) {
        super();

        this.key = key;
        this.orderPos = pos;
        this.orderDims = dims;
    }

    click() {
        switch (this.key) {
            case "Backspace":
                this.parent!.value = this.parent!.value.slice(0, -1);
                break;
            default:
                this.parent!.value += this.key;
                break;
        }

        this.emitEvent();
    }

    render() {
        fill(this.isIn() ? "scenes.util.keypad.button.bgHover" : "scenes.util.keypad.button.bg");
        data.env.roundRect(0, 0, this.dims.x, this.dims.y, Math.max(0, Math.min(this.dims.x, this.dims.y)));
        data.env.fill();
        fill("scenes.util.keypad.button.color");
        data.env.setFontSize(this.dims.y * 0.7);
        switch (this.key) {
            case "Backspace":
                data.env.spFillText("⌫", this.dims.x / 2, this.dims.y / 2, {align:"center", baseline:"middle"});
                break;
            default:
                data.env.spFillText(this.key, this.dims.x / 2, this.dims.y / 2, {align:"center", baseline:"middle"});
                break;
        }
    }

    resize(dims:Vector) {
        let screenHeight = dims.x * 0.3;
        let padding = Math.max(dims.x / (this.orderDims.x + 1), dims.y / (this.orderDims.y + 1)) * 0.2;

        let newDims = dims.sub(new Vector(0, screenHeight));
        this.dims.replace( newDims.div(this.orderDims).sub(new Vector(padding, padding)));
        this.pos.replace(this.orderPos.mult(newDims.div(this.orderDims)).add(new Vector(padding / 2, screenHeight)));
    }
}

class MobileKeyboard extends SingleEvent(DimsScene<any>, null! as [string]) {
    value: string;
    private keysArr: (undefined | KeyScene)[][];
    constructor(keysArr:string[][]) {
        super();
        this.clipParent = false;
        this.value = "";

        let width = keysArr[0]?.length ?? 0;
        let height = keysArr.length;
        this.keysArr = keysArr.map((row, y) => row.map((data, x) => {
            if (data === undefined) return;
            const toAdd = new KeyScene(new Vector(x, y), new Vector(width, height), data);
            toAdd.addListener(()=>this.emitEvent(data));
            return this.addScene(toAdd);
        }));
    }

    recalculate() {
        for (const row of this.keysArr) {
            for (const button of row) {
                if (button) button.resize(this.dims);
            }
        }
    }

    changePosAndDims(pos:Vector, dims:Vector) {
        this.pos.replace(pos);
        this.dims.replace(dims);
        this.recalculate();
    }

    render() {
        let unit = Math.max(0, Math.min(this.dims.x, this.dims.y));
        fill("scenes.util.keypad.shadow");
        data.env.roundRect(-unit * 0.02, -unit * 0.02, this.dims.x + unit * 0.04, this.dims.y + unit * 0.04, unit * 0.04);
        data.env.fill();
        fill("scenes.util.keypad.bg");
        data.env.roundRect(0, 0, this.dims.x, this.dims.y, unit * 0.03);
        data.env.fill();
        fill("scenes.util.keypad.display");
        data.env.roundRect(this.dims.y * 0.05, this.dims.y * 0.05, this.dims.x - this.dims.y * 0.1, this.dims.x * 0.3 - this.dims.y * 0.1, unit * 0.01);
        data.env.fill();
        fill("scenes.util.keypad.text");
        data.env.spFillText(this.value || "0", this.dims.x / 2, this.dims.x * 0.15, {align:"center",baseline:"middle"});
        super.render();
    }

    mouseUp(x:number, y:number) {
        if (super.mouseUp(x, y)) return true;
        return this.isIn();

    }
}

export default MobileKeyboard;
