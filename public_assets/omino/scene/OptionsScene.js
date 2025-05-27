import {
    DimsScene,
    hover,
    isKindaMobile,
    OneTimeButtonScene,
    Scene,
    ScrollableScene
} from "/assets/omino/scene/Scene.js";
import SettingsContainerScene from "/assets/omino/scene/settings/SettingsContainerScene.js";
import Vector from "/assets/omino/Vector.js";
import Data from "/assets/omino/Main.js";
import {toLink} from "/assets/omino/Options.js";
import {background, fill, stroke} from "/assets/omino/Colors.js";
import {BoardContainer} from "/assets/omino/scene/MainScene.js";
import Element from "/assets/omino/pathfinding/elements/Element.js";
import settingsParser from "/assets/omino/scene/SettingsParser.js";

//--

class ShareImageScene extends Scene {
    constructor(mainScene) {
        super();
        this.mainScene = mainScene;

        this.board = new BoardContainer(mainScene);
    }

    render() {
        this.mainScene.render();
        background("scenes.share.darken");

        fill("scenes.share.bg");
        stroke("scenes.share.outline");
        p5.strokeWeight((p5.height + p5.width) * 0.005);
        p5.rect(p5.width * 0.2, p5.height * 0.2, p5.width * 0.6, p5.height * 0.6, (p5.height + p5.width) * 0.01);
        p5.noStroke();
        fill("scenes.share.outline");
        p5.textSize((p5.height + p5.width) * 0.01);
        p5.rect(p5.width / 2 - p5.textWidth("Click to copy") * 1.4 / 2, p5.height * 0.2 - p5.textSize() * 1.8,
            p5.textWidth("Click to copy") * 1.4, p5.textSize() * 2, (p5.height + p5.width) * 0.003);
        fill("scenes.share.text");
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.text("Click to copy", p5.width / 2, p5.height * 0.2 - p5.textSize() * 0.7);

        const smallestDim = Math.min(p5.width * 0.6*0.9*2, p5.height * 0.6*0.9*2);
        this.board.resized(new Vector(smallestDim,smallestDim));
        p5.push();
        p5.translate(
            p5.width * 0.2 + p5.width * 0.6 / 2 - smallestDim/4,
            p5.height * 0.2 + p5.height * 0.6 / 2 - smallestDim/4);
        this.board.render();
        p5.pop();
    }

    mouseUp() {
        const canv = p5.createGraphics(510,510);
        canv.noStroke();
        background("scenes.share.bg", canv);
        canv.push();
        canv.translate(5, 5);
        this.board.resized(new Vector(1000,1000));
        const oldP5=p5;
        p5=canv;
        this.board.render();
        p5=oldP5;
        canv.pop();

        let infoText = Element.infoText(this.board.parent.board.elements);
        canv.textSize(15);

        fill("scenes.share.bg", canv);
        canv.rect(0, canv.height - canv.textSize()-4,
            canv.textWidth(infoText + "n"), canv.textSize() + 4);
        canv.rect(canv.width - canv.textWidth("https://kyfexuwu.com/omino-playground"+"n"), canv.height - canv.textSize()-4,
            canv.width, canv.textSize() + 4);

        fill("scenes.share.infoText", canv);
        canv.textAlign(p5.LEFT, p5.BOTTOM);
        canv.text(infoText, 6, canv.height - 2);
        canv.textAlign(p5.RIGHT, p5.BOTTOM);
        canv.text("https://kyfexuwu.com/omino-playground", canv.width - 4, canv.height - 2);

        canv.elt.toBlob(blob => {
            navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);
            canv.remove();
        });

        Data.scene = this.mainScene;
        this.mainScene.hasMouseAccess = true;
        return true;
    }

    resized(oldDims, newDims) {
        super.resized(oldDims, newDims);
        this.mainScene.resized(oldDims, newDims);
    }
}

const barButtonWrapper = s => {
    fill(s.isIn() ? "scenes.buttons.dark.bgHover" : "scenes.buttons.dark.bg");
    p5.rect(0, 0, s.dims.x, s.dims.y, (s.dims.x + s.dims.y) * 0.1);
};

class Bar extends DimsScene {
    constructor(...subScenes) {
        super();
        for (const scene of subScenes) this.addScene(scene);
    }

    render() {
        fill("scenes.sidebar.bg");
        p5.rect(0, 0, this.dims.x, this.dims.y);

        super.render();
    }
}

class OptionsHolder extends ScrollableScene {
    constructor(board) {
        super({min: 0});

        this.submit = this.addScene(new OneTimeButtonScene(self => {
            fill("scenes.util.button."+(self.isIn()?"bgHover":"bg"));
            p5.rect(0,0,self.dims.x, self.dims.y);
            fill("scenes.util.button.color");
            p5.textSize(self.dims.y*0.9);
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.text("Submit", self.dims.x/2,self.dims.y/2);
        },(self, x, y) => {
            for(const setting of this.settings){
                setting.submit();
            }
        }));

        this.settings=[];
        this.board=board;
        this.board.elementsListeners.push(_ => this.recalcSettings());
        setTimeout(_=>this.recalcSettings(),0);//top 10 worst things ever: using setTimeout to fix your problems
    }

    resized(oldDims, newDims=oldDims) {
        p5.textSize(newDims.x*0.1);
        this.submit.dims = new Vector(p5.textWidth("nSubmitn"), newDims.x*0.12);

        super.resized(oldDims, newDims);
        this.recalcSize();
    }

    recalcSize() {
        let y=0;
        for(const setting of this.settings){
            setting.pos = new Vector(0,y);
            y+=setting.dims.y;
        }
        this.submit.pos = new Vector((this.dims.x-this.submit.dims.x)/2,y+this.dims.x*0.1);
        this.scrollLimits.max = Math.max.apply(null, this.subScenes.map(s => s.pos.add(s.dims).y));
    }

    recalcSettings(){
        this.subScenes=[];
        this.settings=[];
        for(const el of this.board.elements){
            const toAdd = (el.settings()||[]).map(setting => settingsParser(setting));
            for(const add of toAdd)
                this.addScene(add,false);
            this.settings.push(...toAdd);
        }
        this.addScene(this.submit);

        this.resized(this.dims);
    }
}

class OptionsScene extends DimsScene {
    constructor(board) {
        super();
        this.pos.z = 10;

        //the thing that holds everything
        this.options = this.addScene(new OptionsHolder(board));

        //bottom bar
        this.bottomBar = this.addScene(new Bar(
            new OneTimeButtonScene(s => {
                barButtonWrapper(s);

                let arrOffs = s.isIn() ? 5 : 0;
                fill("scenes.buttons.dark.icon");
                p5.translate(s.dims.x * 0.45, s.dims.y * 0.45);
                p5.scale(s.dims.x / 100);
                p5.beginShape();
                p5.vertex(10 + arrOffs, -20);
                p5.vertex(35 + arrOffs, 0);
                p5.vertex(10 + arrOffs, 20);
                p5.vertex(10 + arrOffs, 5);
                p5.bezierVertex(-10, 5, -20, 10, -30, 23);
                p5.bezierVertex(-20, 0, -10, -5, 10 + arrOffs, -5);
                p5.endShape();

                if (s.isIn()) hover.set("Share Image", s);
            }, s => {
                Data.scene = new ShareImageScene(Data.scene);
            }),//share image
            new OneTimeButtonScene(s => {
                barButtonWrapper(s);

                stroke("scenes.buttons.dark.icon");
                p5.strokeWeight(6);
                p5.noFill();
                p5.translate(s.dims.x * 0.5, s.dims.y * 0.5);
                p5.scale(s.dims.x / 100);
                p5.push();
                if (s.isIn()) p5.rotate(-0.07);

                p5.line(-10, -10, -25, -10);
                p5.line(-10, 10, -25, 10);
                p5.arc(-25, 0, 20, 20, Math.PI / 2, Math.PI * 3 / 2);
                p5.arc(-10, 0, 20, 20, Math.PI / 3, Math.PI / 2);
                p5.arc(-10, 0, 20, 20, Math.PI * 3 / 2, Math.PI * 5 / 3);

                p5.line(10, -10, 25, -10);
                p5.line(10, 10, 25, 10);
                p5.arc(25, 0, 20, 20, Math.PI * 3 / 2, Math.PI * 5 / 2);
                p5.arc(10, 0, 20, 20, Math.PI / 2, Math.PI * 2 / 3);
                p5.arc(10, 0, 20, 20, Math.PI * 4 / 3, Math.PI * 3 / 2);

                p5.line(-15, 0, 15, 0);

                p5.pop();
                p5.noStroke();

                if (s.isIn()) hover.set("Share Link", s);
            }, s => {
                navigator.clipboard.write([
                    new ClipboardItem({
                        'text/plain': toLink(Data.scene.boardScene.board,
                            (Data.scene.paletteScene || {palette: nullPalette}).palette)
                    })
                ]);
            }),//share link
        ));

        //top bar
        this.settingsBar = this.addScene(new Bar(
            new OneTimeButtonScene(s => {
                barButtonWrapper(s);
                if (s.isIn()) hover.set("Settings", s);

                p5.translate(s.dims.x * 0.5, s.dims.y * 0.5);
                p5.scale(s.dims.x / 100);
                stroke("scenes.buttons.dark.icon");
                p5.strokeWeight(12);
                p5.noFill();
                p5.ellipse(0, 0, 43, 43);
                p5.noStroke();

                p5.push();
                if (s.isIn()) p5.rotate(0.2);
                for (let i = 0; i < 6; i++) {
                    fill("scenes.buttons.dark.icon");
                    p5.beginShape();
                    p5.vertex(-10, -25);
                    p5.vertex(-7, -37);
                    p5.vertex(7, -37);
                    p5.vertex(10, -25);
                    p5.endShape();

                    p5.rotate(Math.PI * 2 / 6);
                }
                p5.pop();
            }, s => {
                Data.scene = new SettingsContainerScene(Data.scene);
            }),
            new OneTimeButtonScene(s => {
                if (s.isIn()) hover.set("Toggle Fullscreen", s);

                barButtonWrapper(s);
                p5.translate(s.dims.x * 0.5, s.dims.y * 0.5);
                p5.scale(s.dims.x / 50);

                stroke("scenes.buttons.dark.icon");
                p5.strokeWeight(3);
                p5.line(-15, -10, -8, -5);
                p5.line(15, -10, 8, -5);
                p5.line(-15, 10, -8, 5);
                p5.line(15, 10, 8, 5);
                p5.noStroke();

                fill("scenes.buttons.dark.icon");
                if (Data.isFullscreened) {
                    if (s.isIn()) p5.scale(0.9);
                    p5.triangle(-4, -2, -12, -2, -6, -9);
                    p5.triangle(4, -2, 12, -2, 6, -9);
                    p5.triangle(-4, 2, -12, 2, -6, 9);
                    p5.triangle(4, 2, 12, 2, 6, 9);
                } else {
                    if (s.isIn()) p5.scale(1.1);
                    p5.triangle(-19, -13, -17, -5, -11, -13);
                    p5.triangle(19, -13, 17, -5, 11, -13);
                    p5.triangle(-19, 13, -17, 5, -11, 13);
                    p5.triangle(19, 13, 17, 5, 11, 13);
                }
            }, s => {
                Data.isFullscreened = !Data.isFullscreened;
                p5.windowResized();
                window.scroll({
                    top: Data.canvElt.getBoundingClientRect().y - document.body.getBoundingClientRect().y -
                        (p5.windowHeight - p5.height) / 2, behavior: "instant"
                });
            })
        ));
    }

    getScale() {
        let scale = this.dims.x / 100;
        if (isKindaMobile) scale *= 1.5;
        return scale;
    }

    resized(old, n = old) {
        const oldDims = this.dims;
        this.dims = new Vector(n.x/4, n.y);

        let sbSize = Math.min(this.dims.x / 3, this.getScale() * 30);

        this.settingsBar.dims = new Vector(this.dims.x, sbSize);
        this.settingsBar.subScenes[0].dims = new Vector(sbSize * 0.8, sbSize * 0.8);
        this.settingsBar.subScenes[1].dims = new Vector(sbSize * 0.8, sbSize * 0.8);
        this.settingsBar.subScenes[0].pos = new Vector(sbSize * 0.1, sbSize * 0.1);
        this.settingsBar.subScenes[1].pos = new Vector(
            this.dims.x - this.settingsBar.subScenes[1].dims.x - sbSize * 0.1, sbSize * 0.1);

        this.options.pos = new Vector(0, sbSize);
        this.options.dims = new Vector(this.dims.x, this.dims.y - sbSize * 2);

        this.bottomBar.pos = new Vector(0, this.dims.y - sbSize);
        this.bottomBar.dims = new Vector(this.dims.x, sbSize);
        this.bottomBar.subScenes[0].dims = new Vector(sbSize * 0.8, sbSize * 0.8);
        this.bottomBar.subScenes[0].pos = new Vector(this.dims.x / 2 + sbSize * 0.1, sbSize * 0.1);
        this.bottomBar.subScenes[1].dims = new Vector(sbSize * 0.8, sbSize * 0.8);
        this.bottomBar.subScenes[1].pos = new Vector(this.dims.x / 2 - sbSize - sbSize * 0.1, sbSize * 0.1);

        super.resized(oldDims, this.dims);
    }

    render() {
        fill("scenes.sidebar.bg");
        p5.rect(0, 0, this.dims.x, p5.height);

        super.render();
    }
}

export default OptionsScene;
