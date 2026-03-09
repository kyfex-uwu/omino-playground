import {
    DimsScene,
    hover,
    isKindaMobile,
    OneTimeButtonScene,
    Scene,
    ScrollableScene
} from "omino/scene/Scene.js";
import SettingsContainerScene from "omino/scene/settings/SettingsContainerScene.js";
import Vector from "omino/Vector.js";
import data from "omino/Global.js"
import {background, fill, stroke} from "omino/Colors.js";
import {BoardContainer} from "omino/scene/MainScene.js";
import Element from "omino/pathfinding/elements/Element.js";
import settingsParser, {LabeledScene} from "omino/scene/SettingsParser.js";
import MainScene from "omino/scene/MainScene.js";
import type Board from "omino/Board.js";
import {windowResized} from "omino/Main.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";

//--

class ShareImageScene extends Scene<never> {
    private mainScene: Scene<never>;
    private board: BoardContainer;
    constructor(mainScene:MainScene) {
        super();
        this.mainScene = mainScene;

        this.board = new BoardContainer(mainScene);
    }

    render(env:AnyEnhancedEnv) {
        this.mainScene.render(env);
        background("scenes.share.darken", env);

        fill("scenes.share.bg", env);
        stroke("scenes.share.outline", env);
        env.lineWidth = (env.height() + env.width()) * 0.005;
        env.sRect(env.width() * 0.2,
            env.height() * 0.2,
            env.width() * 0.6,
            env.height() * 0.6,
            (env.height() + env.width()) * 0.01);
        env.stroke();
        env.lineWidth=0;
        fill("scenes.share.outline", env);
        env.setFontSize((env.height() + env.width()) * 0.01);
        env.sRect(env.width() / 2 - env.measureText("Click to copy").width * 1.4 / 2,
            env.height() * 0.2 - env.getFontSize() * 1.8,
            env.measureText("Click to copy").width * 1.4, env.getFontSize() * 2,
            (env.height() + env.width()) * 0.003);
        fill("scenes.share.text", env);
        env.spFillText("Click to copy", env.width() / 2, env.height() * 0.2 - env.getFontSize() * 0.7,
            {align:"center", baseline:"middle"});

        const smallestDim = Math.min(env.width() * 0.6*0.9*2, env.height() * 0.6*0.9*2);
        this.board.resized(new Vector(smallestDim,smallestDim));
        env.save();
        env.translate(
            env.width() * 0.2 + env.width() * 0.6 / 2 - smallestDim/4,
            env.height() * 0.2 + env.height() * 0.6 / 2 - smallestDim/4);
        this.board.render();
        env.restore();
    }

    mouseUp() {
        const newEnv = data.env.tempGraphics(510,510);
        newEnv.lineWidth=0;
        background("scenes.share.bg", newEnv);
        newEnv.save();
        newEnv.translate(5, 5);
        this.board.resized(new Vector(1000,1000));
        this.board.render(newEnv);
        newEnv.restore();

        let infoText = Element.infoText(this.board.parent!.board.elements, {
            elements:this.board.parent!.board.elements,
            board:this.board.parent!.board,
        });
        newEnv.setFontSize(15);

        fill("scenes.share.bg", newEnv);
        newEnv.rect(0, newEnv.height() - newEnv.getFontSize()-4,
            newEnv.measureText(infoText + "n").width, newEnv.getFontSize() + 4);
        newEnv.rect(newEnv.width() - newEnv.measureText("https://kyfexuwu.com/omino-playground"+"n").width, newEnv.height() - newEnv.getFontSize()-4,
            newEnv.width(), newEnv.getFontSize() + 4);

        fill("scenes.share.infoText", newEnv);
        newEnv.spFillText(infoText, 6, newEnv.height() - 2, {align:"left",baseline:"bottom"});
        newEnv.spFillText("https://kyfexuwu.com/omino-playground", newEnv.width() - 4, newEnv.height() - 2,{align:"right",baseline:"bottom"});

        newEnv.canvas.convertToBlob().then((blob:Blob)=>{
            navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);
        })

        data.scene = this.mainScene;
        this.mainScene.hasMouseAccess = true;
        return true;
    }

    resized(oldDims:Vector, newDims=oldDims) {
        super.resized(oldDims, newDims);
        this.mainScene.resized(oldDims, newDims);
    }
}

const barButtonWrapper = (s:DimsScene<any>, env:AnyEnhancedEnv) => {
    fill(s.isIn() ? "scenes.buttons.dark.bgHover" : "scenes.buttons.dark.bg", env);
    env.sRect(0, 0, s.dims.x, s.dims.y, (s.dims.x + s.dims.y) * 0.1);
};

class Bar extends DimsScene<any> {
    subScenes:DimsScene<any>[]=[];
    constructor(...subScenes:DimsScene<any>[]) {
        super();
        for (const scene of subScenes) this.addScene(scene);
    }

    render(env:AnyEnhancedEnv) {
        fill("scenes.sidebar.bg", env);
        env.rect(0, 0, this.dims.x, this.dims.y);

        super.render(env);
    }
}

class OptionsHolder extends ScrollableScene<any> {
    private submit: OneTimeButtonScene<Scene<any>>;
    private readonly settings: LabeledScene<any>[] = [];
    private board: Board;
    constructor(board:Board) {
        super({min: 0});

        this.submit = this.addScene(new OneTimeButtonScene((self, env) => {
            fill("scenes.util.button."+(self.isIn()?"bgHover":"bg"), env);
            env.fillRect(0,0,self.dims.x, self.dims.y);
            fill("scenes.util.button.color", env);
            env.setFontSize(self.dims.y*0.9);
            env.spFillText("Submit", self.dims.x/2,self.dims.y/2, {align:"center", baseline:"middle"});
        },(self, x, y) => {
            for(const setting of this.settings){
                setting.submit(null);
            }
        }));

        this.board=board;
        this.board.elementsListeners.push(_ => this.recalcSettings());
        setTimeout(()=>this.recalcSettings(),0);//top 10 worst things ever: using setTimeout to fix your problems
    }

    resized(oldDims:Vector, newDims=oldDims) {
        data.env.setFontSize(newDims.x*0.1);
        this.submit.dims.replace(data.env.measureText("nSubmitn").width, newDims.x*0.12);

        super.resized(oldDims, newDims);
        this.recalcSize();
    }

    recalcSize() {
        let y=0;
        for(const setting of this.settings){
            setting.pos.replace(0,y);
            y+=setting.dims.y;
        }
        this.submit.pos.replace((this.dims.x-this.submit.dims.x)/2,y+this.dims.x*0.1);
        this.scrollLimits.max = Math.max.apply(null, this.subScenes.map(s =>
            //lying!!! gotta look into why this happens
            s instanceof DimsScene ? s.pos.add(s.dims).y : 0));
    }

    recalcSettings(){
        this.subScenes.length=0;
        this.settings.length=0;
        for(const el of this.board.elements){
            const toAdd = (el.settings()||[]).map(setting => settingsParser(setting))
                .filter(val=>val!==undefined);
            for(const add of toAdd) this.addScene(add);
            this.settings.push(...toAdd);
        }
        this.addScene(this.submit);

        this.resized(this.dims);
    }

    render(env:AnyEnhancedEnv) {
        super.render(env);
    }
}

class OptionsScene extends DimsScene<any> {
    private options: OptionsHolder;
    private bottomBar: Bar;
    private settingsBar: Bar;
    constructor(board:Board) {
        super();
        this.pos.z = 10;

        //the thing that holds everything
        this.options = this.addScene(new OptionsHolder(board));

        //bottom bar
        this.bottomBar = this.addScene(new Bar(
            new OneTimeButtonScene((s, env) => {
                barButtonWrapper(s, env);

                let arrOffs = s.isIn() ? 5 : 0;
                fill("scenes.buttons.dark.icon", env);
                env.translate(s.dims.x * 0.45, s.dims.y * 0.45);
                env.scale(s.dims.x / 100, s.dims.x / 100);
                env.beginPath();
                env.moveTo(10 + arrOffs, -20);
                env.lineTo(35 + arrOffs, 0);
                env.lineTo(10 + arrOffs, 20);
                env.lineTo(10 + arrOffs, 5);
                env.bezierCurveTo(-10, 5, -20, 10, -30, 23);
                env.bezierCurveTo(-20, 0, -10, -5, 10 + arrOffs, -5);
                env.fill();

                if (s.isIn()) hover.set("Share Image", s);
            }, () => {
                if(data.scene instanceof MainScene)
                    data.scene = new ShareImageScene(data.scene);
            }),//share image
            new OneTimeButtonScene((s, env) => {
                barButtonWrapper(s, env);

                stroke("scenes.buttons.dark.icon", env);
                env.lineWidth=6;
                env.translate(s.dims.x * 0.5, s.dims.y * 0.5);
                env.scale(s.dims.x / 100, s.dims.x / 100);
                env.save();
                env.lineCap="round";
                if (s.isIn()) env.rotate(-0.07);

                env.singleLine(-10, -10, -25, -10);
                env.singleLine(-10, 10, -25, 10);
                env.singleArc(-25, 0, 10, Math.PI / 2, Math.PI * 3 / 2);
                env.stroke();
                env.singleArc(-10, 0, 10, Math.PI / 3, Math.PI / 2);
                env.stroke();
                env.singleArc(-10, 0, 10, Math.PI * 3 / 2, Math.PI * 5 / 3);
                env.stroke();

                env.singleLine(10, -10, 25, -10);
                env.singleLine(10, 10, 25, 10);
                env.singleArc(25, 0, 10, Math.PI * 3 / 2, Math.PI * 5 / 2);
                env.stroke();
                env.singleArc(10, 0, 10, Math.PI / 2, Math.PI * 2 / 3);
                env.stroke();
                env.singleArc(10, 0, 10, Math.PI * 4 / 3, Math.PI * 3 / 2);
                env.stroke();

                env.singleLine(-15, 0, 15, 0);

                env.restore();
                env.lineWidth=0;

                if (s.isIn()) hover.set("Share Link", s);
            }, () => {
                // if(data.scene instanceof MainScene)
                //     navigator.clipboard.write([
                //         new ClipboardItem({
                //             'text/plain': toLink(data.scene.boardContainer.board,
                //                 (data.scene.paletteScene || {palette: nullPalette}).palette)
                //         })
                //     ]);
            }),//share link
        ));

        //top bar
        this.settingsBar = this.addScene(new Bar(
            new OneTimeButtonScene((s, env) => {
                barButtonWrapper(s, env);
                if (s.isIn()) hover.set("Settings", s);

                env.translate(s.dims.x * 0.5, s.dims.y * 0.5);
                env.scale(s.dims.x / 100,s.dims.x / 100);
                stroke("scenes.buttons.dark.icon", env);
                env.lineWidth=12;
                env.beginPath();
                env.singleArc(0, 0, 21, 0,Math.PI*2);
                env.stroke();

                env.save();
                if (s.isIn()) env.rotate(0.2);
                for (let i = 0; i < 6; i++) {
                    fill("scenes.buttons.dark.icon", env);
                    env.beginPath();
                    env.moveTo(-10, -25);
                    env.lineTo(-7, -37);
                    env.lineTo(7, -37);
                    env.lineTo(10, -25);
                    env.fill();

                    env.rotate(Math.PI * 2 / 6);
                }
                env.restore();
            }, () => {
                if(data.scene instanceof MainScene)
                    data.scene = new SettingsContainerScene(data.scene);
            }),
            new OneTimeButtonScene((s, env) => {
                if (s.isIn()) hover.set("Toggle Fullscreen", s);

                barButtonWrapper(s, env);
                env.translate(s.dims.x * 0.5, s.dims.y * 0.5);
                env.scale(s.dims.x / 50,s.dims.x / 50);
                env.lineCap="round";

                stroke("scenes.buttons.dark.icon", env);
                env.lineWidth=3;
                env.singleLine(-15, -10, -8, -5);
                env.singleLine(15, -10, 8, -5);
                env.singleLine(-15, 10, -8, 5);
                env.singleLine(15, 10, 8, 5);

                fill("scenes.buttons.dark.icon", env);
                if (data.isFullscreened) {
                    if (s.isIn()) env.scale(0.9,0.9);
                    env.polygon([-4, -2], [-12, -2], [-6, -9]);
                    env.fill();
                    env.polygon([4, -2], [12, -2], [6, -9]);
                    env.fill();
                    env.polygon([-4, 2], [-12, 2], [-6, 9]);
                    env.fill();
                    env.polygon([4, 2], [12, 2], [6, 9]);
                    env.fill();
                } else {
                    if (s.isIn()) env.scale(1.1,1.1);
                    env.polygon([-19, -13], [-17, -5], [-11, -13]);
                    env.fill();
                    env.polygon([19, -13], [17, -5], [11, -13]);
                    env.fill();
                    env.polygon([-19, 13], [-17, 5], [-11, 13]);
                    env.fill();
                    env.polygon([19, 13], [17, 5], [11, 13]);
                    env.fill();
                }
            }, () => {
                data.isFullscreened = !data.isFullscreened;
                windowResized();
                window.scroll({
                    top: data.canvElt.getBoundingClientRect().y - document.body.getBoundingClientRect().y -
                        (window.innerHeight - data.env.height()) / 2, behavior: "instant"
                });
            })
        ));
    }

    getScale() {
        let scale = this.dims.x / 100;
        if (isKindaMobile) scale *= 1.5;
        return scale;
    }

    resized(old:Vector, n = old) {
        const oldDims = this.dims;
        this.dims.replace(n.x/4, n.y);

        let sbSize = Math.min(this.dims.x / 3, this.getScale() * 30);

        this.settingsBar.dims.replace(this.dims.x, sbSize);
        this.settingsBar.subScenes[0]?.dims.replace(sbSize * 0.8, sbSize * 0.8);
        this.settingsBar.subScenes[1]?.dims.replace(sbSize * 0.8, sbSize * 0.8);
        this.settingsBar.subScenes[0]?.pos.replace(sbSize * 0.1, sbSize * 0.1);
        this.settingsBar.subScenes[1]?.pos.replace(
            this.dims.x - this.settingsBar.subScenes[1].dims.x - sbSize * 0.1, sbSize * 0.1);

        this.options.pos.replace(0, sbSize);
        this.options.dims.replace(this.dims.x, this.dims.y - sbSize * 2);

        this.bottomBar.pos.replace(0, this.dims.y - sbSize);
        this.bottomBar.dims.replace(this.dims.x, sbSize);
        this.bottomBar.subScenes[0]?.dims.replace(sbSize * 0.8, sbSize * 0.8);
        this.bottomBar.subScenes[0]?.pos.replace(this.dims.x / 2 + sbSize * 0.1, sbSize * 0.1);
        this.bottomBar.subScenes[1]?.dims.replace(sbSize * 0.8, sbSize * 0.8);
        this.bottomBar.subScenes[1]?.pos.replace(this.dims.x / 2 - sbSize - sbSize * 0.1, sbSize * 0.1);

        super.resized(oldDims, this.dims);
    }

    render(env:AnyEnhancedEnv) {
        fill("scenes.sidebar.bg", env);
        env.fillRect(0, 0, this.dims.x, env.height());

        super.render(env);
    }
}

export default OptionsScene;
