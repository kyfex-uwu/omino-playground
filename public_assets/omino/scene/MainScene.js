import Vector from "/assets/omino/Vector.js";
import {DimsScene, focus, hover, Scene} from "/assets/omino/scene/Scene.js";
import OptionsScene from "/assets/omino/scene/OptionsScene.js";
import {background} from "/assets/omino/Colors.js";
import Element from "/assets/omino/pathfinding/elements/Element.js";
import {Keybinds} from "/assets/omino/Keybinds.js";
import paletteScene from "/assets/omino/scene/PaletteScene.js";

export class BoardContainer extends DimsScene {
    constructor(parent) {
        super();
        this.parent = parent;
        this.parent.board.elementsListeners.push(_ => this.onElementsChange());

        this.dragging = false;
        this.shouldUnhold = false;

        this.env = {};
        this.setEnv();
        this.applyData = {};
        this.apply();
        this.center = new Vector(0,0);

        this.settings=[];

        this.deletingEls=[];
    }

    resized(oldDims, newDims = oldDims) {
        this.dims = new Vector(newDims.x/2,newDims.y);
    }

    mouseUp(x, y) {
        this.clicked = this.dragging ? this.dragging.orig.distTo(this.dragging.curr) < 10 : true;
        this.dragging = false;
    }

    mouseDown(x, y) {
        if (!this.isIn()) return false;
        this.dragging = {
            orig: new Vector(x, y),
            curr: new Vector(x, y),
            delta: new Vector(0, 0),
        };
        return true;
    }

    onElementsChange() {
        setTimeout(_=>this.apply(), 0);//alright
    }

    setEnv() {
        let newEnv = {
            container: this,
            board: this.parent.board,
            mouse: {
                dragging: this.dragging,
                clicked: this.clicked,
                pos: new Vector(p5.mouseX, p5.mouseY),
            },
            cursor: this.parent.cursor
        };
        Object.assign(this.env, newEnv);
    }

    unHold() {
        this.shouldUnhold = true;
    }

    apply() {
        this.applyData.historicalNodes = {};
        this.applyData.nodes = Element.apply(this.parent.board.elements,
            this.env, this.applyData.historicalNodes);
    }

    render() {
        if(Keybinds.DEL.isReleased() && this.parent.cursor.heldElement){
            this.deletingEls.push({
                el: this.parent.cursor.heldElement,
                timer:0,
                //speed:Math.random()*0.6*(Math.random()>0.5?-1:1),
                pos:this.env.mouse.pos.clone()
            });
            //this.parent.cursor.heldElement.onMouse=false;
            this.parent.cursor.heldElement=undefined;
        }

        if (this.dragging) {
            let pos = new Vector(p5.mouseX, p5.mouseY).sub(this.pos);
            this.dragging.delta = pos.sub(this.dragging.curr);
            this.dragging.curr = pos;
        }

        let shouldUpdate=false;
        for(const element of this.parent.board.elements){
            if(element.needsUpdate){
                element.needsUpdate=false;
                shouldUpdate=true;
            }
        }
        if(shouldUpdate) {
            this.apply();
            for (const l of this.parent.board.elementsListeners) l(this);
            this.parent.board.recalcPath();
        }

        this.setEnv();
        Element.render(this.parent.board.elements, this.applyData.nodes, this.applyData.historicalNodes, this.env);
        this.pos = new Vector(p5.width/4,0).add(this.dims.sub(this.center.scale(2)).scale(0.5))

        for(const data of this.deletingEls){
            let modifiedEnv = Object.assign(Object.assign({}, this.env), {
                mouse: {
                    dragging: this.dragging,
                    clicked: this.clicked,
                    pos: new Vector(0,0)
                },
            });
            p5.push();
            p5.beginClip();
            for(let i=0;i<p5.height;i+=p5.width*0.04){
                p5.rect(0,i,p5.width,p5.width*0.04*(1-data.timer**3));
            }
            p5.endClip();
            p5.translate(data.pos.x, data.pos.y);
            data.el.drawAtMouse(this.applyData.nodes, modifiedEnv, this.applyData.historicalNodes);
            p5.pop();

            data.timer+=0.08;
            if(data.timer>1) data.remove=true;
        }
        this.deletingEls=this.deletingEls.filter(val=>!val.remove);

        if (this.parent.cursor.heldElement) {
            this.parent.cursor.heldElement.drawAtMouse(this.applyData.nodes, this.env, this.applyData.historicalNodes);
        }
        if (this.shouldUnhold) {
            this.parent.cursor.heldElement = undefined;
            this.shouldUnhold = false;
        }

        this.clicked = false;
    }
}

class MainScene extends Scene {
    constructor({board} = {}) {
        super();

        this.board = board;

        this.cursor = {
            heldElement: undefined,
        };

        this.optionsScene = this.addScene(new OptionsScene(this.board));
        this.paletteScene = this.addScene(new paletteScene(this.board));
        this.boardContainer = this.addScene(new BoardContainer(this));
    }

    render() {
        background("bg");
        super.render();
        hover.draw();
    }
}

export default MainScene;
