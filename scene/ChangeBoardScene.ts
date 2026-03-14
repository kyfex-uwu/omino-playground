import MainScene from "omino/scene/MainScene.js";
import Scene, {ButtonScene, DimsScene, hover, OneTimeButtonScene} from "omino/scene/Scene.js";
import type {ConnTree} from "omino/pathfinding/elements/OminoEl.js";
import RectOrientation, {rectOrienDirs, type RectOrienVal} from "omino/pathfinding/orientation/RectOrientation.js";
import {background, fill, stroke} from "omino/Colors.js";
import Vector from "omino/Vector.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";
import RectOminoEl from "omino/pathfinding/elements/RectOminoEl.js";
import type Element from "omino/pathfinding/elements/Element.js";
import data from "omino/Global.js";
import type BoardElement from "omino/pathfinding/boards/BoardElement.js";
import RectBoardEl from "omino/pathfinding/boards/RectBoardEl.js";
import HexBoardEl from "omino/pathfinding/boards/HexBoardEl.js";
import Board from "omino/Board.js";

export class BoardButton extends ButtonScene<any>{
    public boardGenerator;
    private renderFunc: (env: AnyEnhancedEnv, self:BoardButton) => void;
    private name: string;
    constructor(name:string, board:()=>BoardElement, render:(env:AnyEnhancedEnv, self:BoardButton)=>void) {
        super();
        this.boardGenerator=board;
        this.renderFunc=render;
        this.name=name;
    }

    render(env: AnyEnhancedEnv) {
        super.render(env);
        env.save();
        env.scale(this.dims.x/100,this.dims.y/100);
        env.beginPath();
        fill("scenes.changeBoard.button"+(this.isIn()?"Hover":""), env);
        env.roundRect(0,0,100,100,15);
        env.fill();
        env.beginPath();
        env.roundRect(5,5,90,90,10);
        env.clip();
        this.renderFunc(env, this);
        env.restore();

        if(this.isIn()){
            hover.set(this.name, this);
        }
    }
    click(x: number, y: number) {

        data.scene = new MainScene(new Board({
            elements:[this.boardGenerator()]
        }));
        data.scene.resized(new Vector(data.canvElt.width, data.canvElt.height));

        super.click(x, y);
    }
}

export const boardButtons=[
    new BoardButton("Rectangle", ()=>new RectBoardEl(7,7), (env, self)=>{
        if(self.isIn()){
            env.translate(-5,-5);
            env.scale(1/0.9,1/0.9);
        }
        for(let x=0;x<7;x++){
            for(let y=0;y<6;y++){
                const pos = new Vector(x*23-(Math.sin(data.elapsed*0.0005)*23+36),y*23-(data.elapsed*0.01%23)-10);
                fill([pos.x*0.7+128,230,pos.y*0.7+128],env);
                env.sRect(pos.x,pos.y,21,21,4);
            }
        }
    }),
    new BoardButton("Hexagon", ()=>new HexBoardEl([5,5,5,5,5,5]), (env, self)=>{
        if(self.isIn()){
            env.translate(-5,-5);
            env.scale(1/0.9,1/0.9);
        }
        for(let x=0;x<9;x++){
            for(let y=0;y<7;y++){
                const pos = new Vector(12+x*20-(Math.sin(data.elapsed*0.0005)*20+29),12+y*20-(data.elapsed*0.01%20)-10);
                pos.x*=Math.sin(Math.PI/3);
                fill([200, pos.x*0.7,pos.y*0.8+210],env);
                env.beginPath();
                env.ellipse(pos.x,pos.y-(x%2===0?9.5:0),9,9,0,0,Math.PI*2);
                env.fill();
            }
        }
    }),
];

class Inner extends DimsScene<any>{
    constructor() {
        super();
        for(const button of boardButtons)
            this.addScene(button);
    }
    resized(oldDims: Vector, newDims: Vector = oldDims) {
        super.resized(oldDims, newDims);

        let maxWidth = Math.min(Math.floor(3+boardButtons.length*0.3), boardButtons.length, 6);
        let currPos = new Vector(0,0);
        for(let i=0;i<boardButtons.length;i++){
            boardButtons[i]!.pos.replace(currPos.scale(this.dims.y*0.2));
            boardButtons[i]!.dims.replace(this.dims.y*0.19, this.dims.y*0.19);

            currPos.x++;
            if(currPos.x>=maxWidth){
                currPos.x=0;
                currPos.y++;
            }
        }
        for(let i=0;i<boardButtons.length;i++){
            boardButtons[i]!.pos.replace(boardButtons[i]!.pos.add(this.dims.scale(0.5))
                .sub(new Vector(
                    this.dims.y*0.2*maxWidth,
                    this.dims.y*0.2*(Math.ceil(boardButtons.length/maxWidth))
                ).scale(0.5)))

            currPos.x++;
            if(currPos.x>maxWidth){
                currPos.x=0;
                currPos.y++;
            }
        }
    }

    render(env: AnyEnhancedEnv) {
        fill("scenes.changeBoard.modal", env);
        env.sRect(0,0,this.dims.x, this.dims.y, this.dims.y*0.05);
        stroke("scenes.changeBoard.outline", env);
        env.setFontSize(this.dims.y*0.08);
        env.lineWidth=Math.min(this.dims.y*0.02);
        env.stroke();

        fill("scenes.changeBoard.button", env);

        super.render(env);
    }
}

export default class ChangeBoardScene extends Scene<never>{
    private parentScene: MainScene;
    private modal: Inner;
    constructor(scene: MainScene) {
        super();
        this.parentScene=scene;
        scene.hasMouseAccess=false;

        this.addScene(this.modal = new Inner());
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
        background("scenes.changeBoard.darken", env);
        super.render(env);
    }

    mouseDown(x: number, y: number, button: number): boolean {
        if(super.mouseDown(x, y, button)) return true;

        if(!this.modal.isIn()) {
            data.scene = this.parentScene;
            this.parentScene.hasMouseAccess = true;
            console.log("mrp")
        }
        return true;
    }
}
