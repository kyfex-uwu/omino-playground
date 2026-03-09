import {DimsScene, OneTimeButtonScene, Scene} from "omino/scene/Scene.js";
import Vector from "omino/Vector.js";
import {keybindGroups, PressKeyScene} from "omino/scene/settings/keybinds/KeybindsScene.js";
import {background, fill} from "omino/Colors.js";
import data from "omino/Global.js";
import type KeybindScene from "omino/scene/settings/keybinds/KeybindScene.js";
import type {Keybind} from "omino/Keybinds.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";

let keybindNames:{[key:string]:string};

export default class ChangeKeysScene extends Scene<any> {
    private backScreen: Scene<never>;
    private keybind: Keybind;
    private confButton: OneTimeButtonScene<Scene<any>>;
    private addButton: OneTimeButtonScene<Scene<any>>;
    private rawKeys: {button:DimsScene<any>,text:string}[];
    constructor(backScreen:Scene<never>, keybindScene:KeybindScene) {
        if (!keybindNames) {
            keybindNames = {};
            for (const group of keybindGroups)
                for (const [key, val] of Object.entries(group[1]))
                    keybindNames[key] = val;
        }

        super();
        this.backScreen = backScreen;
        this.keybind = keybindScene.keybind;
        this.rawKeys = [];

        this.backScreen.hasMouseAccess = false;

        const button = (s:OneTimeButtonScene<any>, env:AnyEnhancedEnv, text:string) => {
            fill(s.isIn() ? "scenes.settings.buttons.light.bgHover" : "scenes.settings.buttons.light.bg", env);
            data.env.rect(0, 0, s.dims.x, s.dims.y);
            fill("scenes.settings.buttons.light.text", env);
            data.env.setFontSize(s.dims.y * 0.9);
            data.env.spFillText(text, s.dims.x / 2, s.dims.y / 2,{align:"center",baseline:"middle"});
        };
        this.confButton = this.addScene(new OneTimeButtonScene((s, env) => {
            button(s, env, "Confirm");
        }, s => {
            data.scene = this.backScreen;
            this.backScreen.hasMouseAccess = true;
            keybindScene.reload();
            this.backScreen.resized(new Vector(data.env.width(), data.env.height()));
        }));
        this.addButton = this.addScene(new OneTimeButtonScene((s, env) => {
            button(s, env, "Add");
        }, s => {
            data.scene = new PressKeyScene(this, this.backScreen, this.keybind);
        }));

        this.reload();
    }

    reload() {
        for (const scene of this.rawKeys)
            this.subScenes.splice(this.subScenes.indexOf(scene.button), 1);

        const button = (s:OneTimeButtonScene<any>, text:string) => {
            fill(s.isIn() ? "scenes.settings.buttons.light.bgHover" : "scenes.settings.buttons.light.bg", data.env);
            data.env.rect(0, 0, s.dims.x, s.dims.y);
            fill("scenes.settings.buttons.light.text", data.env);
            data.env.setFontSize(s.dims.y * 0.9);
            data.env.spFillText(text, s.dims.x / 2, s.dims.y / 2,{align:"center",baseline:"middle"});
        };

        this.rawKeys = [];
        for (const key of this.keybind.values) {
            this.rawKeys.push({
                text:key,
                button:this.addScene(new OneTimeButtonScene(s => {
                    button(s, key);
                }, () => {
                    this.keybind.remove(key);
                    this.reload();
                }))
            });
        }

        this.resized(new Vector(data.env.width(), data.env.height()));
    }

    resized(oldDims:Vector, newDims = oldDims) {
        this.backScreen.resized(oldDims, newDims);

        data.env.setFontSize(newDims.y * 0.05);
        let padding = newDims.y * 0.006;

        this.confButton.dims.replace(data.env.measureText("mConfirm").width, data.env.getFontSize() * 1.1);
        this.addButton.dims.replace(data.env.measureText("mAdd").width, data.env.getFontSize() * 1.1);

        let w = this.confButton.dims.x + this.addButton.dims.x + padding;
        this.confButton.pos.replace((newDims.x + w) / 2 - this.confButton.dims.x, newDims.y * 0.6);
        this.addButton.pos.replace((newDims.x - w) / 2, newDims.y * 0.6);

        w = 0;
        for (const key of this.rawKeys) {
            key.button.dims.replace(data.env.measureText(key.text + "m").width, data.env.getFontSize() * 1.1);
            w += key.button.dims.x + padding;
        }
        let x = (newDims.x - w) / 2;
        for (const key of this.rawKeys) {
            key.button.pos.replace(x, newDims.y * 0.45);
            x += key.button.dims.x + padding;
        }

        super.resized(oldDims, newDims);
    }

    render(env:AnyEnhancedEnv) {
        this.backScreen.render(env);
        background([0,0,0,100], env);

        env.setFontSize(env.height() * 0.07);
        fill("scenes.settings.modal.bg", env);
        let w = env.measureText(keybindNames[this.keybind.name] + "m").width;
        env.rect((env.width() - w) / 2, env.height() / 3 - env.getFontSize() * 1.1, w, env.getFontSize() * 1.2);
        fill("scenes.settings.modal.text", env);
        env.spFillText(keybindNames[this.keybind.name]!, env.width() / 2, env.height() / 3, {align:"center",baseline:"bottom"});

        super.render(env);
    }
}
