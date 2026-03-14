import Vector from "omino/Vector.js";
import {ButtonScene, DimsScene, ScrollableScene} from "omino/scene/Scene.js";
import {fill} from "omino/Colors.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";
import type Board from "omino/Board.js";
import {type BoardRenderEnv, type NodeGroup, SelectableElement} from "omino/pathfinding/elements/Element.js";

class PaletteSpace extends ButtonScene<any> {
    private elementGenerator: (nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup) => SelectableElement|void;
    private drawFunc: (nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup) => void;
    private board: Board;
    constructor(el:((nodes:NodeGroup, env:BoardRenderEnv, historicalNodes:NodeGroup)=>SelectableElement|void),
                draw:(nodes:NodeGroup, env:BoardRenderEnv, historicalNodes:NodeGroup)=>void,
                board:Board) {
        super();
        this.elementGenerator = el;
        this.drawFunc = draw;
        this.board=board;
    }

    render(env:AnyEnhancedEnv) {
        fill(this.isIn() ? "scenes.sidebar.button.bgHover" : "scenes.sidebar.button.bg", env);
        env.sRect(this.dims.x * 0.05, this.dims.y * 0.05, this.dims.x * 0.9, this.dims.y * 0.9, this.dims.x * 0.1);

        env.save();
        env.scale(this.dims.x/100,this.dims.y/100);
        env.translate(50,50);
        env.beginPath();
        env.sRect(-42, -42, 84,84, 8);
        env.clip();
        this.drawFunc(...this.board.getRenderingData(env));
        env.restore();
    }

    click(x:number, y:number) {
        const result = this.elementGenerator(...this.board.getRenderingData());
        if(result instanceof SelectableElement)
            this.board.cursor.heldElement = result;
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
    private board: Board;
    constructor(board:Board) {
        super({min: 0});

        this.board=board;

        board.addListener("elements", (board) => this.recalcBits(
            ...board.getRenderingData()
        ));
        setTimeout(()=>this.recalcBits(
            ...board.getRenderingData()
        ),0);//top 10 worst things ever: using setTimeout to fix your problems 2: electric boogaloo
    }

    recalcBits(nodes:NodeGroup, env:BoardRenderEnv, historicalNodes:NodeGroup){
        this.subScenes.length=0;
        for(const el of this.board.elements){
            const toAdd = el.palette(nodes, env, historicalNodes)
                .map(data=>new PaletteSpace(data.el, data.draw, this.board));
            for(const add of toAdd) this.addScene(add);
        }

        this.resized(this.dims);
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
    private board: Board;
    constructor(board:Board) {
        super();
        this.board=board;
        this.piecesHolder = new PieceHolder(board);
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

    mouseUp(x: number, y: number, button: number): boolean {
        if(this.isIn())
            this.board.getRenderingData()[1].cursor.heldElement=undefined;
        return super.mouseUp(x, y, button);
    }

    render(env:AnyEnhancedEnv) {
        fill("scenes.sidebar.bg", env);
        env.fillRect(0, 0, this.dims.x, this.dims.y);

        super.render(env);
    }
}

export default PaletteScene;
