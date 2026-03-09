import {DimsScene, Scene, ScrollableScene} from "omino/scene/Scene.js";
import Vector from "omino/Vector.js";
import data from "omino/Global.js";
import {Keybind, Keybinds} from "omino/Keybinds.js";
import {background, fill} from "omino/Colors.js";
import KeybindScene from "omino/scene/settings/keybinds/KeybindScene.js";
import ChangeKeysScene from "omino/scene/settings/keybinds/ChangeKeysScene.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";

export const keybindGroups:[string,{[key:string]:string}][] = [
    ["Solving", {
        CCW: "Rotate Counterclockwise",
        CW: "Rotate Clockwise",
        MH: "Mirror Horizontally",
        MV: "Mirror Vertically",
        DEL: "Delete Omino",
    }],
    ["Building", {
        START: "Place Start Position",
        END: "Place End Position",
        LOCK: "Place Locked Tiles",
    }],
];

export class PressKeyScene extends Scene<never> {
    private backScreen:ChangeKeysScene;
    private renderScreen: Scene<any>;
    private keybind: Keybind;
    constructor(backScreen:ChangeKeysScene, renderScreen:Scene<any>, keybind:Keybind) {
        super();
        this.backScreen = backScreen;
        this.renderScreen = renderScreen;
        this.keybind = keybind;
    }

    resized(oldDims:Vector, newDims = oldDims) {
        this.backScreen.resized(oldDims, newDims);
        super.resized(oldDims, newDims);
    }

    render(env:AnyEnhancedEnv) {
        this.renderScreen.render(env);
        background("scenes.settings.darken", env);
        fill("scenes.settings.buttons.dark.text", env);
        env.setFontSize(env.height() * 0.1);
        env.spFillText("Press a key", env.width() / 2, env.height() / 2,{align:"center",baseline:"middle"});

        super.render(env);
    }

    keyPressed(key:string) {
        this.keybind.add(key);
        data.scene = this.backScreen;
        this.backScreen.reload();
        return false;
    }
}

export class OneKeyScene extends DimsScene<any> {
    private key: string;
    constructor(key:string) {
        super();
        this.key = key;
    }

    render(env:AnyEnhancedEnv) {
        fill("scenes.settings.buttons.light.bg", env);
        env.rect(0, 0, this.dims.x, this.dims.y);
        fill("scenes.settings.buttons.light.text", env);
        env.setFontSize(this.dims.y * 0.9);
        env.spFillText(this.key, this.dims.x / 2, this.dims.y / 2,{align:"center",baseline:"middle"});
    }

    setDims(height:number) {
        data.env.setFontSize(height * 0.9);
        this.dims.replace(data.env.measureText(this.key + "m").width, height);
    }
}

class Divider extends DimsScene<any> {
    private label: string;
    constructor(label:string) {
        super();
        this.label = label;
    }

    render(env:AnyEnhancedEnv) {
        fill("scenes.settings.buttons.dark.text", env);
        env.setFontSize(this.dims.y * 0.7);
        env.spFillText(this.label, this.dims.y * 0.1, this.dims.y, {align:"left",baseline:"bottom"});

        super.render(env);
    }

    reload() {}
}

export class KeybindsScene extends ScrollableScene<any> {
    private keybindScenes: DimsScene<any>[];
    declare subScenes:DimsScene<any>[];
    constructor() {
        super({min: 0});

        this.keybindScenes = [];
        for (const group of keybindGroups) {
            this.keybindScenes.push(this.addScene(new Divider(group[0])));
            for (const [name, text] of Object.entries(group[1]))
                if(name in Keybinds)
                    this.keybindScenes.push(this.addScene(new KeybindScene(text, Keybinds[name as keyof typeof Keybinds])));
        }
    }

    resized(oldDims:Vector, newDims = oldDims) {
        this.dims.replace(newDims);
        let unit = Math.min(newDims.x / 16, newDims.y / 9);

        let currPos = 0;
        for (let i = 0; i < this.keybindScenes.length; i++) {
            let scene = this.keybindScenes[i]!;
            if (scene instanceof KeybindScene) {
                scene.dims.replace(newDims.x, unit);
                scene.pos.replace(0, currPos);
            } else if (scene instanceof Divider) {
                scene.dims.replace(newDims.x, unit * 0.7);
                scene.pos.replace(unit / 2, currPos);
            }
            scene.pos.y -= this.offs;

            currPos += scene.dims.y + unit * 0.2;
        }

        this.scrollLimits.max = Math.max.apply(null, this.subScenes.map(s => s.pos.y + (s.dims ? s.dims.y : 0)))
            - this.dims.y * 0.9 + this.offs;

        super.resized(oldDims, newDims);
    }

    scrolled(x:number, y:number, delta:number) {
        delta *= this.dims.x * 0.0007;
        return super.scrolled(x, y, delta);
    }
}
