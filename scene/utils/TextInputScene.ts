import {DimsScene, focus, isKindaMobile} from "omino/scene/Scene.js";
import {fill} from "omino/Colors.js";
import MobileKeyboard from "omino/scene/utils/MobileKeyboard.js";
import data from "omino/Global.js"
import {SingleEvent} from "omino/Listeners.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";

const defaultValidator = (str:string)=>/^.*$/.test(str);

class TextInputScene extends SingleEvent<[string]>()(DimsScene<any>) {
    private validator: (val:string)=>boolean;
    private requiresApply: boolean;
    private value: string;
    private newValue: string;
    private keyboard: MobileKeyboard|undefined;
    constructor({validator = defaultValidator, requiresApply = false, value = ""} = {}) {
        super();
        this.validator = validator;
        this.requiresApply = requiresApply;
        this.value = value;
        this.newValue = value;
    }

    mouseUp(x:number, y:number, button:number) {
        if (super.mouseUp(x, y, button)) return true;
        if (this.isIn()) {
            focus(this);

            if (isKindaMobile && !this.keyboard) {
                this.keyboard = this.addScene(new MobileKeyboard([
                    ["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], [",", "0", "Backspace"]
                ])).addListener((key:string) => this.keyPressed(key));
            }

            return true;
        } else if (this.keyboard) {
            if (this.keyboard) this.keyboard.remove();
            this.keyboard = undefined;
            return true;
        }

        return super.mouseUp(x, y, button);
    }

    apply() {
        if (this.validator(this.newValue))
            this.value = this.newValue;

        this.emitEvent(this.value);
        return true;
    }

    keyPressed(key:string) {
        console.log(this.focused)
        if (!this.focused) return super.keyPressed(key);

        switch (key) {
            case "Backspace":
                this.newValue = this.newValue.slice(0, -1);
                break;
            default:
                if (key.length > 1) break;

                this.newValue += key;
                break;
        }

        if (!this.requiresApply) this.apply();
        return true;
    }

    render(env:AnyEnhancedEnv) {
        if (this.isIn()) data.canvElt.style.cursor = "text";

        fill("scenes.util.textInput.bg", env);
        if (this.newValue != this.value) fill("scenes.util.textInput.bgUnsaved", env);
        if (!this.validator(this.newValue)) fill("scenes.util.textInput.invalid", env);
        env.rect(0, 0, this.dims.x, this.dims.y);
        env.fill();
        fill("scenes.util.textInput.color", env);
        env.setFontSize(this.dims.y * 0.8);
        env.spFillText(this.newValue, 2, 2, {align:"left", baseline:"top"});
        if (this.focused && data.elapsed * 0.9 % 1 > 0.5) env.rect(env.measureText(this.newValue).width + 2, 2, 2, this.dims.y - 4);

        super.render(env);
    }
}

export default TextInputScene;
