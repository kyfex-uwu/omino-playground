import {ClippedScene, DimsScene, hover, OneTimeButtonScene, Scene} from "omino/scene/Scene.js";
import Vector from "omino/Vector.js";
import data from "omino/Global.js";
import {background, fill, stroke} from "omino/Colors.js";
import UploadColorfile from "omino/scene/settings/UploadColorfile.js";
import {KeybindsScene} from "omino/scene/settings/keybinds/KeybindsScene.js";
import ChangelogScene from "omino/scene/settings/ChangelogScene.js";
import type MainScene from "omino/scene/MainScene.js";
import MiscSettingsScene from "omino/scene/settings/MiscSettingsScene.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";

class CustomClippedContainer extends ClippedScene(DimsScene<any>) {
    private inner: Scene<any>;
    constructor(scene:Scene<any>) {
        super();
        this.addScene(scene);
        this.inner = scene;
    }

    resized(oldDims:Vector, newDims = oldDims) {
        this.dims.replace(newDims);
        let unit = Math.min(newDims.x / 16, newDims.y / 9);

        this.pos.replace(unit / 2, unit * 2.2);
        this.dims.replace(newDims.sub(new Vector(unit, this.pos.y)));

        this.inner.resized(this.dims, this.dims);
    }
}

class SettingsContainerScene extends DimsScene<any> {
    private mainScene: MainScene;
    private backButton: OneTimeButtonScene<Scene<any>>;
    private bugreport: OneTimeButtonScene<Scene<any>>;
    private colorfile: OneTimeButtonScene<Scene<any>>;
    private tabButtons: OneTimeButtonScene<Scene<any>>[];
    private bgOffs: number=0;
    private activeTab: { name: string; scene: Scene<any> };
    private viewsource: OneTimeButtonScene<Scene<any>>;
    constructor(mainScene:MainScene) {
        super();

        this.mainScene = mainScene;

        const buttonFrame = (s:OneTimeButtonScene<any>, env:AnyEnhancedEnv) => {
            fill(s.isIn() ? "scenes.settings.buttons.dark.bgHover" : "scenes.settings.buttons.dark.bg", env);
            env.sRect(0, 0, s.dims.x, s.dims.y, Math.min(s.dims.x, s.dims.y) * 0.1);
            fill("scenes.settings.buttons.dark.text", env);
        }

        this.backButton = this.addScene(new OneTimeButtonScene((s, env) => {
            buttonFrame(s, env);

            env.save();
            env.translate(s.dims.x * 0.47, s.dims.y * 0.55);
            env.scale(s.dims.x / 100,s.dims.x / 100);
            env.beginPath();

            env.moveTo(-15, 3);
            env.lineTo(-35, -12);
            env.lineTo(-15, -27);
            env.lineTo(-15, -17);
            env.lineTo(8, -17);
            env.bezierCurveTo(35, -17, 42, -9, 30, 17);
            env.lineTo(25, 27);
            env.lineTo(17, 27);
            env.bezierCurveTo(33, -7, 27, -6, 5, -8);
            env.lineTo(-15, -8);

            env.fill();
            env.restore();

            if (s.isIn()) hover.set("Back", s);
        }, () => {
            data.scene = this.mainScene;
            this.mainScene.resized(new Vector(data.env.width(), data.env.height()), new Vector(data.env.width(), data.env.height()));
        }));

        this.bugreport = this.addScene(new OneTimeButtonScene((s, env) => {
            buttonFrame(s, env);

            env.save();
            env.translate(s.dims.x * 0.5, s.dims.y * 0.5);
            env.scale(s.dims.x / 100, s.dims.x / 100);

            env.beginPath();
            env.moveTo(-2, -10);
            env.lineTo(-22, -10);
            env.bezierCurveTo(-20, 30, -12, 40, -2, 40);
            env.fill();
            env.beginPath();
            env.moveTo(2, -10);
            env.lineTo(22, -10);
            env.bezierCurveTo(20, 30, 12, 40, 2, 40);
            env.fill();

            env.beginPath();
            env.moveTo(-19, -13);
            env.bezierCurveTo(-16, -40, 16, -40, 19, -13);
            env.fill();

            env.lineWidth=5;
            stroke("scenes.settings.buttons.dark.text", env);
            env.moveTo(-10, -20);
            env.bezierCurveTo(-12, -30, -13, -36, -20, -40);
            env.moveTo(-10, -20);
            env.bezierCurveTo(12, -30, 13, -36, 20, -40);
            env.stroke();

            env.singleLine(-10, 5, -30, 0);
            env.singleLine(-30, 0, -35, -15);
            env.singleLine(10, 5, 30, 0);
            env.singleLine(30, 0, 35, -15);

            env.singleLine(-10, 20, -25, 28);
            env.singleLine(-25, 28, -30, 35);
            env.singleLine(10, 20, 25, 28);
            env.singleLine(25, 28, 30, 35);

            env.singleLine(-10, 12, -35, 16);
            env.singleLine(10, 12, 35, 16);

            env.restore();
            if (s.isIn()) hover.set("Bug Report", s);
        }, () => {
            window.open("https://discord.gg/e5spvrgN9B", '_blank')?.focus();
        }));
        this.viewsource = this.addScene(new OneTimeButtonScene((s, env) => {
            buttonFrame(s, env);

            env.save();
            env.translate(s.dims.x * 0.5, s.dims.y * 0.5);
            env.scale(s.dims.x / 100, s.dims.x / 100);

            env.lineWidth=7;
            stroke("scenes.settings.buttons.dark.text", env);
            env.lineCap="round"
            env.singleLine(-40,0,-30,17);
            env.singleLine(-40,0,-30,-17);
            env.singleLine(40,0,30,17);
            env.singleLine(40,0,30,-17);
            env.lineCap="butt"
            env.singleLine(-30,17,-20,35);
            env.singleLine(-30,-17,-20,-35);
            env.singleLine(30,17,20,35);
            env.singleLine(30,-17,20,-35);
            env.singleLine(6,-40,-8,40);

            env.restore();
            if (s.isIn()) hover.set("View Source", s);
        }, () => {
            window.open("https://github.com/kyfex-uwu/omino-playground/tree/typescript", '_blank')?.focus();
        }));

        this.colorfile = this.addScene(new OneTimeButtonScene((s, env) => {
            buttonFrame(s, env);

            env.save();
            env.translate(s.dims.x * 0.5, s.dims.y * 0.5);
            env.scale(s.dims.x / 100, s.dims.x / 100);
            env.translate(0, -3);

            env.beginPath();
            env.lineTo(-3, -0);
            env.bezierCurveTo(-6, 13, -10, 30, -5, 46);
            env.bezierCurveTo(-3, 48, 3, 48, 5, 46);
            env.bezierCurveTo(10, 30, 6, 13, 3, 0);
            env.bezierCurveTo(2, -3, -2, -3, -3, 0);
            env.fill();

            env.beginPath();
            env.lineTo(0, -5);
            env.bezierCurveTo(-5, -5, -9, -9, -9, -14);
            env.bezierCurveTo(-6, -19, -4, -21, 1, -18);
            env.bezierCurveTo(4, -16, 4, -15, 10, -17);
            env.bezierCurveTo(9, -9, 5, -5, 0, -5);
            env.fill();

            env.translate(0, -1);
            env.beginPath();
            env.lineTo(-10, -16);
            env.bezierCurveTo(-6, -21, -4, -23, 1, -20);
            env.bezierCurveTo(4, -18, 4, -17, 10, -19);
            env.bezierCurveTo(9, -30, 0, -40, -3, -40);
            env.bezierCurveTo(1, -26, -9, -26, -10, -16);
            env.fill();

            env.restore();
            if (s.isIn()) hover.set("Use Colorfile", s);
        }, () => {
            data.scene = new UploadColorfile(this);
        }));

        this.tabButtons = [
            {name: "Keybinds", scene: new KeybindsScene()},
            {name: "Changelog", scene: new ChangelogScene()},
            {name: "Misc", scene: new MiscSettingsScene()},
        ].map(bData => {
            return this.addScene(new OneTimeButtonScene((s, env) => {
                fill(s.isIn() ? "scenes.settings.buttons.dark.bgHover" : "scenes.settings.buttons.dark.bg",env);
                env.rect(0, 0, s.dims.x, s.dims.y);
                fill("scenes.settings.buttons.dark.text", env);
                env.setFontSize(s.dims.y * 0.8);
                env.spFillText(bData.name, s.dims.x / 2, s.dims.y / 2, {align:"center",baseline:"middle"});
            }, () => {
                this.activeTab.scene.remove();
                this.activeTab = {...bData};
                this.activeTab.scene = new CustomClippedContainer(bData.scene);
                this.addScene(this.activeTab.scene);
                if (this.dims) this.activeTab.scene.resized(this.dims, this.dims);
            }));
        });
        this.activeTab = {scene: new Scene(), name:""};
        this.tabButtons[0]?.click(0,0);

        this.resized(new Vector(data.env.width(), data.env.height()), new Vector(data.env.width(), data.env.height()));
    }

    resized(oldDims:Vector, newDims = oldDims) {
        this.dims.replace(newDims);
        let unit = Math.min(newDims.x / 16, newDims.y / 9);

        this.backButton.pos.replace(unit * 0.2, unit * 0.2);
        this.backButton.dims.replace(unit * 1.2, unit * 1.2);
        this.bugreport.pos.replace(unit * 1.5, unit * 0.2);
        this.bugreport.dims.replace(unit * 1.2, unit * 1.2);
        this.viewsource.pos.replace(unit * 2.8, unit * 0.2);
        this.viewsource.dims.replace(unit * 1.2, unit * 1.2);
        this.colorfile.pos.replace(this.dims.x - unit * 1.4, unit * 0.2);
        this.colorfile.dims.replace(unit * 1.2, unit * 1.2);

        let unit2 = (newDims.x - newDims.y * 0.01) / this.tabButtons.length;
        for (let i = 0; i < this.tabButtons.length; i++) {
            let tabButton = this.tabButtons[i]!;
            tabButton.pos.replace(newDims.y * 0.01 + unit2 * i, unit * 1.6);
            tabButton.dims.replace(unit2 - newDims.y * 0.01, unit * 0.5);
        }

        super.resized(oldDims, newDims);
    }

    render(env:AnyEnhancedEnv) {
        background("scenes.settings.bg.0", env);
        fill("scenes.settings.bg.1", env);
        this.bgOffs = (this.bgOffs + 0.2) % 100;
        env.save();
        env.translate(0, this.bgOffs);
        for (let y = -1; y < env.height() / 100; y++) {
            for (let x = -1; x < env.width() / 100; x++) {
                if ((x + 1) % 2 == (y + 1) % 2) continue;
                env.save();
                env.translate(x * 100+50, y * 100+50);
                //env.scale(Math.sin((x*5+this.bgOffs*0.4)*0.1)*0.5+1);
                const newScale=Math.sin((x*100+this.bgOffs)*0.01 + (y*100+this.bgOffs)*0.005 + data.elapsed*0.0003)*0.4+1
                env.scale(newScale,newScale);
                env.beginPath();
                env.moveTo(0, -40);
                env.lineTo(40, 0);
                env.lineTo(0, 40);
                env.lineTo(-40, 0);
                env.fill();
                env.restore();
            }
        }
        env.restore();

        super.render(env);
        hover.draw(env);
    }
}

export default SettingsContainerScene;
