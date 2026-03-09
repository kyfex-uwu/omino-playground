import {DimsScene} from "omino/scene/Scene.js";
import Vector from "omino/Vector.js";
import data from "omino/Global.js";
import {fill} from "omino/Colors.js";
import ChangeKeysScene from "omino/scene/settings/keybinds/ChangeKeysScene.js";
import {OneKeyScene} from "omino/scene/settings/keybinds/KeybindsScene.js";
import type {Keybind} from "omino/Keybinds.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";

export class KeybindScene extends DimsScene<any> {
    private text: string;
    keybind: Keybind;

    declare subScenes:OneKeyScene[];
    constructor(text:string, keybind:Keybind) {
        super();
        this.text = text;
        this.keybind = keybind;

        this.reload();
    }

    reload() {
        this.subScenes.length=0;
        for (const key of this.keybind.values)
            this.addScene(new OneKeyScene(key));
    }

    render(env:AnyEnhancedEnv) {
        fill(this.isIn() ? "scenes.settings.buttons.dark.bgHover" : "scenes.settings.buttons.dark.bg", env);
        env.fillRect(0, 0, this.dims.x, this.dims.y);
        fill("scenes.settings.buttons.dark.text", env);
        env.setFontSize(this.dims.y * 0.5);
        env.spFillText(this.text, this.dims.y * 0.1, this.dims.y / 2, {align:"left",baseline:"middle"});

        super.render(env);
    }

    resized(oldDims:Vector, newDims=oldDims) {
        let x = this.dims.x - this.dims.y * 0.1;
        for (const scene of this.subScenes) {
            scene.setDims(this.dims.y * 0.7);
            scene.pos.replace(x - scene.dims.x, this.dims.y * 0.3 / 2);

            x -= scene.dims.x + this.dims.y * 0.1;
        }
    }

    mouseUp(x:number, y:number) {
        if (!this.isIn()) return false;

        data.scene = new ChangeKeysScene(data.scene, this);

        return true;
    }
}

export default KeybindScene;
