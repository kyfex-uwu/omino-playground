import {background, fill, loadColors, loadColorScript} from "omino/Colors.js";
import {DimsScene, OneTimeButtonScene, Scene} from "omino/scene/Scene.js";
import Vector from "omino/Vector.js";
import data from "omino/Global.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";

const builtins = [
    {
        name: "Default",
        link: "default.js"
    },
    {
        name: "High Contrast",
        link: "high_contrast.js"
    },
];

class UploadColorfile extends Scene<any> {
    private mainScene: Scene<never>;
    private cancelButton: OneTimeButtonScene<Scene<any>>;
    private resetButton: OneTimeButtonScene<Scene<any>>;
    private builtinButtons: {name:string, button:DimsScene<any>}[];
    private dropZone=document.createElement("span");
    private hasFile=false;
    constructor(mainScene:Scene<never>) {
        super();
        this.mainScene = mainScene;
        this.mainScene.hasMouseAccess = false;

        const button = (s:OneTimeButtonScene<any>, env:AnyEnhancedEnv, text:string, mult = 0.9) => {
            fill(s.isIn() ? "scenes.settings.buttons.light.bgHover" : "scenes.settings.buttons.light.bg", env);
            data.env.sRect(0, 0, s.dims.x, s.dims.y, s.dims.y * 0.3);
            fill("scenes.settings.buttons.light.text", env);
            data.env.setFontSize(s.dims.y * mult);
            data.env.spFillText(text, s.dims.x / 2, s.dims.y / 2, {align:"center",baseline:"middle"});
        };

        this.cancelButton = this.addScene(new OneTimeButtonScene((s, env) => button(s, env, "Close"), () => {
            this.close();
        }));
        this.resetButton = this.addScene(new OneTimeButtonScene((s, env) => button(s, env, "Reset"), () => {
            localStorage.removeItem("Colorfile");
            loadColors({});
        }));
        this.builtinButtons = [];
        for (const data of builtins) {
            this.builtinButtons.push({
                name:data.name,
                button:this.addScene(new OneTimeButtonScene((s, env) => button(s, env, data.name, 0.6),
                    () => fetch("/assets/omino/colorfiles/" + data.link).then(s => this.parseFile(s))))
            });
        }

        this.resized(new Vector(data.env.width(), data.env.height()), new Vector(data.env.width(), data.env.height()));

        Object.assign(this.dropZone.style, {
            "z-index": 999,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
        });
        document.body.appendChild(this.dropZone);
        this.dropZone.addEventListener("dragover", e => {
            e.preventDefault();
            this.hasFile = true;
        });
        this.dropZone.addEventListener("dragleave", _ => this.hasFile = false);
        this.dropZone.addEventListener("drop", e => {
            e.preventDefault();
            if(e.dataTransfer!==null&&e.dataTransfer.files[0]!==undefined)
                this.parseFile(e.dataTransfer.files[0]);
        });
    }

    close() {
        data.scene = this.mainScene;
        this.dropZone.remove();
        this.mainScene.hasMouseAccess = true;
    }

    render(env:AnyEnhancedEnv) {
        this.mainScene.render(env);
        background(this.hasFile ? "scenes.settings.hasFile" : "scenes.settings.darken", env);
        fill("scenes.settings.modal.bg", env);
        env.setFontSize(env.width() * 0.03);
        let message = "Drag and drop the colorfile, or\nclick to open your file explorer";
        let width = env.measureText(message).width;
        env.rect((env.width() - width * 1.1) / 2, env.height() / 2 - env.getFontSize() * 4, width * 1.1, env.getFontSize() * 3);
        fill("scenes.settings.modal.text", env);
        env.spFillText(message, env.width() / 2, env.height() / 2 - env.width() * 0.04, {align:"center",baseline:"bottom"});
        super.render(env);
    }

    mouseUp(x:number, y:number) {
        if (super.mouseUp(x, y)) return true;

        const filePicker = document.createElement("input");
        filePicker.type = "file";
        filePicker.accept = ".js";
        filePicker.addEventListener("change", _ => {
            if(filePicker.files!==null && filePicker.files[0] !== undefined)
                this.parseFile(filePicker.files[0]);
        });
        filePicker.click();
        return true;
    }

    async parseFile(file:{text:()=>Promise<string>}) {
        const script = await file.text();
        localStorage.setItem("Colorfile", script);
        loadColorScript(script, orig => {
            orig();
            this.close();
        });
        return true;
    }

    resized(oldDims:Vector, newDims=oldDims) {
        this.mainScene.resized(oldDims, newDims);

        this.cancelButton.dims.replace(data.env.width() / 6, data.env.width() / 6 * 0.3);
        this.cancelButton.pos.replace(data.env.width() / 2 - data.env.width() / 6 / 2, data.env.height() * 0.5);
        this.resetButton.dims.replace(data.env.width() / 6, data.env.width() / 6 * 0.3);
        this.resetButton.pos.replace(data.env.width() / 2 - data.env.width() / 6 / 2, data.env.height() * 0.5 + this.cancelButton.dims.y * 1.1);

        let width = 0;
        const padding = data.env.height() * 0.01;
        data.env.setFontSize(data.env.width() * 0.035);
        for (const button of this.builtinButtons) {
            button.button.dims.replace(data.env.measureText(button.name).width, data.env.width() / 6 * 0.3);
            width += button.button.dims.x + padding;
        }
        let pos = (data.env.width() - width) / 2;
        for (const button of this.builtinButtons) {
            button.button.pos.replace(pos, this.resetButton.getAbsolutePos().y + this.resetButton.dims.y * 1.1);
            pos += button.button.dims.x + padding;
        }

        super.resized(oldDims, newDims);
    }
}

export default UploadColorfile;
