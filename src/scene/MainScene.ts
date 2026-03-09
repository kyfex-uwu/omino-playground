import Vector from "omino/Vector.js";
import {DimsScene, focus, hover, OneTimeButtonScene, Scene} from "omino/scene/Scene.js";
import OptionsScene from "omino/scene/OptionsScene.js";
import {background, fill} from "omino/Colors.js";
import Element, {type NodeGroup, type RenderEnv, SelectableElement} from "omino/pathfinding/elements/Element.js";
import {Keybinds} from "omino/Keybinds.js";
import type Board from "omino/Board.js";
import data from "omino/Global.js"
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";
// import PaletteScene from "omino/scene/PaletteScene.js";

export class BoardContainer extends DimsScene<MainScene> {
    private dragging:false|{
        orig: Vector
        curr: Vector
        delta: Vector
    }=false;
    private shouldUnhold=false;
    private env: RenderEnv;
    private applyData: {
        historicalNodes:NodeGroup,
        nodes:NodeGroup
    }={
        historicalNodes:undefined!,
        nodes:undefined!,
    };
    center=new Vector(0,0);
    private settings=[];
    private clicked: boolean=false;

    constructor(parent:MainScene) {
        super();

        this.parent = parent;

        parent.board.elementsListeners.push(() => this.onElementsChange());

        this.env=({} as unknown as undefined)!;//todo:fix
        this.setEnv();
        this.apply();
    }

    resized(oldDims:Vector, newDims = oldDims) {
        this.dims.replace(newDims.x/2,newDims.y);
    }

    mouseUp(x:number, y:number) {
        this.clicked = this.dragging ? this.dragging.orig.distTo(this.dragging.curr) < 10 : true;
        this.dragging = false;
        return true;
    }

    mouseDown(x:number, y:number) {
        if (!this.isIn()) return false;
        this.dragging = {
            orig: new Vector(x, y),
            curr: new Vector(x, y),
            delta: new Vector(0, 0),
        };
        return true;
    }

    onElementsChange() {
        setTimeout(()=>this.apply(), 0);//alright
    }

    setEnv(env:AnyEnhancedEnv=data.env) {
        let newEnv = {
            drawData: {
                ...this.env.drawData,
                context:env,
            },
            container: this,
            board: this.parent!.board,
            mouse: {
                dragging: this.dragging,
                clicked: this.clicked,
                pos: new Vector(data.mouseX, data.mouseY),
            },
            cursor: this.parent!.cursor
        };
        Object.assign(this.env, newEnv);
    }

    unHold() {
        this.shouldUnhold = true;
    }

    apply() {
        this.applyData.historicalNodes = {};
        this.applyData.nodes = Element.apply(this.parent!.board.elements,
            this.env, this.applyData.historicalNodes);
    }

    render(env:AnyEnhancedEnv=data.env) {
        if(Keybinds.DEL.isReleased() && this.parent!.cursor.heldElement){
            this.parent!.cursor.heldElement=undefined;
        }

        if (this.dragging) {
            let pos = new Vector(data.mouseX, data.mouseY).sub(this.pos);
            this.dragging.delta = pos.sub(this.dragging.curr);
            this.dragging.curr = pos;
        }

        let shouldUpdate=false;
        for(const element of this.parent!.board.elements){
            if(element.needsUpdate){
                element.needsUpdate=false;
                shouldUpdate=true;
            }
        }
        if(shouldUpdate) {
            this.apply();
            for (const l of this.parent!.board.elementsListeners) l(this.parent!.board);
            this.parent!.board.recalcPath();
        }

        this.setEnv(env);
        Element.render(this.parent!.board.elements, this.applyData.nodes, this.applyData.historicalNodes, this.env);
        this.pos.replace(new Vector(data.env.width()/4,0).add(this.dims.sub(this.center.scale(2)).scale(0.5)));

        if (this.parent!.cursor.heldElement) {
            this.parent!.cursor.heldElement.drawAtMouse(this.applyData.nodes, this.env, this.applyData.historicalNodes);
        }
        if (this.shouldUnhold) {
            this.parent!.cursor.heldElement = undefined;
            this.shouldUnhold = false;
        }

        this.clicked = false;
    }
}

class MainScene extends Scene<never> {
    cursor: { heldElement: SelectableElement|undefined }={heldElement:undefined};
    board: Board;
    private optionsScene: OptionsScene;
    // private paletteScene: PaletteScene;
    public boardContainer: BoardContainer;
    constructor(board:Board) {
        super();

        this.board = board;

        this.optionsScene = this.addScene(new OptionsScene(this.board));
        // this.paletteScene = this.addScene(new PaletteScene(this.board));
        this.boardContainer = this.addScene(new BoardContainer(this));
    }

    render(env:AnyEnhancedEnv) {
        background("bg", env);
        super.render(env);
        hover.draw(env);
    }
}

export default MainScene;
