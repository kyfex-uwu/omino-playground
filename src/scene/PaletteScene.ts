import Vector from "omino/Vector.js";
import Scene, {ButtonScene, DimsScene, hover, OneTimeButtonScene, ScrollableScene} from "omino/scene/Scene.js";
import data from "omino/Global.js";
import {background, fill} from "omino/Colors.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";
import type {Env, NodeGroup} from "omino/pathfinding/elements/Element.js";

class PaletteSpace extends ButtonScene<any> {
    private elementGenerator: () => Element;
    private drawFunc: (env: AnyEnhancedEnv) => void;
    constructor(el:(()=>Element), draw:(env:AnyEnhancedEnv)=>void) {
        super();
        this.elementGenerator = el;
        this.drawFunc = draw;
    }

    render(env:AnyEnhancedEnv) {
        fill(this.isIn() ? "scenes.sidebar.button.bgHover" : "scenes.sidebar.button.bg", env);
        env.sRect(this.dims.x * 0.05, this.dims.y * 0.05, this.dims.x * 0.9, this.dims.y * 0.9, this.dims.x * 0.1);

        env.save();
        env.translate(this.dims.x/2, this.dims.y/2);
        env.scale(100/(this.dims.x*0.9), 100/(this.dims.y*0.9));
        env.beginPath();
        env.rect(0, 0, this.dims.x, this.dims.y);
        env.clip();
        this.drawFunc(env);
        env.restore();
    }

    click(x:number, y:number) {
        // this.parent.parent.parent.mouseData.omino = this.elementGenerator()
        // let scale = this.parent.parent.parent.boardScene.board.renderData.scale;
        // this.parent.parent.parent.mouseData.offs =
        //     new Vector(scale * this.omino.tiles[0].length / 2, scale * this.omino.tiles.length / 2);
        return true;
    }

    recalc() {
        const scale = this.parent!.dims.x / 3;
        const index = this.parent!.spaces().indexOf(this);

        this.pos.replace(index % 3 * scale, Math.floor(index / 3) * scale);
        this.dims.replace(scale, scale);
    }
}

class PieceHolder extends ScrollableScene<any> {
    declare subScenes:PaletteSpace[];
    constructor() {
        super({min: 0});
    }

    resized(oldDims:Vector, newDims = oldDims) {
        const unit = this.dims.x / 3;
        for (let i = 0; i < this.subScenes.length; i++) {
            const child = this.subScenes[i]!;
            child.pos.replace(i % 3 * unit, Math.floor(i / 3) * unit);
            child.dims.replace(unit, unit);
        }

        this.scrollLimits.max = Math.ceil((this.subScenes.length - 1) / 3) * unit - this.dims.y;

        return super.resized(oldDims, newDims);
    }

    spaces(){
        return this.subScenes;
    }
}

class PaletteScene extends DimsScene<any> {
    private piecesHolder: PieceHolder;
    constructor() {
        super();
        this.piecesHolder = new PieceHolder();
        this.addScene(this.piecesHolder);
    }

    resized(oldDims:Vector, newDims = oldDims) {
        this.pos.x = newDims.x * 3 / 4;
        this.dims.replace(newDims.x / 4, newDims.y);

        // let scale = this.dims.x / 100;
        // let sbSize = Math.min(this.dims.x / 3, scale * 30);

        // this.drawButton.dims = new Vector(sbSize * 0.8, sbSize * 0.8);
        // this.drawButton.pos = new Vector((this.dims.x - sbSize * 0.9) / 2, this.dims.y - sbSize * 0.9);

        this.piecesHolder.dims.replace(this.dims.x, this.dims.y);

        super.resized(oldDims, newDims);
    }

    // setSpaces(newOmino) {
    //     let space = this.piecesHolder.addScene(new PaletteSpace(newOmino, this.spaces.length));
    //     this.spaces.push(space);
    //     space.recalc(this);
    // }

    render(env:AnyEnhancedEnv) {
        fill("scenes.sidebar.bg", env);
        env.fillRect(0, 0, this.dims.x, this.dims.y);

        super.render(env);
    }
}

export default PaletteScene;
