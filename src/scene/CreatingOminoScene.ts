import Scene, {DimsScene, OneTimeButtonScene} from "omino/scene/Scene.js";
import type Element from "omino/pathfinding/elements/Element.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";
import {background, fill, stroke} from "omino/Colors.js";
import Vector from "omino/Vector.js";
import data from "omino/Global.js";
import OminoEl, {type ConnTree} from "omino/pathfinding/elements/OminoEl.js";
import RectOrientation, {rectOrienDirs, type RectOrienVal} from "omino/pathfinding/orientation/RectOrientation.js";
import type MainScene from "omino/scene/MainScene.js";
import RectOminoEl from "omino/pathfinding/elements/RectOminoEl.js";

class Inner extends DimsScene<any>{
    private tree:ConnTree<any, RectOrienVal>={};
    private submit: OneTimeButtonScene<Scene<any>>;

    constructor(close: () => void) {
        super();

        this.submit = this.addScene(new OneTimeButtonScene((self, env)=>{
            fill("scenes.createOmino.submit"+(self.isIn()?"Hover":""), env);
            env.sRect(0,0,self.dims.x, self.dims.y, self.dims.x*0.1);
            fill("scenes.createOmino.text", env);
            env.spFillText("Create", self.dims.x/2, self.dims.y/2, {align:"center", baseline:"middle"});
        },close));
    }

    resized(oldDims: Vector, newDims: Vector = oldDims) {
        this.submit.dims.replace(this.dims.x*0.25, this.dims.x*0.07);
        this.submit.pos.replace(this.dims.x/2-this.submit.dims.x/2, this.dims.y-this.submit.dims.y);
        super.resized(oldDims, newDims);
    }

    render(env: AnyEnhancedEnv) {
        fill("scenes.createOmino.modal", env);
        env.sRect(0,0,this.dims.x, this.dims.y, this.dims.y*0.05);
        stroke("scenes.createOmino.outline", env);
        env.setFontSize(this.dims.y*0.08);
        env.lineWidth=Math.min(this.dims.y*0.02);
        env.stroke();

        fill("scenes.createOmino.piece", env);
        env.lineWidth = this.dims.x*0.06;
        env.save();
        env.translate(this.dims.x*0.45, this.dims.y*0.5-this.dims.x*0.05);
        this.drawThis(this.tree, env);
        env.restore();

        super.render(env);
    }

    drawThis(tree:ConnTree<any, RectOrienVal>, env:AnyEnhancedEnv){
        env.sRect(this.dims.x*0.01, this.dims.x*0.01, this.dims.x*0.08, this.dims.x*0.08, this.dims.x*0.02);
        for(const sub in rectOrienDirs){
            env.save();
            const translateDir = rectOrienDirs[sub as RectOrienVal].clone().scale(this.dims.x*0.1);
            if(tree[sub as RectOrienVal] !== undefined) {
                env.singleLine(this.dims.x*0.05, this.dims.x*0.05, this.dims.x*0.05+translateDir.x, this.dims.x*0.05+translateDir.y);
                env.translate(translateDir.x, translateDir.y);
                this.drawThis(tree[sub as RectOrienVal]!, env);
            }else{
                env.translate(translateDir.x, translateDir.y);
                env.fillRect(this.dims.x*0.045, this.dims.x*0.02, this.dims.x*0.01, this.dims.x*0.06);
                env.fillRect(this.dims.x*0.02, this.dims.x*0.045, this.dims.x*0.06, this.dims.x*0.01);
            }
            env.restore();
        }
    }

    mouseDown(x: number, y: number, button: number): boolean {
        if(super.mouseDown(x, y, button)) return true;

        const selectedPos = new Vector(x,y).sub(this.dims.scale(0.5)).scale(10/this.dims.x).round();

        const branchesToCheck:[ConnTree<any, RectOrienVal>, Vector][]=[[this.tree, new Vector(0,0)]];
        const maybes:[ConnTree<any, RectOrienVal>, RectOrienVal][] = [];
        while(branchesToCheck.length>0){
            for(const child in rectOrienDirs){
                const newPos = branchesToCheck[0]![1].add(rectOrienDirs[child as RectOrienVal]);
                if(newPos.equals(selectedPos)){
                    maybes.push([branchesToCheck[0]![0], child as RectOrienVal])

                    branchesToCheck.length=0;
                    break;
                }

                if(branchesToCheck[0]![0][child as RectOrienVal] !== undefined)
                    branchesToCheck.push([
                        branchesToCheck[0]![0][child as RectOrienVal]!,
                        newPos
                    ]);
            }

            branchesToCheck.shift();
        }

        if(maybes[0]!==undefined) {
            let changed = false;
            for (const maybe of maybes) {
                if (maybe[0][maybe[1]]) {
                    delete maybe[0][maybe[1]];
                    changed = true;
                    break;
                }
            }
            if (!changed) {
                maybes[0][0][maybes[0][1]] = {};
            }
        }

        return this.isIn();
    }

    getOmino(){
        return new RectOminoEl(this.tree, 0, RectOrientation.up);
    }
}

export default class CreatingOminoScene extends Scene<never>{
    private cursorHolder: { heldElement: Element | undefined };
    private parentScene: MainScene;
    private modal: Inner;
    constructor(scene:MainScene, cursor: { heldElement: Element | undefined }) {
        super();
        this.cursorHolder = cursor;
        this.parentScene = scene;
        scene.hasMouseAccess=false;

        this.addScene(this.modal = new Inner(()=>{
            data.scene = this.parentScene;
            this.parentScene.hasMouseAccess=true;
            const newEl = this.modal.getOmino();
            newEl.onMouse = new Vector(0,0);
            this.parentScene.board.getRenderingData()[1].cursor.heldElement = newEl;
        }));
        this.resized(new Vector(data.canvElt.width, data.canvElt.height))
    }

    resized(oldDims: Vector, newDims: Vector = oldDims) {
        this.parentScene.resized(oldDims, newDims);

        this.modal.dims.replace(new Vector(4,3).scale(Math.min(newDims.x/4, newDims.y/4)*0.9));
        this.modal.pos.replace(newDims.scale(0.5).sub(this.modal.dims.scale(0.5)))

        super.resized(oldDims, newDims);
    }

    render(env: AnyEnhancedEnv) {
        this.parentScene.render(env);
        background("scenes.createOmino.darken", env);
        super.render(env);
    }

    mouseDown(x: number, y: number, button: number): boolean {
        if(super.mouseDown(x, y, button)) return true;

        data.scene = this.parentScene;
        this.parentScene.hasMouseAccess=true;

        return true;
    }
}
