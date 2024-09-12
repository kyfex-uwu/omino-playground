import Vector from "/assets/omino/Vector.js";
import { DimsScene } from "/assets/omino/scene/Scene.js";
import { LockedOmino } from "/assets/omino/Omino.js";
import {fill} from "/assets/omino/Colors.js";

class BoardScene extends DimsScene {
    constructor(board, drawMouse=true) {
        super();
        this.board = board;
        this.drawMouse=drawMouse;

        this.clickListener=_=>0;
    }
    quickResize() {
        this.dims = new Vector(this.board.width, this.board.height).scale(this.board.renderData.scale);
    }
    render() {
        p5.push();

        p5.fill(0);
        p5.beginClip();
        p5.push();
        let pos=this.getAbsolutePos();
        p5.translate(-pos.x,-pos.y);
        p5.rect(0,0,p5.width,p5.height*2/3);
        p5.pop();
        p5.endClip();

        p5.translate(-this.dims.x/2,-this.dims.y/2);

        let palette=(this.parent.paletteScene||{}).palette;
        let cursorPos=this.getAbsolutePos().sub(this.dims.scale(0.5));
        this.board.render(cursorPos, {palette, mouse:this.drawMouse});
        if(this.board.torusMode){
            let padding=Math.min(this.dims.x,this.dims.y)/Math.max(this.board.width,this.board.height)*0.1;

            for(let y=-1;y<=1;y++){
                for(let x=-1;x<=1;x++){
                    if(x==0&&y==0) continue;

                    p5.push();
                    p5.translate((this.dims.x+padding)*x,(this.dims.y+padding)*y);
                    this.board.render(new Vector(0,0), {palette, mouse:false});
                    fill("board.torusIndicator");
                    p5.rect(0,0,this.dims.x,this.dims.y);
                    p5.pop();
                }
            }
        }
        p5.pop();
        this.quickResize();
    }
    setBounds(width, height) {
        this.board.renderData.scale = Math.min(width / this.board.width, height / this.board.height);
        if(this.board.torusMode) this.board.renderData.scale*=0.7;
    }
    moveToCenter() {
        this.pos = new Vector(p5.width / 2, p5.height*2/3/2);
    }

    mouseUp(x, y) {
        x = Math.floor((x+this.dims.x/2) / this.board.renderData.scale);
        y = Math.floor((y+this.dims.y/2) / this.board.renderData.scale);
        if(x < 0 || x >= this.board.width || y < 0 || y >= this.board.height) return false;

        return this.clickListener(x,y);
    }
}

export default BoardScene;