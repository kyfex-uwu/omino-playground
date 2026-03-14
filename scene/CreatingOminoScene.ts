import Scene, {DimsScene} from "omino/scene/Scene.js";
import type Element from "omino/pathfinding/elements/Element.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";
import {background} from "omino/Colors.js";
import Vector from "omino/Vector.js";
import data from "omino/Global.js";
import type MainScene from "omino/scene/MainScene.js";

export default class CreatingOminoScene extends Scene<never>{
    private cursorHolder: { heldElement: Element | undefined };
    private parentScene: MainScene;
    private modal: DimsScene<any>;
    constructor(scene:MainScene, cursor: { heldElement: Element | undefined },
                innerScene:(close:()=>void)=>DimsScene<any>) {
        super();
        this.cursorHolder = cursor;
        this.parentScene = scene;
        scene.hasMouseAccess=false;

        this.addScene(this.modal = innerScene(()=>{
            data.scene = this.parentScene;
            this.parentScene.hasMouseAccess=true;
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
