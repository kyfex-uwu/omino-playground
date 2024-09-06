import Vector from "/assets/omino/Vector.js";
import Board from "/assets/omino/Board.js"
import { DimsScene } from "/assets/omino/scene/Scene.js";
import { LockedOmino } from "/assets/omino/Omino.js";

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
        this.board.render(this.getAbsolutePos(), {palette:(this.parent.paletteScene||{}).palette, mouse:this.drawMouse});
        this.quickResize();
    }
    setBounds(width, height) {
        this.board.renderData.scale = Math.min(width / this.board.width, height / this.board.height);
    }
    moveToCenter() {
        this.pos = new Vector(p5.width / 2 - this.board.renderData.scale * this.board.width / 2, 10);
    }

    mouseUp(x, y) {
        x = Math.floor(x / this.board.renderData.scale);
        y = Math.floor(y / this.board.renderData.scale);
        if(x < 0 || x >= this.board.width || y < 0 || y >= this.board.height) return false;

        return this.clickListener(x,y);
    }
}

export default BoardScene;